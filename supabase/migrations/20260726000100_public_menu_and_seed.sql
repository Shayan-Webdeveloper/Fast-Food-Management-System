  -- Run this migration after the initial schema. It allows visitors to browse the menu before signing in.
  drop policy if exists "menu is readable by authenticated users" on public.menu_items;
  drop policy if exists "menu is publicly readable" on public.menu_items;
  create policy "menu is publicly readable" on public.menu_items for select to anon, authenticated using (true);

  insert into public.menu_items (name, category, price, description, image, popular) values
    ('Classic Smash Burger', 'Burgers', 8.99, 'Two smashed beef patties, cheese, pickles, onion and house sauce.', '🍔', true),
    ('Crispy Chicken Burger', 'Burgers', 8.49, 'Crispy chicken, shredded lettuce, pickles and spicy mayo.', '🍗', true),
    ('Loaded Fries', 'Sides', 4.99, 'Crispy fries, cheese sauce, jalapeños and house seasoning.', '🍟', true),
    ('Spicy Wings', 'Sides', 7.99, 'Six juicy wings tossed in our signature hot glaze.', '🍗', false),
    ('Chocolate Shake', 'Drinks', 3.99, 'Cold, creamy and seriously chocolatey.', '🥤', false),
    ('Iced Latte', 'Drinks', 3.49, 'Fresh espresso poured over ice and milk.', '☕', false)
  on conflict do nothing;
