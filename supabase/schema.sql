-- ============================================================================
-- DIAO SHOP — Schéma Supabase (Phase 8)
-- À exécuter : Supabase → SQL Editor → New query → coller tout → Run
-- 9 tables : products, product_sizes, product_images, product_themes,
--            orders, order_items, shop_settings, contact_messages, profiles
-- Sécurité : RLS activée partout, AUCUNE policy publique — l'accès se fait
-- exclusivement depuis le serveur Next.js avec la clé service_role.
-- ============================================================================

-- 1) PRODUITS ----------------------------------------------------------------
create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  sub_title text,
  team text,
  short_description text,
  description text,
  price integer not null check (price >= 0),
  old_price integer check (old_price is null or old_price > price),
  currency text not null default 'FCFA',
  alt_text text,
  published boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- Garantie base de données : UN SEUL produit mis en avant
create unique index if not exists products_one_featured
  on public.products (is_featured) where is_featured;

-- 2) TAILLES & STOCKS ---------------------------------------------------------
create table if not exists public.product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  size text not null,
  stock integer not null default 0 check (stock >= 0),
  active boolean not null default true,
  unique (product_id, size)
);

-- 3) IMAGES (1 principale + galerie ordonnée) ---------------------------------
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  url text not null,
  alt text,
  position integer not null default 0,
  is_main boolean not null default false
);
create unique index if not exists product_images_one_main
  on public.product_images (product_id) where is_main;

-- 4) THÈMES (couleurs = données, 1 ligne par produit) -------------------------
create table if not exists public.product_themes (
  product_id text primary key references public.products(id) on delete cascade,
  background_color text not null,
  primary_color text not null,
  secondary_color text not null,
  accent_color text not null,
  text_color text not null,
  muted_text_color text not null,
  button_color text not null,
  glow_color text not null,
  glow_intensity double precision not null default 0.4
    check (glow_intensity between 0 and 1),
  surface_gradient text not null
    default 'linear-gradient(135deg, rgba(240,166,43,0.18) 0%, rgba(16,19,25,0) 60%)',
  border_color text not null default 'rgba(240,166,43,0.25)',
  mode text not null default 'dark' check (mode in ('dark', 'light'))
);

-- 5) COMMANDES ----------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  phone text not null,
  whatsapp text,
  email text,
  address text not null,
  city text not null,
  zone_label text not null,
  delivery_method text,
  payment_method text,
  notes text,
  subtotal integer not null default 0,
  delivery_fee integer not null default 0,
  total integer not null default 0,
  currency text not null default 'FCFA',
  status text not null default 'nouvelle'
    check (status in ('nouvelle', 'confirmee', 'en_preparation', 'expediee', 'livree', 'annulee', 'remboursee')),
  created_at timestamptz not null default now()
);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- 6) LIGNES DE COMMANDE (snapshots immuables — product_id SANS clé étrangère :
--    l'historique survit à la suppression d'un produit) -----------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  position integer not null default 0,
  product_id text,
  product_name text not null,
  product_image text,
  size text not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null,
  total_price integer not null
);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- 7) PARAMÈTRES BOUTIQUE (ligne unique jsonb) ---------------------------------
create table if not exists public.shop_settings (
  id integer primary key check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- 8) MESSAGES DE CONTACT ------------------------------------------------------
create table if not exists public.contact_messages (
  id text primary key,
  name text not null,
  email text,
  phone text,
  message text not null,
  lu boolean not null default false,
  created_at timestamptz not null default now()
);

-- 9) PROFILS (rôles admin/staff, liés à Supabase Auth) ------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

-- SÉCURITÉ : RLS partout, zéro policy publique --------------------------------
alter table public.products         enable row level security;
alter table public.product_sizes    enable row level security;
alter table public.product_images   enable row level security;
alter table public.product_themes   enable row level security;
alter table public.orders           enable row level security;
alter table public.order_items      enable row level security;
alter table public.shop_settings    enable row level security;
alter table public.contact_messages enable row level security;
alter table public.profiles         enable row level security;

-- STORAGE : bucket public pour les images produits -----------------------------
insert into storage.buckets (id, name, public)
values ('produits', 'produits', true)
on conflict (id) do nothing;

-- ============================================================================
-- PROMOTION DU PREMIER ADMINISTRATEUR
-- (après création de l'utilisateur dans Authentication → Users → Add user) :
--
-- insert into public.profiles (id, email, role)
--   select u.id, u.email, 'admin' from auth.users u
--   where u.email = 'vous@exemple.com'
--   on conflict (id) do update set role = 'admin';
-- ============================================================================
