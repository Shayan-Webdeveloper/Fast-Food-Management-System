# Setting up FoodHub Pro for a new restaurant customer

## Ownership model

- **You control the Vercel deployment.** The live website is deployed under your Vercel account. This is your leverage — if a client stops paying, you can pause or delete their deployment and their site goes offline.
- **The client owns their Supabase project.** Their menu, orders, and customer data live in their own account, under their control. You never hold their data hostage — only the deployed website.
- Practically: keep every customer's Vercel project under your own Vercel team/account, not theirs. Give them Supabase access (their project), but not Vercel access.
- **Admin access is not self-serve.** A client cannot promote themselves to admin from inside the app — only you can, by running the SQL in Step 9. Don't forget to do this for every new customer, or they'll be stuck as a regular customer account.

This is a step-by-step checklist for deploying a fresh instance of this app for a new customer. Follow it top to bottom — nothing should need guesswork.

---

## 1. Get the code

Clone this repo (or use it as a GitHub template) into a new folder/repo for this customer.

```bash
git clone <this-repo-url> customer-name-foodhub
cd customer-name-foodhub
```

## 2. Customer creates their own Supabase project

The customer (or you, on their behalf) needs their own free Supabase account and project — this keeps their data fully separate from every other customer, and doesn't count against your own project limit.

1. Go to https://supabase.com and sign up / log in.
2. Create a new project. Pick any name and a strong database password (save it somewhere safe).
3. Wait for the project to finish provisioning (~2 minutes).

## 3. Run the database migrations

In Supabase Dashboard → SQL Editor, run each file inside `supabase/migrations/` **in filename order** (they're timestamped, so alphabetical = correct order):

1. `20260726000000_initial_schema.sql`
2. `20260726000100_public_menu_and_seed.sql`
3. `20260726000200_expand_menu_to_100_items.sql`
4. `20260809000000_sync_manual_changes.sql`

Paste each file's full contents into a new SQL Editor query and click Run, one at a time. All of these are written to be safe to re-run, so don't worry if something needs re-running.

**Note:** file #3 seeds ~100 generic placeholder menu items (burgers, pizza, shakes, etc.) so the app isn't empty during setup. This is **not the client's real menu** — see Step 8b to clear it before launch.

## 4. Create the storage bucket for menu photos

Supabase Dashboard → Storage → Create bucket:
- Name: `menu-images`
- Public: **Yes**
- File size limit: `2 MB`
- Allowed MIME types: `image/jpeg, image/png, image/webp`

Then run this in SQL Editor to set the bucket's access policies (safe to re-run, drops old policies first):

```sql
drop policy if exists "menu images are publicly readable" on storage.objects;
create policy "menu images are publicly readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'menu-images');

drop policy if exists "staff can upload menu images" on storage.objects;
create policy "staff can upload menu images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'menu-images' and public.is_staff());

drop policy if exists "staff can update menu images" on storage.objects;
create policy "staff can update menu images"
on storage.objects for update
to authenticated
using (bucket_id = 'menu-images' and public.is_staff())
with check (bucket_id = 'menu-images' and public.is_staff());

drop policy if exists "staff can delete menu images" on storage.objects;
create policy "staff can delete menu images"
on storage.objects for delete
to authenticated
using (bucket_id = 'menu-images' and public.is_staff());
```

## 5. Get the customer's API credentials

Supabase Dashboard → Settings → API. Copy:
- **Project URL**
- **anon public key**

(These are safe to use in a frontend app — they're protected by Row Level Security, not meant to be secret.)

## 6. Set up email confirmations (SMTP)

Supabase Dashboard → Authentication → SMTP Settings → Enable Custom SMTP.

Fill in:

| Field | Value |
|---|---|
| Sender email | the customer's email address |
| Sender name | their restaurant name |
| Host | `smtp.gmail.com` |
| Port | `587` |
| Username | their Gmail address |
| Password | a Gmail **App Password** (not their normal password — generate one at https://myaccount.google.com/apppasswords) |

## 7. Set the redirect URL for password resets

Supabase Dashboard → Authentication → URL Configuration → Redirect URLs, add:https://<their-vercel-domain>/reset-password
(You'll get the actual domain in Step 10 — come back and add it after deploying.)

## 8. Customize branding

Edit `src/config/restaurant.js` with the customer's actual details:
- `name`, `tagline`, hero text, `logoEmoji`
- `address`, `hours`, `tickerText`
- `phone`, `socialHandle`

Also update the brand color in `src/index.css`, inside the `@theme` block:

```css
--color-brand-500: #f97316; /* change to their brand color */
```

(Tailwind reads this at build time, so it can't come from the JS config file — this is the one place still edited directly.)

Optionally update `index.html`'s `<title>` and meta description, and swap the favicon at `public/favicon.svg`.

### 8b. Replace the seed menu

Before launch, delete the placeholder menu items and add the client's real menu (via the admin dashboard's Menu Management page, with real photos uploaded). Don't ship a burger restaurant's placeholder menu to a client who sells sushi.

## 9. Set the first admin user

1. Have the customer register a normal account through the app's `/register` page.
2. In Supabase SQL Editor, promote them to admin:

```sql
update public.profiles set role = 'admin' where email = 'their-email@example.com';
```

## 10. Test locally before deploying

1. Create a `.env.local` file in the project root:VITE_SUPABASE_URL=<their project URL from Step 5>
VITE_SUPABASE_ANON_KEY=<their anon key from Step 5>
**Important:** do not wrap these values in quotes — a stray `"` around the whole file will silently break Supabase's connection and the app will fail to load with an env-var error.
2. Run:
```bash
   npm install
   npm run dev
```
3. Open the local URL and click through the app — register, log in as admin, add a menu item, place a test order. Catch obvious problems here, before they're live on a customer-facing URL.

## 11. Deploy to Vercel

1. Push this customer's repo to GitHub (if not already).
2. Go to https://vercel.com → New Project → import the repo.
3. In the project's Environment Variables settings, add the same two variables from Step 10 (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) — same rule applies, no wrapping quotes.
4. Deploy. Vercel gives you a live URL (e.g., `customer-name.vercel.app`).
5. Go back to Step 7 and add this real URL to Supabase's Redirect URLs.
6. (Optional) Connect a custom domain in Vercel's project settings if the customer has one.

## 12. Final check

- [ ] Register a test customer account, confirm the email arrives
- [ ] Log in as admin, add a menu item with a real photo
- [ ] Place a test order as a customer, confirm it shows on the Orders dashboard with delivery details
- [ ] Test password reset end to end
- [ ] Check the site on mobile
- [ ] Confirm placeholder seed menu items have been removed and replaced with the real menu