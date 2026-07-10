-- Reconcile admin schema after 20260630050111 was already applied locally with an older draft.
-- Keep this idempotent so fresh databases and drifted databases both converge.

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.categories
add column if not exists deleted_at timestamptz null;

alter table public.products
add column if not exists deleted_at timestamptz null;

create index if not exists categories_deleted_at_idx
on public.categories (deleted_at);

create index if not exists products_deleted_at_idx
on public.products (deleted_at);

create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  percentage integer not null,
  is_active boolean not null default true,
  deleted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint discount_codes_code_not_blank_check
    check (length(trim(code)) > 0),
  constraint discount_codes_code_uppercase_check
    check (code = upper(code)),
  constraint discount_codes_percentage_check
    check (percentage between 1 and 100)
);

create unique index if not exists discount_codes_code_not_deleted_key
on public.discount_codes (code)
where deleted_at is null;

create index if not exists discount_codes_active_code_idx
on public.discount_codes (code)
where is_active = true and deleted_at is null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
  before update on public.categories
  for each row
  execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

drop trigger if exists trg_discount_codes_updated_at on public.discount_codes;
create trigger trg_discount_codes_updated_at
  before update on public.discount_codes
  for each row
  execute function public.set_updated_at();

create or replace function public.prevent_physical_product_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Products must be soft-deleted by setting deleted_at instead of physically deleted.';
end;
$$;

drop trigger if exists trg_products_prevent_delete on public.products;
create trigger trg_products_prevent_delete
  before delete on public.products
  for each row
  execute function public.prevent_physical_product_delete();

create or replace function public.prevent_physical_category_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Categories must be soft-deleted by setting deleted_at instead of physically deleted.';
end;
$$;

drop trigger if exists trg_categories_prevent_delete on public.categories;
create trigger trg_categories_prevent_delete
  before delete on public.categories
  for each row
  execute function public.prevent_physical_category_delete();

create or replace function public.prevent_category_soft_delete_with_products()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.deleted_at is not null and old.deleted_at is null and exists (
    select 1
    from public.products
    where products.category_id = new.id
      and products.deleted_at is null
  ) then
    raise exception 'A category with active products cannot be deleted.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_categories_prevent_soft_delete_with_products on public.categories;
create trigger trg_categories_prevent_soft_delete_with_products
  before update of deleted_at on public.categories
  for each row
  execute function public.prevent_category_soft_delete_with_products();

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.discount_codes enable row level security;

grant select on public.admin_users to authenticated;
grant select on public.categories to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.discount_codes to anon, authenticated;
grant insert, update on public.categories to authenticated;
grant insert, update on public.products to authenticated;
grant insert, update on public.discount_codes to authenticated;

drop policy if exists "Admins can view their own admin row" on public.admin_users;
create policy "Admins can view their own admin row"
on public.admin_users
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Public can view active categories" on public.categories;
create policy "Public can view active categories"
on public.categories
for select
to anon, authenticated
using (is_active = true and deleted_at is null);

drop policy if exists "Admins can view all categories" on public.categories;
create policy "Admins can view all categories"
on public.categories
for select
to authenticated
using (exists (
  select 1
  from public.admin_users
  where admin_users.id = (select auth.uid())
));

drop policy if exists "Admins can insert categories" on public.categories;
create policy "Admins can insert categories"
on public.categories
for insert
to authenticated
with check (exists (
  select 1
  from public.admin_users
  where admin_users.id = (select auth.uid())
));

drop policy if exists "Admins can update categories" on public.categories;
create policy "Admins can update categories"
on public.categories
for update
to authenticated
using (exists (
  select 1
  from public.admin_users
  where admin_users.id = (select auth.uid())
))
with check (exists (
  select 1
  from public.admin_users
  where admin_users.id = (select auth.uid())
));

drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products"
on public.products
for select
to anon, authenticated
using (is_active = true and deleted_at is null);

drop policy if exists "Admins can view all products" on public.products;
create policy "Admins can view all products"
on public.products
for select
to authenticated
using (exists (
  select 1
  from public.admin_users
  where admin_users.id = (select auth.uid())
));

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
on public.products
for insert
to authenticated
with check (exists (
  select 1
  from public.admin_users
  where admin_users.id = (select auth.uid())
));

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
on public.products
for update
to authenticated
using (exists (
  select 1
  from public.admin_users
  where admin_users.id = (select auth.uid())
))
with check (exists (
  select 1
  from public.admin_users
  where admin_users.id = (select auth.uid())
));

drop policy if exists "Public can view active discount codes" on public.discount_codes;
create policy "Public can view active discount codes"
on public.discount_codes
for select
to anon, authenticated
using (is_active = true and deleted_at is null);

drop policy if exists "Admins can view all discount codes" on public.discount_codes;
create policy "Admins can view all discount codes"
on public.discount_codes
for select
to authenticated
using (exists (
  select 1
  from public.admin_users
  where admin_users.id = (select auth.uid())
));

drop policy if exists "Admins can insert discount codes" on public.discount_codes;
create policy "Admins can insert discount codes"
on public.discount_codes
for insert
to authenticated
with check (exists (
  select 1
  from public.admin_users
  where admin_users.id = (select auth.uid())
));

drop policy if exists "Admins can update discount codes" on public.discount_codes;
create policy "Admins can update discount codes"
on public.discount_codes
for update
to authenticated
using (exists (
  select 1
  from public.admin_users
  where admin_users.id = (select auth.uid())
))
with check (exists (
  select 1
  from public.admin_users
  where admin_users.id = (select auth.uid())
));

drop policy if exists "Public can upload images bucket objects" on storage.objects;
drop policy if exists "Public can update images bucket objects" on storage.objects;
drop policy if exists "Public can delete images bucket objects" on storage.objects;

drop policy if exists "Admins can upload images bucket objects" on storage.objects;
create policy "Admins can upload images bucket objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'images'
  and exists (
    select 1
    from public.admin_users
    where admin_users.id = (select auth.uid())
  )
);

drop policy if exists "Admins can update images bucket objects" on storage.objects;
create policy "Admins can update images bucket objects"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'images'
  and exists (
    select 1
    from public.admin_users
    where admin_users.id = (select auth.uid())
  )
)
with check (
  bucket_id = 'images'
  and exists (
    select 1
    from public.admin_users
    where admin_users.id = (select auth.uid())
  )
);

drop policy if exists "Admins can delete images bucket objects" on storage.objects;
create policy "Admins can delete images bucket objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'images'
  and exists (
    select 1
    from public.admin_users
    where admin_users.id = (select auth.uid())
  )
);

revoke execute on function public.set_updated_at() from public;
revoke execute on function public.prevent_physical_product_delete() from public;
revoke execute on function public.prevent_physical_category_delete() from public;
revoke execute on function public.prevent_category_soft_delete_with_products() from public;
