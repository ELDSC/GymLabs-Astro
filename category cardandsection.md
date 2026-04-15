# CategoryCard & CategoriesSection — Documentación

## ¿Qué hace esta sección?

La sección de categorías muestra 4 tarjetas (Proteína, Creatina, Accesorios, Ropa deportiva) con su nombre, descripción e ícono visual. Los íconos son **imágenes reales almacenadas en Supabase Storage**.

---

## Arquitectura: dos archivos, dos responsabilidades

```
CategoriesSection.astro   →   define los datos y los pasa
       ↓
CategoryCard.astro        →   recibe los datos y los renderiza
```

---

## Paso 1 — Dónde viven las imágenes

Las imágenes están en **Supabase Storage**, dentro del bucket llamado `icons` (configurado como PUBLIC):

```
Supabase Storage
  └── icons/  (bucket PUBLIC)
        ├── proteina_icon.png
        ├── creatina_icon.png
        ├── gym_accesorie.png
        └── ropa_deportiva.png
```

Al ser un bucket público, cada imagen tiene una URL accesible desde el navegador sin autenticación.

---

## Paso 2 — Cómo se genera la URL de cada imagen

En `src/lib/supabase.ts` existe una función auxiliar:

```ts
export function getSupabasePublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
```

Esta función recibe:
- `bucket` → el nombre del bucket (`"icons"`)
- `path` → el nombre del archivo (`"proteina_icon.png"`)

Y devuelve una URL pública completa como:

```
https://[proyecto].supabase.co/storage/v1/object/public/icons/proteina_icon.png
```

---

## Paso 3 — CategoriesSection define y prepara los datos

`CategoriesSection.astro` importa la función y construye el array de categorías en su frontmatter (el bloque `---`):

```astro
---
import CategoryCard from "./CategoryCard.astro";
import { getSupabasePublicUrl } from "../../lib/supabase";

const categories = [
  {
    id: "1",
    title: "Proteína",
    description: "Suplementos para ganar masa muscular",
    iconUrl: getSupabasePublicUrl("icons", "proteina_icon.png"),
  },
  {
    id: "2",
    title: "Creatina",
    description: "Mejora tu rendimiento",
    iconUrl: getSupabasePublicUrl("icons", "creatina_icon.png"),
  },
  // ... etc
];
---
```

> En Astro, el frontmatter se ejecuta en el **servidor** en tiempo de build/request. Nunca llega al navegador como JavaScript.

---

## Paso 4 — CategoriesSection pasa los datos a CategoryCard

En la plantilla HTML de `CategoriesSection`, se itera el array con `.map()` y se monta un `<CategoryCard>` por cada categoría:

```astro
{
  categories.map((category) => (
    <CategoryCard
      title={category.title}
      description={category.description}
      iconUrl={category.iconUrl}
    />
  ))
}
```

Cada prop que se pasa (`title`, `description`, `iconUrl`) debe coincidir **exactamente** con los nombres definidos en la interfaz `Props` de `CategoryCard`.

---

## Paso 5 — CategoryCard recibe y renderiza

`CategoryCard.astro` declara su interfaz de props y los usa en el HTML:

```astro
---
interface Props {
  title: string;
  description: string;
  iconUrl: string;   // ← recibe la URL completa de Supabase
}

const { title, description, iconUrl } = Astro.props;
---

<article class="category-card">
  <div class="category-card__icon">
    <img src={iconUrl} alt={title} width="40" height="40" />
  </div>
  <h3>{title}</h3>
  <p>{description}</p>
</article>
```

El `<img src={iconUrl}>` apunta directamente a la URL pública de Supabase, y el navegador la carga como cualquier imagen externa.

---

## Flujo completo de datos

```
Supabase Storage (bucket "icons")
         │
         ▼
getSupabasePublicUrl("icons", "proteina_icon.png")
         │
         ▼  genera:
"https://[proyecto].supabase.co/storage/v1/object/public/icons/proteina_icon.png"
         │
         ▼  se guarda en:
categories[0].iconUrl
         │
         ▼  se pasa como prop:
<CategoryCard iconUrl={category.iconUrl} />
         │
         ▼  se renderiza como:
<img src="https://[proyecto].supabase.co/.../proteina_icon.png" />
         │
         ▼
Navegador carga la imagen desde Supabase ✅
```

---

## ¿Por qué se cambió `iconLabel` por `iconUrl`?

### El problema original

`CategoryCard` fue creado inicialmente con una prop llamada `iconLabel` pensada para mostrar **texto** (una abreviatura o emoji) como ícono:

```astro
<!-- Props original -->
interface Props {
  iconLabel: string;  // ej: "PRO", "CR", "💪"
}

<!-- Uso original -->
<div class="category-card__icon">{iconLabel}</div>
```

### Por qué había que cambiarlo

Cuando se conectó Supabase, los datos pasaron a tener **URLs de imagen**, no texto. El nombre `iconLabel` ya no describía correctamente lo que contenía la variable — una URL no es un "label".

Además, TypeScript lanzaba error porque:

```
// CategoriesSection intentaba pasar:
iconUrl={category.iconUrl}   // ← prop que NO existía en CategoryCard

// CategoryCard solo aceptaba:
iconLabel: string            // ← prop diferente
```

### El cambio

| Antes | Después | Razón |
|---|---|---|
| `iconLabel: string` | `iconUrl: string` | El dato es una URL, no una etiqueta de texto |
| `{iconLabel}` (texto) | `<img src={iconUrl}>` | Las URLs se muestran como imágenes, no como texto |
| Sin import de supabase | `import { getSupabasePublicUrl }` | Se necesita la función para generar las URLs |
| `const { categories } = Astro.props` | Array definido localmente | El array de categorías vive en `CategoriesSection`, no viene de un padre |

---

## Errores comunes a evitar

| Error | Causa | Solución |
|---|---|---|
| Imagen no carga (404) | El nombre del archivo no coincide con el del bucket | Verificar mayúsculas/minúsculas en el nombre del archivo |
| TypeScript error "Property X does not exist" | El nombre del prop en el padre no coincide con la interfaz del hijo | Asegurarse que el nombre del prop sea idéntico en ambos archivos |
| Imágenes vacías / broken | `getSupabasePublicUrl` no fue importado | Agregar el import en `CategoriesSection.astro` |
| Array vacío | `categories` recibido como prop pero nadie lo pasa | Definir el array directamente dentro de `CategoriesSection` |
