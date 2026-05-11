# Documentación de la Página de Tienda — GymLabs

## Resumen

La página **Tienda** (`/shop`) es el núcleo e-commerce de GymLabs. Muestra todos los productos activos desde Supabase con búsqueda por texto (insensible a tildes), filtrado por categoría y filtrado por rango de precio — todo implementado mediante **renderizado del lado del servidor (SSR)** con parámetros de query en la URL.

**URL**: `/shop`  
**Modo de renderizado**: SSR (`prerender = false`)  
**Adaptador de despliegue**: `@astrojs/vercel`

---

## Arquitectura

### Flujo de Petición/Respuesta

```
Navegador                   Servidor Astro                    Supabase
  │                             │                              │
  │  GET /shop?search=whey     │                              │
  │  &category=proteinas       │                              │
  │  &maxPrice=80              │                              │
  │ ─────────────────────────> │                              │
  │                             │  SELECT categorías           │
  │                             │  WHERE is_active = true     │
  │                             │ ───────────────────────────>│
  │                             │ <───── categories[] ────────│
  │                             │                              │
  │                             │  SELECT categoría por slug  │
  │                             │ ───────────────────────────>│
  │                             │ <───── {id, name} ──────────│
  │                             │                              │
  │                             │  Normaliza "whey" → "whey"  │
  │                             │  (quita tildes)             │
  │                             │                              │
  │                             │  SELECT productos            │
  │                             │  WHERE is_active = true     │
  │                             │  AND name_search            │
  │                             │    ILIKE '%whey%'           │
  │                             │  AND category_id = 'abc123' │
  │                             │  AND price <= 80            │
  │                             │ ───────────────────────────>│
  │                             │ <───── products[] ──────────│
  │                             │                              │
  │ <── HTML renderizado ────── │                              │
```

### Árbol de Componentes

```
src/pages/shop.astro
  └── MainLayout
        ├── Navbar (formulario de búsqueda en /shop)
        └── ProductSection
              ├── SibarCategory (sidebar de filtros)
              └── ProductCard[] (cuadrícula de productos)
```

---

## Referencia Archivo por Archivo

### 1. `src/pages/shop.astro` — Punto de Entrada de la Página

**Rol**: Obtención de datos en el servidor y orquestación de filtros.

**Parámetros de Query Soportados**:

| Parámetro  | Tipo   | Descripción                              | Ejemplo     |
|------------|--------|------------------------------------------|-------------|
| `search`   | string | Búsqueda insensible a tildes sobre nombre | `caseina`   |
| `category` | string | Filtro por slug de categoría             | `proteinas` |
| `minPrice` | number | Precio mínimo                            | `20`        |
| `maxPrice` | number | Precio máximo                            | `80`        |

**Pasos de Obtención de Datos**:

1. **Obtener todas las categorías activas** para el sidebar:

```ts
const { data: categoriesData } = await supabase
  .from("categories")
  .select("id, name, slug")
  .eq("is_active", true)
  .order("sort_order", { ascending: true });
```

2. **Resolver slug de categoría a ID** (si hay un filtro de categoría activo):

```ts
if (categorySlug) {
  const { data: categoryMatch } = await supabase
    .from("categories")
    .select("id, name")
    .eq("slug", categorySlug)
    .eq("is_active", true)
    .single();
  if (categoryMatch) {
    categoryId = categoryMatch.id;
    activeCategoryName = categoryMatch.name;
  }
}
```

3. **Normalizar el término de búsqueda** (quitar tildes) antes de enviarlo a Supabase:

```ts
const normalizedSearch = search
  ? search.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  : "";
```

Esto convierte "caseína" → "caseina", "bcaa" → "bcaa", etc. La normalización usa descomposición Unicode NFD, que separa los caracteres base de sus diacríticos (tildes, diéresis), y luego elimina los diacríticos.

4. **Construir query dinámica de productos** encadenando filtros de Supabase:

```ts
let query = supabase.from("products")
  .select(`id, name, slug, price, compare_at_price, image_storage_key, categories(name)`)
  .eq("is_active", true);

if (normalizedSearch) query = query.ilike("name_search", `%${normalizedSearch}%`);
if (categoryId)       query = query.eq("category_id", categoryId);
if (minPrice)          query = query.gte("price", Number(minPrice));
if (maxPrice)          query = query.lte("price", Number(maxPrice));
query = query.order("name");
```

