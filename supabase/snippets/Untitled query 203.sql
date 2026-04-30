INSERT INTO products (id, category_id, name, slug, sku, description, price, compare_at_price, stock, is_active, is_top_seller, image_storage_key) VALUES

-- CREATINA (6 productos)
(gen_random_uuid(), '7086ecfd-5613-4b54-a2cb-60ce854904de', 'Creatina Monohidrato 500g', 'creatina-monohidrato-500g', 'GL-CRE-003', 'Creatina monohidrato pura micronizada, ideal para aumentar fuerza y masa muscular.', 32.99, 42.99, 80, true, false, NULL),
(gen_random_uuid(), '7086ecfd-5613-4b54-a2cb-60ce854904de', 'Creatina HCL 250g', 'creatina-hcl-250g', 'GL-CRE-004', 'Creatina Hidrocloruro de alta solubilidad, sin retención de agua.', 38.99, NULL, 60, true, false, NULL),
(gen_random_uuid(), '7086ecfd-5613-4b54-a2cb-60ce854904de', 'Creatina Monohidrato 1kg', 'creatina-monohidrato-1kg', 'GL-CRE-005', 'Pack económico de creatina monohidrato para atletas avanzados.', 59.99, 74.99, 45, true, true, 'creatina-1kg.jpg'),
(gen_random_uuid(), '7086ecfd-5613-4b54-a2cb-60ce854904de', 'Creatina Creapure 300g', 'creatina-creapure-300g', 'GL-CRE-006', 'Creatina alemana certificada Creapure, la más pura del mercado.', 48.99, 62.99, 35, true, false, NULL),
(gen_random_uuid(), '7086ecfd-5613-4b54-a2cb-60ce854904de', 'Creatina + Beta-Alanina 400g', 'creatina-beta-alanina-400g', 'GL-CRE-007', 'Fórmula combinada de creatina y beta-alanina para mayor rendimiento explosivo.', 42.99, 55.99, 50, true, false, NULL),
(gen_random_uuid(), '7086ecfd-5613-4b54-a2cb-60ce854904de', 'Creatina Kre-Alkalyn 120 caps', 'creatina-kre-alkalyn-120caps', 'GL-CRE-008', 'Creatina tamponada en cápsulas, mejor absorción sin efectos secundarios.', 36.99, NULL, 40, true, false, NULL),

-- PROTEINAS (6 productos)
(gen_random_uuid(), 'e16ef781-3bf3-4b15-8802-8cfcd51caac1', 'Whey Protein Chocolate 2kg', 'whey-protein-chocolate-2kg', 'GL-PRO-002', 'Proteína de suero de leche, 24g de proteína por porción, sabor chocolate.', 89.99, 109.99, 60, true, true, 'proteina-chocolate.png'),
(gen_random_uuid(), 'e16ef781-3bf3-4b15-8802-8cfcd51caac1', 'Whey Protein Vainilla 2kg', 'whey-protein-vainilla-2kg', 'GL-PRO-003', 'Proteína de suero de leche, 24g de proteína por porción, sabor vainilla.', 89.99, 109.99, 55, true, false, NULL),
(gen_random_uuid(), 'e16ef781-3bf3-4b15-8802-8cfcd51caac1', 'Proteína Vegana Chocolate 1kg', 'proteina-vegana-chocolate-1kg', 'GL-PRO-004', 'Blend de proteína de guisante y arroz integral, apta para veganos.', 74.99, NULL, 35, true, false, NULL),
(gen_random_uuid(), 'e16ef781-3bf3-4b15-8802-8cfcd51caac1', 'Caseína Micelar Fresa 1.5kg', 'caseina-micelar-fresa-1-5kg', 'GL-PRO-006', 'Proteína de liberación lenta ideal para antes de dormir, sabor fresa.', 84.99, 99.99, 30, true, true, NULL),
(gen_random_uuid(), 'e16ef781-3bf3-4b15-8802-8cfcd51caac1', 'Whey Isolate Zero Lactosa 1kg', 'whey-isolate-zero-lactosa-1kg', 'GL-PRO-007', 'Proteína aislada sin lactosa, 27g de proteína por porción, bajo en grasa.', 94.99, 119.99, 42, true, true, 'whey-isolate.jpg'),
(gen_random_uuid(), 'e16ef781-3bf3-4b15-8802-8cfcd51caac1', 'Mass Gainer 3kg', 'mass-gainer-3kg', 'GL-PRO-008', 'Ganador de masa muscular con carbohidratos complejos y proteína de suero.', 99.99, 124.99, 28, true, false, NULL),

