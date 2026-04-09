-- Migración inicial para categorías y productos

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id),

  name text not null,
  slug text not null unique,
  sku text not null unique,

  description text null,

  price numeric(10,2) not null,
  compare_at_price numeric(10,2) null,

  stock integer not null default 0,

  is_active boolean not null default true,
  is_top_seller boolean not null default false,

  image_storage_key text null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint products_compare_price_check
    check (compare_at_price is null or compare_at_price >= price),

  constraint products_stock_check
    check (stock >= 0)
);