La búsqueda se hace contra la columna `name_search` (sin tildes), no contra `name` (original con tildes).

5. **Transformar productos**: Mapea cada fila de Supabase a un objeto `ProductItem`, extrayendo el nombre de categoría de la relación `categories` y generando la URL pública de imagen mediante `getProductImageUrl()`.

**Props pasadas a `ProductSection`**:

| Prop         | Tipo             | Descripción                                    |
|--------------|------------------|------------------------------------------------|
| `products`   | `ProductItem[]`  | Lista de productos filtrada                    |
| `categories` | `CategoryItem[]` | Todas las categorías activas para el sidebar   |
| `filters`    | `Filters`        | Estado actual de filtros (search, slug, precios) |

---

### 2. `src/components/shop/ProductSection.astro` — Contenedor de Layout

**Rol**: Distribuye el sidebar + cuadrícula de productos en un layout flex. Maneja el estado vacío.

**Interfaces de Props**:

```ts
interface Props {
  products: ProductItem[];
  categories: CategoryItem[];
  filters: Filters;
}

interface ProductItem {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  price: number;
  compareAtPrice?: number | null;
  badge?: string;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface Filters {
  search: string;
  categorySlug: string;
  activeCategoryName: string;
  minPrice: string;
  maxPrice: string;
}
```

**Estructura del Layout**:

```
<div class="container">         ← display: flex
  <SibarCategory />             ← width: 260px, position: sticky
  <section class="section">     ← flex: 1
    <div class="products-grid"> ← CSS Grid, auto-fill
      <ProductCard /> × N
    </div>
  </section>
</div>
```

**Estado Vacío**: Cuando `products.length === 0`, se muestra un mensaje centrado con un enlace "Limpiar filtros" hacia `/shop` en lugar de la cuadrícula.

**Breakpoints del CSS Grid**:

| Breakpoint       | Columnas                  | Espacio |
|------------------|---------------------------|---------|
| Escritorio (>900px) | auto-fill, min 260px | 1.5rem  |
| Tablet (≤768px)  | 2                         | 1rem    |
| Móvil (≤480px)   | 1                         | —       |

**Dirección Sidebar/Grid**: En pantallas ≤900px, el contenedor flex cambia a `flex-direction: column`, apilando el sidebar encima de la cuadrícula.

---

### 3. `src/components/shop/SibarCategory.astro` — Sidebar de Filtros

**Rol**: Muestra la navegación por categorías y el filtro de rango de precio. Es el único componente con JavaScript del lado del cliente.

**Interfaces de Props**: Las mismas `Categories` y `Filters` de arriba.

**Mapa de Emojis por Categoría**:

```ts
const iconMap: Record<string, string> = {
  proteinas:   "🥛",
  proteina:    "🥛",
  creatina:    "⚡",
  creatinas:   "⚡",
  accesorios:  "🧤",
  accesorio:   "🧤",
  suplementos: "💊",
  ropa:        "👕",
  equipamiento:"🏋️",
  novedades:   "✨",
  ofertas:     "🏷️",
};
```

Las categorías no incluidas en el mapa usan el emoji 📦 como respaldo. El mapa usa el `slug` de la categoría como clave.

**Utilidad Constructora de URLs**:

```ts
function buildUrl(params: Record<string, string>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) sp.set(key, value);
  });
  const qs = sp.toString();
  return `/shop${qs ? "?" + qs : ""}`;
}
```

Esta función se ejecuta en el servidor para generar enlaces `<a href>` que preservan los parámetros de filtro existentes mientras establecen o eliminan uno específico.

**Enlaces de Categoría**: Cada categoría (incluyendo "Todos") es una etiqueta `<a>` que enlaza a `/shop?<params>`. La categoría activa recibe la clase CSS `.active`. Al hacer clic en una categoría se dispara una navegación de página completa (enfoque SSR).

