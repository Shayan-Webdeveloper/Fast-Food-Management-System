create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('admin', 'manager', 'customer');
  end if;
end $$;
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('pending', 'preparing', 'ready', 'delivered', 'cancelled');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'customer',
  avatar text,
  restaurant text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric(10,2) not null check (price >= 0),
  description text not null default '',
  image text,
  available boolean not null default true,
  popular boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('ORD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  customer_id uuid not null references public.profiles(id),
  total numeric(10,2) not null check (total >= 0),
  status public.order_status not null default 'pending',
  payment_method text not null check (payment_method in ('card', 'cash')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists orders_customer_id_created_at_idx on public.orders(customer_id, created_at desc);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists notifications_user_id_created_at_idx on public.notifications(user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists menu_items_updated_at on public.menu_items;
create trigger menu_items_updated_at before update on public.menu_items for each row execute function public.set_updated_at();
drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();

-- Signup metadata contains only the display name. Every public signup is a customer.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)),
    upper(left(regexp_replace(coalesce(new.raw_user_meta_data ->> 'full_name', new.email), '\\s+', '', 'g'), 2)));
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'manager'));
$$;
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.notifications enable row level security;

create policy "profiles readable by owner or staff" on public.profiles for select using (id = auth.uid() or public.is_staff());
-- Column grants keep the role server-controlled even when a user updates their profile.
revoke update on public.profiles from authenticated;
grant update (full_name, avatar, restaurant) on public.profiles to authenticated;
create policy "users update their own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "menu is publicly readable" on public.menu_items for select to anon, authenticated using (true);
create policy "staff manage menu" on public.menu_items for all using (public.is_staff()) with check (public.is_staff());
create policy "customers read own orders and staff read all" on public.orders for select using (customer_id = auth.uid() or public.is_staff());
create policy "staff update orders" on public.orders for update using (public.is_staff()) with check (public.is_staff());
create policy "customers read own order items and staff read all" on public.order_items for select using (exists (select 1 from public.orders where orders.id = order_items.order_id and (orders.customer_id = auth.uid() or public.is_staff())));
create policy "users read own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "users update own notifications" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Atomically creates an order using server-side prices; clients never submit totals or prices.
create or replace function public.place_order(p_items jsonb, p_payment_method text)
returns public.orders language plpgsql security definer set search_path = public as $$
declare
  new_order public.orders;
  item jsonb;
  item_id uuid;
  item_quantity integer;
  current_price numeric(10,2);
  order_total numeric(10,2) := 0;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_payment_method not in ('card', 'cash') then raise exception 'Unsupported payment method'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Your cart is empty'; end if;
  for item in select * from jsonb_array_elements(p_items) loop
    item_id := (item ->> 'menu_item_id')::uuid;
    item_quantity := (item ->> 'quantity')::integer;
    if item_quantity is null or item_quantity < 1 then raise exception 'Invalid quantity'; end if;
    select price into current_price from public.menu_items where id = item_id and available = true;
    if current_price is null then raise exception 'An item is unavailable'; end if;
    order_total := order_total + current_price * item_quantity;
  end loop;
  insert into public.orders (customer_id, total, payment_method) values (auth.uid(), order_total, p_payment_method) returning * into new_order;
  for item in select * from jsonb_array_elements(p_items) loop
    item_id := (item ->> 'menu_item_id')::uuid;
    item_quantity := (item ->> 'quantity')::integer;
    select price into current_price from public.menu_items where id = item_id;
    insert into public.order_items (order_id, menu_item_id, quantity, unit_price) values (new_order.id, item_id, item_quantity, current_price);
  end loop;
  return new_order;
end;
$$;
grant execute on function public.place_order(jsonb, text) to authenticated;
