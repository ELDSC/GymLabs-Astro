# Shop Page Documentation — GymLabs

## Overview

The **Shop** page (`/shop`) is the core e-commerce page of GymLabs. It displays all active products from Supabase with full-text search, category filtering, and price range filtering — all implemented via **server-side rendering (SSR)** with URL query parameters.

**URL**: `/shop`  
**Rendering mode**: SSR (`prerender = false`)  
**Deployment adapter**: `@astrojs/vercel`

---

## Architecture

### Request/Response Flow

```
Browser                     Astro Server                    Supabase
  │                             │                              │
  │  GET /shop?search=whey     │                              │
  │  &category=proteinas       │                              │
  │  &maxPrice=80              │                              │
  │ ─────────────────────────> │                              │
  │                             │  SELECT categories          │
  │                             │  WHERE is_active = true     │
  │                             │ ───────────────────────────>│
  │                             │ <───── categories[] ────────│
  │                             │                              │
  │                             │  SELECT category by slug    │
  │                             │ ───────────────────────────>│
  │                             │ <───── {id, name} ──────────│
  │                             │                              │
  │                             │  SELECT products            │
  │                             │  WHERE is_active = true     │
  │                             │  AND name ILIKE '%whey%'    │
  │                             │  AND category_id = 'abc123' │
  │                             │  AND price <= 80            │
  │                             │ ───────────────────────────>│
  │                             │ <───── products[] ──────────│
  │                             │                              │
  │ <── Rendered HTML ───────── │                              │
```

### Component Tree

```
src/pages/shop.astro
  └── MainLayout
        ├── Navbar (search form on /shop)
        └── ProductSection
              ├── SibarCategory (sidebar filters)
              └── ProductCard[] (product grid)
```

---

## File-by-File Reference

### 1. `src/pages/shop.astro` — Page Entry Point

**Role**: Server-side data fetching and filter orchestration.

**Query Parameters Handled**:

| Param      | Type   | Description                        | Example       |
|------------|--------|------------------------------------|---------------|
| `search`   | string | Full-text search on product name   | `whey`        |
| `category` | string | Filter by category slug            | `proteinas`   |
| `minPrice` | number | Minimum price filter               | `20`          |
| `maxPrice` | number | Maximum price filter               | `80`          |

**Data Fetching Steps**:

1. **Fetch all active categories** for the sidebar:

```ts
const { data: categoriesData } = await supabase
  .from("categories")
  .select("id, name, slug")
  .eq("is_active", true)
  .order("sort_order", { ascending: true });
```

2. **Resolve category slug to ID** (if a category filter is active):

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

3. **Build dynamic product query** chaining Supabase filters:

```ts
let query = supabase.from("products")
  .select(`id, name, slug, price, compare_at_price, image_storage_key, categories(name)`)
  .eq("is_active", true);

if (search)    query = query.ilike("name", `%${search}%`);
if (categoryId) query = query.eq("category_id", categoryId);
if (minPrice)   query = query.gte("price", Number(minPrice));
if (maxPrice)   query = query.lte("price", Number(maxPrice));
query = query.order("name");
```

4. **Transform products**: Maps each Supabase row to a `ProductItem` object, extracting the category name from the joined `categories` relation, and generating the public image URL via `getProductImageUrl()`.

**Props passed to `ProductSection`**:

| Prop         | Type               | Description                              |
|--------------|--------------------|------------------------------------------|
| `products`   | `ProductItem[]`    | Filtered product list                    |
| `categories` | `CategoryItem[]`   | All active categories for sidebar        |
| `filters`    | `Filters`          | Current filter state (search, slug, prices) |

---

### 2. `src/components/shop/ProductSection.astro` — Layout Wrapper

**Role**: Arranges the sidebar + product grid in a flex layout. Handles empty state.

**Props Interface**:

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

**Layout Structure**:

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

**Empty State**: When `products.length === 0`, a centered message with a "Limpiar filtros" link to `/shop` is displayed instead of the grid.

**CSS Grid Breakpoints**:

| Breakpoint       | Columns | Gap    |
|------------------|---------|--------|
| Desktop (>900px) | auto-fill, min 260px | 1.5rem |
| Tablet (≤768px)  | 2       | 1rem   |
| Mobile (≤480px)  | 1       | —      |