**Slider de Rango de Precio**:
- HTML `<input type="range" min="0" max="100">`
- Valor por defecto: el `maxPrice` actual de los query params, o `100` (sin filtro)
- **`<script>` del lado del cliente** maneja la interactividad:
  - Evento `input`: actualiza la etiqueta de precio en tiempo real (`S/ {valor}`)
  - Evento `change`: se dispara al soltar el thumb → lee todos los query params actuales de `window.location.search`, establece o elimina `maxPrice`, y navega a `/shop?<nuevosParams>`

**Botón Limpiar Filtros**: Un simple `<a href="/shop">` — navega a la URL base de la tienda sin query params.

**Aspectos CSS Destacados**:
- `.sidebar`: `width: 260px`, `position: sticky` (top: 80px, para dejar espacio al navbar), `align-self: flex-start`
- `.item.active`: Borde izquierdo con gradiente verde (`linear-gradient(90deg, var(--color-primary-glow), transparent)`) con `border-left: 3px solid var(--color-primary)` y `color: var(--color-primary)`
- `.range`: `accent-color: var(--color-primary)` para el color del thumb del slider

---

### 4. `src/components/ui/ProductCard.astro` — Tarjeta de Producto

**Rol**: Renderiza un producto individual en la cuadrícula. Solo presentación — sin interactividad (el botón "Añadir al carrito" es un placeholder).

**Interfaz de Props**:

```ts
interface Props {
  name: string;                    // Nombre mostrado del producto
  imageUrl: string;                // URL pública de Supabase Storage (o respaldo)
  price: number;                   // Precio actual
  compareAtPrice?: number | null;  // Precio original para mostrar descuento
  category: string;                // Nombre de categoría (etiqueta)
  badge?: string;                  // Texto opcional de insignia (ej. "Nuevo", "Oferta")
}
```

**Formato de Precio**: Usa `Intl.NumberFormat` con locale `es-PE` (Soles peruanos), mostrando siempre 2 decimales.

**Campos Mostrados**:
- **Insignia** (opcional): Posicionada absoluta en el centro superior, píldora verde con sombra
- **Imagen**: Contenedor de 220px de altura, `object-fit: cover`, lazy loaded. Al hacer hover hace `scale(1.05)`
- **Etiqueta de categoría**: Mayúsculas, texto muted, fuente pequeña
- **Nombre**: Título del producto, blanco, peso 600
- **Precio comparativo**: Mostrado con tachado si `compareAtPrice` tiene valor
- **Precio activo**: Verde (`var(--color-primary)`), grande (1.4rem), peso 800
- **Botón comprar**: Ancho completo, fondo verde translúcido, se vuelve verde sólido al hover con sombra glow

**Efecto Hover**: Toda la tarjeta se eleva `translateY(-5px)` y el borde cambia al color primario.

---

### 5. `src/components/layout/Navbar.astro` — Formulario de Búsqueda

**Rol**: Barra de navegación global. Renderiza condicionalmente un formulario de búsqueda solo en la ruta `/shop`.

**Formulario de Búsqueda** (visible solo cuando `currentPath === "/shop"`):

```html
<form action="/shop" method="GET" class="search-form">
  <!-- Inputs ocultos preservan los filtros existentes -->
  <input type="hidden" name="category" value={currentCategory} />
  <input type="hidden" name="minPrice" value={currentMinPrice} />
  <input type="hidden" name="maxPrice" value={currentMaxPrice} />
  <!-- Input de búsqueda visible -->
  <input type="text" name="search" placeholder="Buscar productos..."
         class="input-search" value={currentSearch} />
</form>
```

**Cómo Funciona**:
- `action="/shop" method="GET"`: Envía a la página de tienda por GET
- Los `<input>` ocultos preservan `category`, `minPrice`, `maxPrice` de la URL actual
- El input de texto visible tiene `name="search"`, por lo que su valor se pasa como `?search=...`
- Presionar Enter con el foco en el input de búsqueda dispara el envío del formulario
- La página se recarga con el query string combinado

---

### 6. `src/lib/supabase.ts` — Cliente de Base de Datos

**Rol**: Crea y configura el cliente de Supabase tipado. Exporta funciones auxiliares para imágenes de productos.

