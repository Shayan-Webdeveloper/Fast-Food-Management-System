-- Adds inventory tracking: per-item stock quantity, barcode lookup, and a logged history of changes.
-- track_inventory defaults to false so existing menu items are unaffected until explicitly opted in.

alter table public.menu_items add column if not exists barcode text unique;
alter table public.menu_items add column if not exists stock_quantity integer;
alter table public.menu_items add column if not exists low_stock_threshold integer default 5;
alter table public.menu_items add column if not exists track_inventory boolean not null default false;

create table if not exists public.inventory_logs (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  change_amount integer not null,
  reason text not null check (reason in ('sale', 'restock', 'adjustment', 'waste')),
  note text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists inventory_logs_menu_item_id_idx on public.inventory_logs(menu_item_id);

alter table public.inventory_logs enable row level security;

drop policy if exists "staff manage inventory logs" on public.inventory_logs;
create policy "staff manage inventory logs" on public.inventory_logs
  for all using (public.is_staff()) with check (public.is_staff());
  -- Safely decrements stock for a tracked item and logs the change.
create or replace function public.decrement_stock(p_menu_item_id uuid, p_quantity integer, p_created_by uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  is_tracked boolean;
  current_stock integer;
begin
  select track_inventory, stock_quantity into is_tracked, current_stock
  from public.menu_items
  where id = p_menu_item_id
  for update;

  if not is_tracked then
    return;
  end if;

  if current_stock is null then
    return;
  end if;

  if current_stock < p_quantity then
    raise exception 'Not enough stock for this item';
  end if;

  update public.menu_items
  set stock_quantity = stock_quantity - p_quantity
  where id = p_menu_item_id;

  insert into public.inventory_logs (menu_item_id, change_amount, reason, created_by)
  values (p_menu_item_id, -p_quantity, 'sale', p_created_by);
end;
$$;

-- place_order updated to decrement stock for each item sold.
create or replace function public.place_order(
  p_items jsonb,
  p_payment_method text,
  p_delivery_name text default null,
  p_delivery_phone text default null,
  p_delivery_address text default null
)
 RETURNS orders
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    perform public.decrement_stock(item_id, item_quantity, auth.uid());
  end loop;
  return new_order;
end;
$function$;
-- Order type support: delivery, pickup, or in-store counter sale.
alter table public.orders add column if not exists order_type text not null default 'delivery' check (order_type in ('delivery', 'pickup', 'counter'));
alter table public.orders add column if not exists paid_at timestamptz;

-- place_order updated to accept order_type and mark counter sales as paid immediately.
create or replace function public.place_order(
  p_items jsonb,
  p_payment_method text,
  p_delivery_name text default null,
  p_delivery_phone text default null,
  p_delivery_address text default null,
  p_order_type text default 'delivery'
)
 RETURNS orders
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  new_order public.orders;
  item jsonb;
  item_id uuid;
  item_quantity integer;
  current_price numeric(10,2);
  order_total numeric(10,2) := 0;
  is_staff_order boolean;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_payment_method not in ('card', 'cash') then raise exception 'Unsupported payment method'; end if;
  if p_order_type not in ('delivery', 'pickup', 'counter') then raise exception 'Invalid order type'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Your cart is empty'; end if;

  select public.is_staff() into is_staff_order;
  if p_order_type = 'counter' and not is_staff_order then
    raise exception 'Only staff can create counter orders';
  end if;

  for item in select * from jsonb_array_elements(p_items) loop
    item_id := (item ->> 'menu_item_id')::uuid;
    item_quantity := (item ->> 'quantity')::integer;
    if item_quantity is null or item_quantity < 1 then raise exception 'Invalid quantity'; end if;
    select price into current_price from public.menu_items where id = item_id and available = true;
    if current_price is null then raise exception 'An item is unavailable'; end if;
    order_total := order_total + current_price * item_quantity;
  end loop;

  insert into public.orders (customer_id, total, payment_method, delivery_name, delivery_phone, delivery_address, order_type, paid_at)
  values (
    auth.uid(), order_total, p_payment_method, p_delivery_name, p_delivery_phone, p_delivery_address, p_order_type,
    case when p_order_type = 'counter' then now() else null end
  )
  returning * into new_order;

  for item in select * from jsonb_array_elements(p_items) loop
    item_id := (item ->> 'menu_item_id')::uuid;
    item_quantity := (item ->> 'quantity')::integer;
    select price into current_price from public.menu_items where id = item_id;
    insert into public.order_items (order_id, menu_item_id, quantity, unit_price) values (new_order.id, item_id, item_quantity, current_price);
    perform public.decrement_stock(item_id, item_quantity, auth.uid());
  end loop;

  return new_order;
end;
$function$;
-- Notifies staff when a tracked item's stock drops to or below its low-stock threshold.
create or replace function public.notify_low_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.track_inventory and new.stock_quantity is not null and new.stock_quantity <= new.low_stock_threshold
     and (old.stock_quantity is null or old.stock_quantity > old.low_stock_threshold) then
    insert into public.notifications (user_id, title, message, type)
    select
      p.id,
      'Low stock alert',
      new.name || ' is running low (' || new.stock_quantity || ' left)',
      'alert'
    from public.profiles p
    where p.role in ('admin', 'manager', 'staff');
  end if;
  return new;
end;
$$;

drop trigger if exists on_menu_item_low_stock on public.menu_items;
create trigger on_menu_item_low_stock
after update on public.menu_items
for each row execute function public.notify_low_stock();
-- Notifies staff of any menu item change (name, price, stock, etc.), with special low-stock flagging.
create or replace function public.notify_menu_item_updated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  changes text := '';
  is_low_stock boolean := false;
begin
  if new.name is distinct from old.name then
    changes := changes || 'Name: "' || old.name || '" → "' || new.name || '". ';
  end if;
  if new.category is distinct from old.category then
    changes := changes || 'Category: ' || old.category || ' → ' || new.category || '. ';
  end if;
  if new.price is distinct from old.price then
    changes := changes || 'Price: $' || old.price || ' → $' || new.price || '. ';
  end if;
  if new.description is distinct from old.description then
    changes := changes || 'Description updated. ';
  end if;
  if new.available is distinct from old.available then
    changes := changes || 'Status: ' || (case when new.available then 'now available' else 'now unavailable' end) || '. ';
  end if;
  if new.image_url is distinct from old.image_url then
    changes := changes || 'Photo updated. ';
  end if;
  if new.stock_quantity is distinct from old.stock_quantity then
    changes := changes || 'Stock: ' || coalesce(old.stock_quantity::text, 'none') || ' → ' || coalesce(new.stock_quantity::text, 'none') || '. ';
  end if;
  if new.track_inventory is distinct from old.track_inventory then
    changes := changes || 'Inventory tracking: ' || (case when new.track_inventory then 'enabled' else 'disabled' end) || '. ';
  end if;
  if new.barcode is distinct from old.barcode then
    changes := changes || 'Barcode updated. ';
  end if;

  if new.track_inventory and new.stock_quantity is not null and new.stock_quantity <= new.low_stock_threshold
     and (old.stock_quantity is null or old.stock_quantity > old.low_stock_threshold) then
    is_low_stock := true;
  end if;

  if changes = '' then
    return new;
  end if;

  insert into public.notifications (user_id, title, message, type)
  select
    p.id,
    case when is_low_stock then 'Low stock: ' || new.name else new.name || ' updated' end,
    trim(changes) || (case when is_low_stock then ' ⚠ Only ' || new.stock_quantity || ' left in stock.' else '' end),
    case when is_low_stock then 'alert' else 'info' end
  from public.profiles p
  where p.role in ('admin', 'manager', 'staff');

  return new;
end;
$$;

drop trigger if exists on_menu_item_low_stock on public.menu_items;
drop trigger if exists on_menu_item_updated on public.menu_items;
create trigger on_menu_item_updated
after update on public.menu_items
for each row execute function public.notify_menu_item_updated();
-- Voids a counter sale: reverses stock, logs the adjustment, marks the order cancelled.
create or replace function public.void_counter_order(p_order_id uuid, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  order_row public.orders;
  item_row record;
begin
  if not public.is_staff() then
    raise exception 'Only staff can void orders';
  end if;

  select * into order_row from public.orders where id = p_order_id;
  if order_row is null then
    raise exception 'Order not found';
  end if;
  if order_row.order_type <> 'counter' then
    raise exception 'Only counter sales can be voided this way';
  end if;
  if order_row.status = 'cancelled' then
    raise exception 'Order is already cancelled';
  end if;

  for item_row in
    select oi.menu_item_id, oi.quantity
    from public.order_items oi
    where oi.order_id = p_order_id
  loop
    update public.menu_items
    set stock_quantity = stock_quantity + item_row.quantity
    where id = item_row.menu_item_id and track_inventory = true;

    insert into public.inventory_logs (menu_item_id, change_amount, reason, note, created_by)
    select item_row.menu_item_id, item_row.quantity, 'adjustment', coalesce('Voided order ' || order_row.order_number || (case when p_reason is not null then ': ' || p_reason else '' end), 'Order voided'), auth.uid()
    where exists (select 1 from public.menu_items where id = item_row.menu_item_id and track_inventory = true);
  end loop;

  update public.orders
  set status = 'cancelled'
  where id = p_order_id;
end;
$$;

grant execute on function public.void_counter_order(uuid, text) to authenticated;

-- Discount support on orders: percentage or fixed amount, staff-only.
alter table public.orders add column if not exists discount_type text check (discount_type in ('percent', 'fixed'));
alter table public.orders add column if not exists discount_value numeric(10,2);
alter table public.orders add column if not exists subtotal numeric(10,2);

create or replace function public.place_order(
  p_items jsonb,
  p_payment_method text,
  p_delivery_name text default null,
  p_delivery_phone text default null,
  p_delivery_address text default null,
  p_order_type text default 'delivery',
  p_discount_type text default null,
  p_discount_value numeric default null
)
 RETURNS orders
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  new_order public.orders;
  item jsonb;
  item_id uuid;
  item_quantity integer;
  current_price numeric(10,2);
  order_subtotal numeric(10,2) := 0;
  order_total numeric(10,2) := 0;
  is_staff_order boolean;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_payment_method not in ('card', 'cash') then raise exception 'Unsupported payment method'; end if;
  if p_order_type not in ('delivery', 'pickup', 'counter') then raise exception 'Invalid order type'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Your cart is empty'; end if;

  select public.is_staff() into is_staff_order;
  if p_order_type = 'counter' and not is_staff_order then
    raise exception 'Only staff can create counter orders';
  end if;
  if p_discount_type is not null and not is_staff_order then
    raise exception 'Only staff can apply discounts';
  end if;
  if p_discount_type is not null and p_discount_type not in ('percent', 'fixed') then
    raise exception 'Invalid discount type';
  end if;
  if p_discount_type = 'percent' and (p_discount_value < 0 or p_discount_value > 100) then
    raise exception 'Percentage discount must be between 0 and 100';
  end if;
  if p_discount_type = 'fixed' and p_discount_value < 0 then
    raise exception 'Discount cannot be negative';
  end if;

  for item in select * from jsonb_array_elements(p_items) loop
    item_id := (item ->> 'menu_item_id')::uuid;
    item_quantity := (item ->> 'quantity')::integer;
    if item_quantity is null or item_quantity < 1 then raise exception 'Invalid quantity'; end if;
    select price into current_price from public.menu_items where id = item_id and available = true;
    if current_price is null then raise exception 'An item is unavailable'; end if;
    order_subtotal := order_subtotal + current_price * item_quantity;
  end loop;

  order_total := order_subtotal;
  if p_discount_type = 'percent' then
    order_total := order_subtotal - (order_subtotal * p_discount_value / 100);
  elsif p_discount_type = 'fixed' then
    order_total := greatest(0, order_subtotal - p_discount_value);
  end if;

  insert into public.orders (customer_id, total, subtotal, discount_type, discount_value, payment_method, delivery_name, delivery_phone, delivery_address, order_type, paid_at)
  values (
    auth.uid(), order_total, order_subtotal, p_discount_type, p_discount_value, p_payment_method, p_delivery_name, p_delivery_phone, p_delivery_address, p_order_type,
    case when p_order_type = 'counter' then now() else null end
  )
  returning * into new_order;

  for item in select * from jsonb_array_elements(p_items) loop
    item_id := (item ->> 'menu_item_id')::uuid;
    item_quantity := (item ->> 'quantity')::integer;
    select price into current_price from public.menu_items where id = item_id;
    insert into public.order_items (order_id, menu_item_id, quantity, unit_price) values (new_order.id, item_id, item_quantity, current_price);
    perform public.decrement_stock(item_id, item_quantity, auth.uid());
  end loop;

  return new_order;
end;
$function$;