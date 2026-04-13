truncate table testimonials, products, categories restart identity cascade;

insert into categories (name, slug, description, is_active, sort_order)
values
  ('Proteinas', 'proteinas', 'Proteina premium para fuerza, recuperacion y ganancia muscular.', true, 1),
  ('Creatina', 'creatina', 'Formulas de creatina para potencia, energia y rendimiento.', true, 2),
  ('Ropa deportiva', 'ropa-deportiva', 'Prendas tecnicas para entrenar con confort y estilo.', true, 3),
  ('Accesorios', 'accesorios', 'Complementos esenciales para tus sesiones diarias.', true, 4);

insert into products (category_id, name, slug, sku, description, price, compare_at_price, stock, is_active, is_top_seller, image_storage_key)
select id, 'Whey Protein Gold', 'whey-protein-gold', 'GL-PRO-001', 'Proteina aislada con mezcla premium para recuperacion post-entreno.', 44.99, 59.99, 40, true, true, null
from categories where slug = 'proteinas';

insert into products (category_id, name, slug, sku, description, price, compare_at_price, stock, is_active, is_top_seller, image_storage_key)
select id, 'Creatina Performance', 'creatina-performance', 'GL-CRE-002', 'Creatina monohidratada micronizada para mejorar potencia y volumen.', 24.99, 34.99, 72, true, true, null
from categories where slug = 'creatina';

insert into products (category_id, name, slug, sku, description, price, compare_at_price, stock, is_active, is_top_seller, image_storage_key)
select id, 'Vital Pro Shaker', 'vital-pro-shaker', 'GL-ACC-003', 'Shaker metalico con cierre hermetico y mezclador interno.', 12.99, 18.99, 95, true, true, null
from categories where slug = 'accesorios';

insert into products (category_id, name, slug, sku, description, price, compare_at_price, stock, is_active, is_top_seller, image_storage_key)
select id, 'Leggings Performance', 'leggings-performance', 'GL-ROP-004', 'Leggings de compresion con tela elastica y secado rapido.', 29.99, 39.99, 34, true, true, null
from categories where slug = 'ropa-deportiva';

insert into products (category_id, name, slug, sku, description, price, compare_at_price, stock, is_active, is_top_seller, image_storage_key)
select id, 'BCAA Recovery Plus', 'bcaa-recovery-plus', 'GL-PRO-005', 'Aminoacidos esenciales con electrolitos para sesiones exigentes.', 19.99, 26.99, 56, true, true, null
from categories where slug = 'proteinas';

insert into products (category_id, name, slug, sku, description, price, compare_at_price, stock, is_active, is_top_seller, image_storage_key)
select id, 'Camiseta Dry Motion', 'camiseta-dry-motion', 'GL-ROP-006', 'Camiseta ligera con paneles transpirables y corte atletico.', 22.99, 29.99, 67, true, false, null
from categories where slug = 'ropa-deportiva';

insert into products (category_id, name, slug, sku, description, price, compare_at_price, stock, is_active, is_top_seller, image_storage_key)
select id, 'Rodilleras Power Lift', 'rodilleras-power-lift', 'GL-ACC-007', 'Soporte firme para sentadillas y levantamientos pesados.', 17.99, 23.99, 48, true, false, null
from categories where slug = 'accesorios';

insert into products (category_id, name, slug, sku, description, price, compare_at_price, stock, is_active, is_top_seller, image_storage_key)
select id, 'Pre Workout Focus', 'pre-workout-focus', 'GL-SUP-008', 'Pre entreno con cafeina y beta alanina para maxima intensidad.', 27.99, 33.99, 61, true, false, null
from categories where slug = 'proteinas';

insert into testimonials (author_name, author_role, comment, rating, avatar_url, is_published, sort_order)
values
  ('Angela Maldonado', 'Cliente frecuente', 'Las entregas son rapidas y la calidad del producto se nota desde la primera compra.', 5, '/images/general-img-square.png', true, 1),
  ('Sonia Diaz', 'Atleta amateur', 'Siempre que compro creatina aqui siento mas confianza por el detalle en la informacion y la atencion.', 5, '/images/general-img-square.png', true, 2),
  ('Miguel Torres', 'Runner urbano', 'La ropa deportiva llego bien y se siente premium. El proceso de compra fue super claro.', 5, '/images/general-img-square.png', true, 3),
  ('Camila Reyes', 'Cross training', 'Me gusto que las ofertas destacadas muestren productos utiles y no solo los mas caros.', 4, '/images/general-img-square.png', true, 4);