**Variables de Entorno Requeridas**:

| Variable                            | Descripción                                |
|-------------------------------------|--------------------------------------------|
| `SUPABASE_TARGET`                   | `"local"` o `"cloud"`                      |
| `SUPABASE_CLOUD_URL`                | URL del proyecto Supabase en la nube       |
| `SUPABASE_CLOUD_PUBLISHABLE_KEY`    | Clave anónima/pública de Supabase cloud    |
| `SUPABASE_LOCAL_URL`                | URL de la instancia local de Supabase      |
| `SUPABASE_LOCAL_PUBLISHABLE_KEY`    | Clave anónima/pública de Supabase local    |
| `SUPABASE_PRODUCT_IMAGE_BUCKET`     | Nombre del bucket de Storage para imágenes |

**Funciones Exportadas**:

| Función                    | Descripción                                                     |
|----------------------------|-----------------------------------------------------------------|
| `supabase`                 | Instancia tipada del cliente Supabase                           |
| `getSupabasePublicUrl()`   | Devuelve la URL pública de cualquier archivo en un bucket       |
| `getProductImageUrl()`     | Atajo: `getSupabasePublicUrl(productImageBucket, path)`         |
| `getRequiredEnv()`         | Valida que una variable de entorno exista, lanza error si falta |

**Imagen de Respaldo**: En `shop.astro`, si un producto no tiene `image_storage_key`, se usa `/images/general-img-square.png`.

---

### 7. `src/lib/supabase.types.ts` — Definiciones de Tipos de la Base de Datos

Tipos TypeScript generados para el esquema de Supabase. Las tablas relevantes para la página de tienda son:

#### Tabla `categories`

| Columna      | Tipo          | Descripción                          |
|--------------|---------------|--------------------------------------|
| `id`         | `string` (PK) | UUID clave primaria                  |
| `name`       | `string`      | Nombre mostrado (ej. "Proteínas")    |
| `slug`       | `string`      | Identificador URL-safe ("proteinas") |
| `description`| `string?`     | Descripción opcional                 |
| `is_active`  | `boolean`     | Si la categoría es visible           |
| `sort_order` | `number`      | Orden de visualización (ascendente)  |
| `created_at` | `string`      | Timestamp ISO                        |
| `updated_at` | `string`      | Timestamp ISO                        |

#### Tabla `products`

| Columna              | Tipo          | Descripción                                     |
|----------------------|---------------|-------------------------------------------------|
| `id`                 | `string` (PK) | UUID clave primaria                             |
| `category_id`        | `string` (FK) | Clave foránea a `categories.id`                 |
| `name`               | `string`      | Nombre original del producto (con tildes)       |
| `name_search`        | `string?`     | Nombre normalizado sin tildes para búsqueda     |
| `slug`               | `string`      | Identificador URL-safe                          |
| `sku`                | `string`      | Código de stock                                 |
| `description`        | `string?`     | Descripción del producto                        |
| `price`              | `number`      | Precio de venta actual                          |
| `compare_at_price`   | `number?`     | Precio original (para mostrar descuento)        |
| `stock`              | `number`      | Cantidad en inventario                          |
| `is_active`          | `boolean`     | Si el producto es visible                       |
| `is_top_seller`      | `boolean`     | Bandera de producto más vendido                 |
| `image_storage_key`  | `string?`     | Ruta en el bucket de Supabase Storage           |
| `created_at`         | `string`      | Timestamp ISO                                   |
| `updated_at`         | `string`      | Timestamp ISO                                   |

**Clave Foránea**: `products.category_id` → `categories.id` (uno a muchos: una categoría tiene muchos productos)

---

### 8. `src/layouts/MainLayout.astro` — Envoltorio de Página

**Rol**: Envuelve cada página con Navbar + slot de contenido + Footer.

```
BaseLayout (cabecera HTML, metadatos)
  └── MainLayout
        ├── Navbar
        ├── <slot />  ← el contenido de la página de tienda va aquí
        └── Footer
```

El `min-height: 100vh` en `.main-layout` y `flex: 1` en `<main>` aseguran que el footer se mantenga abajo incluso en páginas cortas.

---

