# FoodHub Pro — Fast Food SaaS

A professional fast food restaurant management platform built with **React**, **Vite**, and **Tailwind CSS**. Includes authentication, role-based dashboards, analytics, menu management, order tracking, and customer ordering.

## Features

### Authentication & Roles
- Login / Register with role selection (Admin, Manager, Customer)
- Protected routes with role-based access control
- Supabase Auth with role-aware Postgres data access

### Admin Dashboard
- **Overview** — Revenue charts, pending orders, notifications
- **Orders** — Full order management with status updates
- **Menu** — CRUD operations for menu items
- **Analytics** — Revenue charts, category breakdown, top sellers
- **Customers** — Customer list with spending insights
- **Settings** — Restaurant config, notifications, billing

### Customer Portal
- Browse menu and place orders
- Shopping cart with checkout
- Order history and status tracking
- Profile management

### SaaS Landing Page
- Marketing homepage with features and pricing tiers

## Getting Started

```bash
npm install
npm run dev
```

### Supabase setup

1. Create a Supabase project and copy `.env.example` to `.env.local`.
2. Add your project URL and **anon** key to `.env.local` (never expose the service-role key in the frontend).
3. Run `supabase/migrations/20260726000000_initial_schema.sql` in the Supabase SQL Editor, or use the Supabase CLI to push it.
4. Create your first account, then promote it from the SQL Editor when needed:

```sql
update public.profiles set role = 'admin' where id = 'YOUR_AUTH_USER_UUID';
```

New public registrations are always customers. This prevents users from self-assigning staff roles.

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Tech Stack

- React 19 + Vite 8
- React Router 7
- Tailwind CSS 4
- Recharts (analytics charts)
- Lucide React (icons)
- Supabase Auth + Postgres + Row Level Security

## Project Structure

```
src/
├── components/
│   ├── auth/          # Protected routes
│   ├── layout/        # Dashboard layout & sidebar
│   └── ui/            # Reusable UI components
├── context/           # Auth & Data providers
├── data/              # Mock/seed data
├── pages/
│   ├── dashboard/     # Dashboard pages
│   ├── Landing.jsx
│   ├── Login.jsx
│   └── Register.jsx
└── utils/             # Storage helpers
```

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run preview` — Preview production build