**Sidebar/Grid Direction**: On screens ≤900px, the flex container switches to `flex-direction: column`, stacking the sidebar above the grid.

---

### 3. `src/components/shop/SibarCategory.astro` — Filter Sidebar

**Role**: Displays category navigation and price range filter. The only component with client-side JavaScript.

**Props Interface**: Same `Categories` and `Filters` from above.

**Emoji Icon Map**:

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

Categories not in the map use the fallback 📦 emoji. The map uses the category `slug` as key.

**URL Builder Utility**:

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

This function is used server-side to generate `<a href>` links that preserve existing filter parameters while setting/clearing a specific one.

**Category Links**: Each category (including "Todos") is an `<a>` tag linking to `/shop?<params>`. The active category gets the `.active` CSS class. Clicking a category triggers a full-page navigation (SSR approach).

**Price Range Slider**:
- HTML `<input type="range" min="0" max="100">`
- Default value: current `maxPrice` param, or `100` (no filter)
- **Client-side `<script>`** handles interactivity:
  - `input` event: updates the displayed price label in real-time (`S/ {value}`)
  - `change` event: fires on thumb release → reads all query params from `window.location.search`, sets or deletes `maxPrice`, and navigates to `/shop?<newParams>`

**Clear Filters Button**: Simple `<a href="/shop">` — navigates to the base shop URL with no query params.

**CSS Highlights**:
- `.sidebar`: `width: 260px`, `position: sticky` (top: 80px, to clear the navbar), `align-self: flex-start`
- `.item.active`: Green gradient left border (`linear-gradient(90deg, var(--color-primary-glow), transparent)`) with `border-left: 3px solid var(--color-primary)` and `color: var(--color-primary)`
- `.range`: `accent-color: var(--color-primary)` for the slider thumb color

---

### 4. `src/components/ui/ProductCard.astro` — Product Card

**Role**: Renders a single product in the grid. Presentational only — no interactivity (the "Añadir al carrito" button is a placeholder).

**Props Interface**:

```ts
interface Props {
  name: string;           // Product display name
  imageUrl: string;       // Full Supabase Storage URL (or fallback)
  price: number;          // Current price
  compareAtPrice?: number | null;  // Original price for discount display
  category: string;       // Category name (for label)
  badge?: string;         // Optional badge text (e.g., "Nuevo", "Oferta")
}
```

**Price Formatting**: Uses `Intl.NumberFormat` with `es-PE` locale (Peruvian Soles), always showing 2 decimal places.

**Display Fields**:
- **Badge** (optional): Positioned absolute at the top center, green pill with shadow
- **Image**: 220px height container, `object-fit: cover`, lazy loaded. Hover triggers `scale(1.05)`
- **Category label**: Uppercase, muted text, small font
- **Name**: Product title, white, 600 weight
- **Compare-at price**: Shown with line-through if `compareAtPrice` is set and non-null
- **Active price**: Green (`var(--color-primary)`), large (1.4rem), 800 weight
- **Buy button**: Full-width, translucent green background, turns solid green on hover with glow shadow

**Hover Effect**: The entire card lifts `translateY(-5px)` and the border changes to the primary color.

---

### 5. `src/components/layout/Navbar.astro` — Search Form

**Role**: Site-wide navigation bar. Conditionally renders a search form only on the `/shop` route.

**Search Form** (visible only when `currentPath === "/shop"`):

```html
<form action="/shop" method="GET" class="search-form">
  <!-- Hidden inputs preserve existing filters -->
  <input type="hidden" name="category" value={currentCategory} />
  <input type="hidden" name="minPrice" value={currentMinPrice} />
  <input type="hidden" name="maxPrice" value={currentMaxPrice} />
  <!-- Visible search input -->
  <input type="text" name="search" placeholder="Buscar productos..."
         class="input-search" value={currentSearch} />
</form>
```

**How It Works**:
- `action="/shop" method="GET"`: Submits to the shop page via GET
- Hidden `<input>` fields preserve `category`, `minPrice`, `maxPrice` from the current URL
- The visible text input has `name="search"`, so its value is passed as `?search=...`
- Pressing Enter while focused on the search input triggers form submission
- The page reloads with the combined query string