-- ROPA DEPORTIVA (5 productos)
(gen_random_uuid(), '959461b9-607d-4e53-81d3-5e329c0e7921', 'Polo Dry-Fit Hombre', 'polo-dry-fit-hombre', 'GL-ROP-001', 'Polo deportivo de secado rápido, tejido transpirable para entrenamientos intensos.', 22.99, 29.99, 100, true, false, NULL),
(gen_random_uuid(), '959461b9-607d-4e53-81d3-5e329c0e7921', 'Short Deportivo Hombre', 'short-deportivo-hombre', 'GL-ROP-002', 'Short de entrenamiento con bolsillo lateral y elástico ajustable.', 19.99, NULL, 75, true, false, NULL),
(gen_random_uuid(), '959461b9-607d-4e53-81d3-5e329c0e7921', 'Legging Deportivo Mujer', 'legging-deportivo-mujer', 'GL-ROP-003', 'Legging de compresión alta con cintura ancha, perfecto para gym y crossfit.', 29.99, 39.99, 85, true, true, 'camiseta.jpg'),
(gen_random_uuid(), '959461b9-607d-4e53-81d3-5e329c0e7921', 'Top Deportivo Mujer', 'top-deportivo-mujer', 'GL-ROP-005', 'Top deportivo con soporte medio, tela de microfibra transpirable.', 24.99, NULL, 70, true, false, NULL),
(gen_random_uuid(), '959461b9-607d-4e53-81d3-5e329c0e7921', 'Hoodie Gym Unisex', 'hoodie-gym-unisex', 'GL-ROP-007', 'Sudadera con capucha para entrenamiento, tela fleece suave y abrigadora.', 49.99, 64.99, 50, true, false, NULL),

-- ACCESORIOS (5 productos)
(gen_random_uuid(), '836de241-8f85-41fa-ba2a-c462f67eb4a6', 'Guantes de Gym', 'guantes-de-gym', 'GL-ACC-001', 'Guantes de entrenamiento con muñequera integrada y palma acolchada.', 16.99, NULL, 80, true, false, NULL),
(gen_random_uuid(), '836de241-8f85-41fa-ba2a-c462f67eb4a6', 'Correa para Muñeca', 'correa-muneca', 'GL-ACC-002', 'Straps de cuero sintético para mayor agarre en jalones y peso muerto.', 13.99, 18.99, 60, true, false, NULL),
(gen_random_uuid(), '836de241-8f85-41fa-ba2a-c462f67eb4a6', 'Cinturón Lumbar Gym', 'cinturon-lumbar-gym', 'GL-ACC-004', 'Cinturón de levantamiento con doble velcro y soporte lumbar reforzado.', 28.99, 38.99, 45, true, true, NULL),
(gen_random_uuid(), '836de241-8f85-41fa-ba2a-c462f67eb4a6', 'Foam Roller 60cm', 'foam-roller-60cm', 'GL-ACC-005', 'Rodillo de espuma de alta densidad para recuperación muscular y movilidad.', 24.99, NULL, 40, true, false, NULL),
(gen_random_uuid(), '836de241-8f85-41fa-ba2a-c462f67eb4a6', 'Banda Elástica Pack x3', 'banda-elastica-pack-x3', 'GL-ACC-006', 'Set de 3 bandas de resistencia progresiva para activación', 19.99, 29.99, 70, true, false, NULL);