### 9. `supabase/migrations/20260511000000_add_name_search_column.sql` — Migración de Búsqueda sin Tildes

**Rol**: Crea la infraestructura en base de datos para búsqueda insensible a tildes.

```sql
-- Habilitar extensión unaccent (eliminación de tildes)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Agregar columna de búsqueda normalizada
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_search text;

-- Índice para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_products_name_search
ON products USING btree (name_search);

-- Función trigger: auto-llenar name_search desde name (sin tildes)
CREATE OR REPLACE FUNCTION update_name_search()
RETURNS trigger AS $$
BEGIN
  NEW.name_search := unaccent(NEW.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: se dispara en INSERT o UPDATE de name
DROP TRIGGER IF EXISTS trg_products_name_search ON products;
CREATE TRIGGER trg_products_name_search
  BEFORE INSERT OR UPDATE OF name ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_name_search();

-- Rellenar name_search para productos existentes
UPDATE products SET name_search = unaccent(name);
```

**Cómo Funciona**:
1. **Extensión `unaccent`**: Función de PostgreSQL que elimina tildes/diacríticos de un texto
2. **Columna `name_search`**: Almacena el nombre del producto sin tildes (ej. "Caseína" → "Caseina")
3. **Trigger automático**: Cada vez que se inserta o actualiza un producto, `name_search` se recalcula automáticamente desde `name` usando `unaccent()`. No requiere intervención manual
4. **Índice**: Acelera las búsquedas por `name_search`
5. **UPDATE final**: Rellena la columna para todos los productos que ya existían antes de la migración

---

## Sistema de Filtrado — Mecánica Detallada

### Interacción de Parámetros

Todos los filtros son **acumulativos** — se apilan y reducen los resultados:

```
/shop?category=proteinas&search=caseina&maxPrice=80
       ↑                      ↑                ↑
       |                      |                └── Precio máximo S/ 80
       |                      └── Nombre contiene "caseina" (sin tilde)
       └── Categoría = "proteinas"
```

### Búsqueda Insensible a Tildes

El sistema de búsqueda funciona en dos capas:

**Capa 1 — Servidor (Astro)**: Normaliza el término de búsqueda del usuario usando descomposición Unicode NFD:
```ts
// "caseína" → "caseina", "bcaa" → "bcaa", "proteína" → "proteina"
const normalizedSearch = search
  ? search.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  : "";
```

**Capa 2 — Base de Datos (PostgreSQL)**: La columna `name_search` se mantiene automáticamente sin tildes mediante el trigger `update_name_search()`. La búsqueda usa `ILIKE` sobre `name_search` para coincidencia insensible a mayúsculas/minúsculas.

**Ejemplos de coincidencias**:

| Búsqueda del usuario | Producto en BD         | ¿Coincide? | Explicación                        |
|-----------------------|------------------------|:----------:|------------------------------------|
| `caseina`             | Caseína Premium        | ✅         | `unaccent("Caseína")` = "Caseina"  |
| `bcaa`                | BCAA 2:1:1             | ✅         | Sin tildes que quitar              |
| `proteina`            | Proteína Whey          | ✅         | `unaccent("Proteína")` = "Proteina"|
| `CREATINA`            | Creatina Monohidratada | ✅         | ILIKE ignora mayúsculas            |
| `accesorios`          | Accesorios Gym         | ✅         | Sin tildes que quitar              |
| `caSeInA`             | Caseína Premium        | ✅         | ILIKE + unaccent en ambos lados    |

### Filtrado por Categoría

1. Lee `?category={slug}` de la URL
2. Busca el slug en la tabla `categories` para obtener el `id`
3. Usa el `category_id` resuelto para filtrar productos
4. Si el slug no coincide con ninguna categoría activa, el filtro se ignora silenciosamente

### Filtrado por Rango de Precio

1. Lee `?minPrice={n}` y/o `?maxPrice={n}` de la URL
2. Usa `gte()` y `lte()` de Supabase para filtrado por rango
3. El slider del sidebar solo establece `maxPrice` (JS del lado del cliente)
4. `minPrice` puede establecerse manualmente vía URL para uso futuro

### Preservación de Filtros Entre Acciones