---

### 6. `src/lib/supabase.ts` — Database Client

**Role**: Creates and configures the Supabase client. Exports helper functions for product images.

**Environment Variables Required**:

| Variable                            | Description                              |
|-------------------------------------|------------------------------------------|
| `SUPABASE_TARGET`                   | `"local"` or `"cloud"`                   |
| `SUPABASE_CLOUD_URL`                | Cloud Supabase project URL               |
| `SUPABASE_CLOUD_PUBLISHABLE_KEY`    | Cloud Supabase anon/public key           |
| `SUPABASE_LOCAL_URL`                | Local Supabase instance URL              |
| `SUPABASE_LOCAL_PUBLISHABLE_KEY`    | Local Supabase anon/public key           |
| `SUPABASE_PRODUCT_IMAGE_BUCKET`     | Storage bucket name for product images   |

**Exported Functions**:

| Function                   | Description                                          |
|----------------------------|------------------------------------------------------|
| `supabase`                 | Typed Supabase client instance                       |
| `getSupabasePublicUrl()`   | Returns public URL for any file in a Supabase bucket |
| `getProductImageUrl()`     | Shortcut: `getSupabasePublicUrl(productImageBucket, path)` |
| `getRequiredEnv()`         | Validates an env var exists, throws if missing       |

**Image Fallback**: In `shop.astro`, if a product has no `image_storage_key`, it falls back to `/images/general-img-square.png`.

---

### 7. `src/lib/supabase.types.ts` — Database Type Definitions

Generated TypeScript types for the Supabase schema. The relevant tables for the shop page are:

#### `categories` Table

| Column      | Type          | Description                    |
|-------------|---------------|--------------------------------|
| `id`        | `string` (PK) | UUID primary key               |
| `name`      | `string`      | Display name (e.g., "Proteínas") |
| `slug`      | `string`      | URL-safe identifier ("proteinas") |
| `description` | `string?`   | Optional description           |
| `is_active` | `boolean`     | Whether the category is visible |
| `sort_order` | `number`     | Display order (ascending)      |
| `created_at` | `string`     | ISO timestamp                  |
| `updated_at` | `string`     | ISO timestamp                  |

#### `products` Table

| Column              | Type          | Description                           |
|---------------------|---------------|---------------------------------------|
| `id`                | `string` (PK) | UUID primary key                      |
| `category_id`       | `string` (FK) | Foreign key to `categories.id`        |
| `name`              | `string`      | Product name                          |
| `slug`              | `string`      | URL-safe identifier                   |
| `sku`               | `string`      | Stock keeping unit                    |
| `description`       | `string?`     | Product description                   |
| `price`             | `number`      | Current sale price                    |
| `compare_at_price`  | `number?`     | Original price (for discount display) |
| `stock`             | `number`      | Inventory count                       |
| `is_active`         | `boolean`     | Whether the product is visible        |
| `is_top_seller`     | `boolean`     | Top seller flag                       |
| `image_storage_key` | `string?`     | Path in Supabase Storage bucket       |
| `created_at`        | `string`      | ISO timestamp                         |
| `updated_at`        | `string`      | ISO timestamp                         |

**Foreign Key**: `products.category_id` → `categories.id` (one-to-many: one category has many products)

---

### 8. `src/layouts/MainLayout.astro` — Page Shell

**Role**: Wraps every page with Navbar + content slot + Footer.

```
BaseLayout (HTML head, metadata)
  └── MainLayout
        ├── Navbar
        ├── <slot />  ← shop page content goes here
        └── Footer
```

The `min-height: 100vh` on `.main-layout` and `flex: 1` on `<main>` ensures the footer stays at the bottom even on short pages.

---

## Filtering System — Detailed Mechanics

### Parameter Interaction

All filters are **cumulative** — they stack and narrow results:

```
/shop?category=proteinas&search=whey&maxPrice=80
       ↑                      ↑             ↑
       |                      |             └── Max price S/ 80
       |                      └── Name contains "whey"
       └── Category = "proteinas"
```

### Category Filtering

