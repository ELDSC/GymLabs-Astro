# GymLabs - Premium Nutrition & Performance Apparel 🚀

[![Astro](https://img.shields.io/badge/Astro-ff5a03?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Status](https://img.shields.io/badge/Status-Desarrollo-10b981?style=for-the-badge)](#)

GymLabs es una plataforma e-commerce desarrollada con **Astro**, enfocada en suplementación deportiva de alto rendimiento y ropa técnica. Este proyecto presenta una interfaz moderna y optimizada (Deep Blue & Emerald theme) que prioriza el rendimiento y la experiencia de usuario.

---

## 🏗️ Estructura del Proyecto

El proyecto sigue una arquitectura modular en Astro, separando layouts, componentes UI y páginas para mantener un código limpio y escalable:

```text
GymLabs-Astro/
├── src/
│   ├── assets/       # Imágenes, iconos y recursos estáticos
│   ├── components/   # Componentes reusables UI
│   │   ├── layout/   # Estructurales (Navbar.astro, Footer.astro)
│   │   └── ui/       # Componentes aislados (botones, inputs, cards)
│   ├── layouts/      # Plantillas base de las páginas (Layout.astro)
│   └── pages/        # Páginas enrutables (index.astro, shop.astro)
├── public/           # Archivos públicos estáticos
├── astro.config.mjs  # Configuración principal de Astro
└── package.json      # Dependencias y scripts
```

---

## 🎨 Diseño y Paleta de Colores (Deep Blue & Emerald)

Hemos definido una paleta global en nuestro `Layout.astro`.
- **Fondos:** `--bg-base` (`#020617`), `--bg-surface` (`#0f172a`).
- **Acentos:** `--color-primary` (`#10b981`, Emerald 500).
- **Tipografía:** `Manrope`, una fuente moderna y deportiva.

---

## 🧑‍🚀 Anotaciones y Datos Curiosos sobre Astro

Astro es un framework increíble para construir páginas web centradas en el contenido (como e-commerces, blogs o portafolios). Aquí te dejo algunos datos geniales sobre la tecnología que sostiene GymLabs:

### 🏝️ Arquitectura de Islas (Island Architecture)
Astro es pionero en la **Arquitectura de Islas**. Por defecto, Astro envía **cero JavaScript al cliente** (Zero-JS by default). Esto significa que nuestra página cargará extremadamente rápido porque es puro HTML/CSS. Si luego necesitamos agregar interactividad (ejemplo, el carrito de compras con React o Vue), podemos "hidratar" solo esa pequeña parte del código (esa "isla"), dejando el resto de la página estática y rápida.

### 🔌 Framework Agnostic
Astro no te obliga a casarte con una librería. En `GymLabs` podemos construir componentes interactivos usando react (`.jsx`), vue (`.vue`), o svelte (`.svelte`) mezclados dentro del mismo proyecto si surge la necesidad. Astro los junta todos sin problema.

### 💨 Velocidad Inigualable
Astro consistentemente le gana a frameworks como Next.js o Nuxt en métricas de Core Web Vitals para sitios estáticos, simplemente porque no carga un paquete pesado de JavaScript "SPA" (Single Page Application) al inicio.

### 🧪 Slots y Layouts Dinámicos
En Astro, la etiqueta `<slot />` es ultrapoderosa. Nos permite inyectar el contenido de cada página directamente dentro de nuestro Layout global (`Layout.astro`), haciendo que el Footer y el Navbar nunca tengan que duplicarse en el código.

---

## 🧞 Cómo Ejecutar el Proyecto

Todos los comandos se corren desde la raíz del proyecto usando bash/powershell:

| Comando         | Acción                                       |
|:----------------|:---------------------------------------------|
| `npm install`   | Instala todas las dependencias               |
| `npm run dev`   | Inicia el servidor local en `localhost:4321` |
| `npm run build` | Compila la versión de producción a `./dist/` |

## 🔐 Variables de Entorno para Supabase

El proyecto soporta dos targets de Supabase: `local` y `cloud`.

```env
SUPABASE_TARGET="local"

SUPABASE_LOCAL_URL="http://127.0.0.1:64321"
SUPABASE_LOCAL_PUBLISHABLE_KEY="sb_publishable_..."

SUPABASE_CLOUD_URL="https://PROJECT-REF.supabase.co"
SUPABASE_CLOUD_PUBLISHABLE_KEY="sb_publishable_..."

SUPABASE_HOME_VIDEO_BUCKET="videos"
SUPABASE_HOME_VIDEO_PATH="main_video.mp4"
```

Uso:
- `SUPABASE_TARGET="local"` usa el stack local de Supabase
- `SUPABASE_TARGET="cloud"` usa el proyecto remoto en Supabase Cloud
- El video de home se resuelve desde `bucket + path`, no con una URL hardcodeada, para que funcione en ambos entornos

No uses claves `service_role` en este proyecto.

## 📝 Próximos Pasos (Roadmap)
- [ ] Implementar `Navbar.astro` con soporte responsivo y glassmorphism.
- [ ] Construir la grilla de productos en `shop.astro`.
- [ ] Implementar animaciones.

---
*Desarrollado con 💪 por el equipo de GymLabs.*
