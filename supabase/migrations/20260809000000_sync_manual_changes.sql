-- Captures all schema changes made directly via the SQL Editor throughout development.
-- Safe to run multiple times.

-- Add 'staff' to the user_role enum (skip if already present)
do $$
begin
  if not exists (
    select 1 from pg_enum
    where enumlabel = 'staff'
    and enumtypid = (select oid from pg_type where typname = 'user_role')
  ) then
    alter type public.user_role add value 'staff';
  end if;
end $$;

-- Add email column to profiles
alter table public.profiles add column if not exists email text;

-- Backfill email from auth.users where missing
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

-- Add notification preferences
alter table public.profiles add column if not exists notification_preferences jsonb default '{"orders": true, "marketing": false, "reports": true}'::jsonb;
alter table public.menu_items add column if not exists image_url text;

-- Add rating, prep-time, and returned tracking to orders
alter table public.orders add column if not exists rating smallint check (rating >= 1 and rating <= 5);
alter table public.orders add column if not exists preparing_at timestamptz;
alter table public.orders add column if not exists ready_at timestamptz;
alter table public.orders add column if not exists returned boolean not null default false;

-- Add delivery details to orders
alter table public.orders add column if not exists delivery_name text;
alter table public.orders add column if not exists delivery_phone text;
alter table public.orders add column if not exists delivery_address text;

-- Update the delete behavior for orders -> profiles: keep order history, detach on user delete
alter table public.orders drop constraint if exists orders_customer_id_fkey;
alter table public.orders add constraint orders_customer_id_fkey
  foreign key (customer_id) references public.profiles(id) on delete set null;

-- Update handle_new_user to set role from signup metadata (with proper enum cast) and include email
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar, email, role)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(new.email, '@', 1)
    ),
    upper(left(coalesce(new.raw_user_meta_data ->> 'full_name', new.email), 2)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'customer')::public.user_role
  );
  return new;
end;
$$;

-- Tighten profiles UPDATE policy so users cannot self-escalate their role
drop policy if exists "users update their own profile" on public.profiles;
create policy "users update their own profile"
on public.profiles
for update
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = (select role from public.profiles where id = auth.uid())
);

-- Allow customers to rate their own delivered orders
drop policy if exists "customers can rate own delivered orders" on public.orders;
create policy "customers can rate own delivered orders"
on public.orders
for update
using (auth.uid() = customer_id and status = 'delivered')
with check (auth.uid() = customer_id and status = 'delivered');

-- Function to safely update notification preferences without full-row RLS conflicts
create or replace function public.update_notification_preferences(prefs jsonb)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_row public.profiles;
begin
  update public.profiles
  set notification_preferences = prefs
  where id = auth.uid()
  returning * into updated_row;
  return updated_row;
end;
$$;
grant execute on function public.update_notification_preferences(jsonb) to authenticated;

-- Update updateOrderStatus flow: place_order now accepts delivery details
create or replace function public.place_order(
  p_items jsonb,
  p_payment_method text,
  p_delivery_name text default null,
  p_delivery_phone text default null,
  p_delivery_address text default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
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
  insert into public.orders (customer_id, total, payment_method, delivery_name, delivery_phone, delivery_address)
  values (auth.uid(), order_total, p_payment_method, p_delivery_name, p_delivery_phone, p_delivery_address)
  returning * into new_order;
  for item in select * from jsonb_array_elements(p_items) loop
    item_id := (item ->> 'menu_item_id')::uuid;
    item_quantity := (item ->> 'quantity')::integer;
    select price into current_price from public.menu_items where id = item_id;
    insert into public.order_items (order_id, menu_item_id, quantity, unit_price) values (new_order.id, item_id, item_quantity, current_price);
  end loop;
  return new_order;
end;
$$;
grant execute on function public.place_order(jsonb, text, text, text, text) to authenticated;