**Clic en categoría** → Preserva `search`, `minPrice`, `maxPrice` — actualiza `category`:
```
/shop?search=whey&maxPrice=50  + clic en "Proteínas"  →  /shop?search=whey&maxPrice=50&category=proteinas
```

**Envío de búsqueda** → Preserva `category`, `minPrice`, `maxPrice` — actualiza `search`:
```
/shop?category=proteinas&maxPrice=50  + buscar "iso"  →  /shop?category=proteinas&maxPrice=50&search=iso
```

**Cambio de slider de precio** → Lee todos los params actuales de `window.location.search`, actualiza `maxPrice`:
```
/shop?category=proteinas&search=whey  + slider a 60  →  /shop?category=proteinas&search=whey&maxPrice=60
```

**Limpiar filtros** → Navega a `/shop` sin ningún parámetro.

---

## Variables de Tema CSS

Los componentes de la tienda referencian estas propiedades personalizadas CSS (definidas en `BaseLayout` o estilos globales):

| Variable                | Valor típico    | Uso                                  |
|-------------------------|-----------------|--------------------------------------|
| `--bg-base`             | `#020617`       | Fondo oscuro principal               |
| `--bg-surface`          | `#0f172a`       | Fondo de tarjetas / sidebar          |
| `--bg-surface-2`        | `#1e293b`       | Fondo de estado hover                |
| `--text-primary`        | `#f8fafc`       | Encabezados, nombres de productos    |
| `--text-secondary`      | `#cbd5e1`       | Items del sidebar                    |
| `--text-muted`          | `#94a3b8`       | Etiquetas, subtítulos                |
| `--color-primary`       | `#10b981`       | Acento verde (bordes, precios, hover)|
| `--color-primary-glow`  | Brillo esmeralda| Gradiente de estado activo           |
| `--border-color`        | `#1e293b`       | Bordes de tarjetas                   |
| `--font-primary`        | Fuente sistema  | Texto general                        |

---

## Entorno y Despliegue

- **Framework**: Astro v6 (modo SSR)
- **Adaptador**: `@astrojs/vercel`
- **Base de datos**: Supabase (PostgreSQL en la nube)
- **Almacenamiento**: Supabase Storage para imágenes de productos
- **Runtime**: Funciones serverless de Node.js en Vercel
- **Salida de build**: `.vercel/output/` → función serverless + assets estáticos

---

## Mejoras Futuras (No Implementadas Aún)

| Funcionalidad                  | Estado Actual                                  |
|--------------------------------|------------------------------------------------|
| Paginación                     | Todos los productos se cargan de una vez       |
| Ordenamiento (precio, nombre)  | Solo `order("name")` hardcodeado               |
| Botón "Añadir al carrito"      | Placeholder — sin lógica de carrito            |
| Página de detalle de producto  | No enlazada desde las tarjetas                 |
| Drawer de filtros en móvil     | Sidebar se apila verticalmente en móvil        |
| Búsqueda con debounce          | Requiere presionar Enter/enviar formulario     |
| SEO por filtro                 | Título estático "Tienda"                       |
| Slider/input de minPrice       | Solo slider de `maxPrice` en el sidebar        |
| Búsqueda en páginas no-shop    | El formulario solo aparece en `/shop`          |

---

## Índice de Archivos

```
src/
├── pages/
│   └── shop.astro                       # Entrada de página — SSR + queries Supabase
├── components/
│   ├── shop/
│   │   ├── ProductSection.astro         # Layout: sidebar + cuadrícula de productos
│   │   └── SibarCategory.astro          # Sidebar: categorías + slider de precio
│   ├── ui/
│   │   └── ProductCard.astro            # Tarjeta individual de producto
│   └── layout/
│       └── Navbar.astro                 # Navbar global + formulario de búsqueda condicional
├── lib/
│   ├── supabase.ts                      # Cliente Supabase + helpers
│   └── supabase.types.ts                # Definiciones de tipos de base de datos
├── layouts/
│   └── MainLayout.astro                 # Envoltorio de página (Navbar + slot + Footer)
supabase/
└── migrations/
    └── 20260511000000_add_name_search_column.sql  # Migración: columna name_search + trigger
```