1. Read `?category={slug}` from the URL
2. Look up the slug in the `categories` table to get the `id`
3. Use the resolved `category_id` to filter products
4. If the slug doesn't match any active category, the filter is silently ignored (no error)

### Search Filtering

1. Read `?search={term}` from the URL
2. Use Supabase's `ilike()` for **case-insensitive** partial matching on `products.name`
3. The `%` wildcards enable substring matching (e.g., "whey" matches "Whey Protein Isolate")

### Price Range Filtering

1. Read `?minPrice={n}` and/or `?maxPrice={n}` from the URL
2. Use Supabase's `gte()` and `lte()` for range filtering
3. The sidebar slider sets only `maxPrice` (client-side JS)
4. `minPrice` can be set manually via URL for future use

### Preserving Filters Across Actions

**Category click** → Preserves `search`, `minPrice`, `maxPrice` — updates `category`:
```
/shop?search=whey&maxPrice=50  + click "Proteínas"  →  /shop?search=whey&maxPrice=50&category=proteinas
```

**Search submit** → Preserves `category`, `minPrice`, `maxPrice` — updates `search`:
```
/shop?category=proteinas&maxPrice=50  + search "iso"  →  /shop?category=proteinas&maxPrice=50&search=iso
```

**Price slider change** → Reads all current params from `window.location.search`, updates `maxPrice`:
```
/shop?category=proteinas&search=whey  + slider to 60  →  /shop?category=proteinas&search=whey&maxPrice=60
```

**Clear filters** → Navigates to `/shop` with no params at all.

---

## CSS Theme Variables

The shop components reference these CSS custom properties (defined in `BaseLayout` or global styles):

| Variable                | Typical Value    | Usage                       |
|-------------------------|------------------|-----------------------------|
| `--bg-base`             | `#020617`        | Dark background             |
| `--bg-surface`          | `#0f172a`        | Card / sidebar background   |
| `--bg-surface-2`        | `#1e293b`        | Hover state background      |
| `--text-primary`        | `#f8fafc`        | Headings, product names     |
| `--text-secondary`      | `#cbd5e1`        | Sidebar items               |
| `--text-muted`          | `#94a3b8`        | Labels, subtitles           |
| `--color-primary`       | `#10b981`        | Green accent (borders, prices, hover) |
| `--color-primary-glow`  | Emerald glow     | Active state gradient       |
| `--border-color`        | `#1e293b`        | Card borders                |
| `--font-primary`        | System font      | Body text                   |

---

## Environment & Deployment

- **Framework**: Astro v6 (SSR mode)
- **Adapter**: `@astrojs/vercel`
- **Database**: Supabase (cloud-hosted PostgreSQL)
- **Storage**: Supabase Storage for product images
- **Runtime**: Node.js serverless functions on Vercel
- **Build output**: `.vercel/output/` → serverless function + static assets

---

## Future Enhancements (Not Yet Implemented)

| Feature                  | Current State                       |
|--------------------------|-------------------------------------|
| Pagination               | All products loaded at once         |
| Sorting (price, name, newest) | Only `order("name")` hardcoded |
| "Añadir al carrito" button | Placeholder — no cart logic       |
| Product detail page      | Not linked from cards               |
| Mobile filter drawer     | Sidebar stacks vertically on mobile |
| Debounced search         | Requires Enter/form submit          |
| SEO metadata per filter  | Static title "Tienda"               |
| minPrice slider/input    | Only `maxPrice` slider in sidebar   |

---

## File Index

```
src/
├── pages/
│   └── shop.astro                       # Page entry — SSR + Supabase queries
├── components/
│   ├── shop/
│   │   ├── ProductSection.astro         # Layout: sidebar + product grid
│   │   └── SibarCategory.astro          # Sidebar: categories + price slider
│   ├── ui/
│   │   └── ProductCard.astro            # Individual product card
│   └── layout/
│       └── Navbar.astro                 # Global navbar + conditional search form
├── lib/
│   ├── supabase.ts                      # Supabase client + helpers
│   └── supabase.types.ts                # Database type definitions
└── layouts/
    └── MainLayout.astro                 # Page shell (Navbar + slot + Footer)
```
