-- Datos de ejemplo para la tabla categories
insert into categories (name, slug, description, is_active, sort_order)
values
  ('Ropa deportiva', 'ropa-deportiva', 'Ropa para entrenamiento y deporte', true, 1),
  ('Accesorios', 'accesorios', 'Accesorios para entrenamiento y bienestar', true, 2),
  ('Suplementos', 'suplementos', 'Suplementos nutricionales y energéticos', true, 3);

-- Datos de ejemplo para la tabla products
insert into products (category_id, name, slug, sku, description, price, compare_at_price, stock, is_active, is_top_seller, image_storage_key)
select id, 'Camiseta DryFit', 'camiseta-dryfit', 'SKU-001', 'Camiseta transpirable para entrenamiento', 19.99, 24.99, 100, true, true, null from categories where slug = 'ropa-deportiva';

insert into products (category_id, name, slug, sku, description, price, compare_at_price, stock, is_active, is_top_seller, image_storage_key)
select id, 'Guantes de gimnasio', 'guantes-gimnasio', 'SKU-002', 'Guantes antideslizantes para levantamiento de pesas', 12.50, null, 50, true, false, null from categories where slug = 'accesorios';

insert into products (category_id, name, slug, sku, description, price, compare_at_price, stock, is_active, is_top_seller, image_storage_key)
select id, 'Proteína Whey', 'proteina-whey', 'SKU-003', 'Suplemento de proteína de suero', 34.90, 39.90, 30, true, true, null from categories where slug = 'suplementos';

