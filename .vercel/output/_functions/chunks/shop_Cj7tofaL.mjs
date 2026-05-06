import { c as createComponent } from './astro-component_BKORtGNl.mjs';
import 'piccolore';
import { m as maybeRenderHead, h as addAttribute, r as renderTemplate, l as renderHead, n as renderSlot, o as renderComponent } from './entrypoint_D90XKsGY.mjs';
import 'clsx';
import { createClient } from '@supabase/supabase-js';

const env = {
  SUPABASE_TARGET: "cloud",
  SUPABASE_CLOUD_URL: "https://hasuqmxzhjqphgxizykk.supabase.co",
  SUPABASE_CLOUD_PUBLISHABLE_KEY: "sb_publishable_KgCVwRb1s-OXE4F9hHaepg_CE-5qPBf",
  SUPABASE_LOCAL_URL: "http://127.0.0.1:64321",
  SUPABASE_LOCAL_PUBLISHABLE_KEY: "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH",
  SUPABASE_PRODUCT_IMAGE_BUCKET: "products",
  SUPABASE_HOME_VIDEO_BUCKET: "videos",
  SUPABASE_HOME_VIDEO_PATH: "main_video.mp4"
};
function getRequiredEnv(name) {
  const value = env[name];
  if (!value) {
    throw new Error(`${name} must be configured.`);
  }
  return value;
}
const supabaseTarget = getRequiredEnv("SUPABASE_TARGET");
const supabaseConfigByTarget = {
  cloud: {
    url: env.SUPABASE_CLOUD_URL,
    publishableKey: env.SUPABASE_CLOUD_PUBLISHABLE_KEY
  },
  local: {
    url: env.SUPABASE_LOCAL_URL,
    publishableKey: env.SUPABASE_LOCAL_PUBLISHABLE_KEY
  }
};
const selectedConfig = supabaseConfigByTarget[supabaseTarget];
if (!selectedConfig) {
  throw new Error(
    `Invalid SUPABASE_TARGET "${supabaseTarget}". Use "local" or "cloud".`
  );
}
if (!selectedConfig.url || !selectedConfig.publishableKey) {
  throw new Error(
    `Supabase environment variables are not configured for target "${supabaseTarget}".`
  );
}
const supabase = createClient(
  selectedConfig.url,
  selectedConfig.publishableKey
);
function getSupabasePublicUrl(bucket, path) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
const productImageBucket = getRequiredEnv("SUPABASE_PRODUCT_IMAGE_BUCKET");
function getProductImageUrl(path) {
  return getSupabasePublicUrl(productImageBucket, path);
}

const icon = new Proxy({"src":"/_astro/icon.CdlAjPtU.jpeg","width":909,"height":1029,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/saran/OneDrive/Desktop/Marcos Web/Proyecto - Astro/GymLabs-Astro/src/assets/icon.jpeg";
							}
							
							return target[name];
						}
					});

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const sponsors = [
    {
      name: "Equinox",
      logo: getSupabasePublicUrl("logos", "bodytech_logo.png"),
      url: "https://landing-btperu.bodytech.co/"
    },
    {
      name: "Greens",
      logo: getSupabasePublicUrl("logos", "greens_logo.png"),
      url: "https://greensfitnessstudio.in/"
    },
    {
      name: "SmartFit",
      logo: getSupabasePublicUrl("logos", "smartfit_logo.png"),
      url: "https://www.smartfit.com.pe/"
    }
  ];
  return renderTemplate`${maybeRenderHead()}<footer class="footer" data-astro-cid-35ed7um5> <div class="footer-grid" data-astro-cid-35ed7um5> <div class="footer-col brand" data-astro-cid-35ed7um5> <h3 class="logo" data-astro-cid-35ed7um5> <img${addAttribute(icon.src, "src")} alt="Icon" width="20px" height="20px" data-astro-cid-35ed7um5>
Gym<span data-astro-cid-35ed7um5>Labs</span> </h3> <p class="description" data-astro-cid-35ed7um5>Premium Nutrition & Performance Apparel.</p> <div class="footer-sponsors" data-astro-cid-35ed7um5> <p class="sponsors-label" data-astro-cid-35ed7um5>Marcas aliadas</p> <div class="sponsors-logos" data-astro-cid-35ed7um5> ${sponsors.map(
    (sponsor) => sponsor.url ? renderTemplate`<a${addAttribute(sponsor.url, "href")} target="_blank" rel="noopener noreferrer"${addAttribute(`Visitar ${sponsor.name}`, "aria-label")} class="sponsor-link" data-astro-cid-35ed7um5> <img${addAttribute(sponsor.logo, "src")}${addAttribute(`Logo de ${sponsor.name}`, "alt")} class="sponsor-logo" data-astro-cid-35ed7um5> </a>` : renderTemplate`<img${addAttribute(sponsor.logo, "src")}${addAttribute(`Logo de ${sponsor.name}`, "alt")} class="sponsor-logo" data-astro-cid-35ed7um5>`
  )} </div> </div> </div> <div class="footer-col" data-astro-cid-35ed7um5> <h4 data-astro-cid-35ed7um5>Navegación</h4> <ul data-astro-cid-35ed7um5> <li data-astro-cid-35ed7um5><a href="/categorias" data-astro-cid-35ed7um5>Categorias</a></li> <li data-astro-cid-35ed7um5><a href="/ofertas" data-astro-cid-35ed7um5>Ofertas</a></li> <li data-astro-cid-35ed7um5><a href="/opiniones" data-astro-cid-35ed7um5>Opiniones</a></li> </ul> </div> <div class="footer-col" data-astro-cid-35ed7um5> <h4 data-astro-cid-35ed7um5>Canales</h4> <div class="social-links" data-astro-cid-35ed7um5> <a href="https://instagram.com" target="_blank" data-astro-cid-35ed7um5>Instagram</a> <a href="https://youtube.com" target="_blank" data-astro-cid-35ed7um5>YouTube</a> <a href="mailto:hola@gymlabs.pe" data-astro-cid-35ed7um5>hola@gymlabs.pe</a> </div> </div> </div> <div class="footer-bottom" data-astro-cid-35ed7um5> <p data-astro-cid-35ed7um5>© ${year} GymLabs.</p> </div> </footer>`;
}, "C:/Users/saran/OneDrive/Desktop/Marcos Web/Proyecto - Astro/GymLabs-Astro/src/components/layout/Footer.astro", void 0);

const $$Navbar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Navbar;
  const currentPath = Astro2.url.pathname;
  return renderTemplate`${maybeRenderHead()}<nav class="navbar" aria-label="Navegación principal" data-astro-cid-jp2pq5zm> <div class="nav-container" data-astro-cid-jp2pq5zm> <a href="/" class="logo" data-astro-cid-jp2pq5zm> <img${addAttribute(icon.src, "src")} alt="Icon" width="20px" height="20px" data-astro-cid-jp2pq5zm>
Gym
<span data-astro-cid-jp2pq5zm>Labs</span> </a> <div class="opt" data-astro-cid-jp2pq5zm> ${currentPath === "/shop" && renderTemplate`<input type="text" placeholder="Buscar productos..." class="input-search" data-astro-cid-jp2pq5zm>`} </div> <ul class="nav-links" data-astro-cid-jp2pq5zm> <li data-astro-cid-jp2pq5zm><a href="/" data-astro-cid-jp2pq5zm>Home</a></li> <li data-astro-cid-jp2pq5zm><a href="/shop" data-astro-cid-jp2pq5zm>Tienda</a></li> <li data-astro-cid-jp2pq5zm><a href="/ofertas" data-astro-cid-jp2pq5zm>Ofertas</a></li> <li data-astro-cid-jp2pq5zm><a href="/about-us" data-astro-cid-jp2pq5zm>Sobre Nosotros</a></li> <li data-astro-cid-jp2pq5zm><a href="/contacto" data-astro-cid-jp2pq5zm>Contacto</a></li> </ul> </div> </nav>`;
}, "C:/Users/saran/OneDrive/Desktop/Marcos Web/Proyecto - Astro/GymLabs-Astro/src/components/layout/Navbar.astro", void 0);

const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$BaseLayout;
  const {
    title,
    description = "GymLabs - Premium Nutrition & Performance Apparel"
  } = Astro2.props;
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description"${addAttribute(description, "content")}><title>${title} | GymLabs</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet"><link rel="icon" type="image/jpeg"${addAttribute(icon.src, "href")}>${renderHead()}</head> <body> ${renderSlot($$result, $$slots["default"])}</body></html>`;
}, "C:/Users/saran/OneDrive/Desktop/Marcos Web/Proyecto - Astro/GymLabs-Astro/src/layouts/BaseLayout.astro", void 0);

const $$MainLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$MainLayout;
  const { title, description } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title, "description": description, "data-astro-cid-ouamjn2i": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="main-layout" data-astro-cid-ouamjn2i> ${renderComponent($$result2, "Navbar", $$Navbar, { "data-astro-cid-ouamjn2i": true })} <main data-astro-cid-ouamjn2i> ${renderSlot($$result2, $$slots["default"])} </main> ${renderComponent($$result2, "Footer", $$Footer, { "data-astro-cid-ouamjn2i": true })} </div> ` })}`;
}, "C:/Users/saran/OneDrive/Desktop/Marcos Web/Proyecto - Astro/GymLabs-Astro/src/layouts/MainLayout.astro", void 0);

const $$ProductCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$ProductCard;
  const { name, imageUrl, price, compareAtPrice = null, category, badge } = Astro2.props;
  const formatPrice = (value) => new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
  return renderTemplate`${maybeRenderHead()}<article class="card" data-astro-cid-goqu7m2f> ${badge && renderTemplate`<span class="badge" data-astro-cid-goqu7m2f>${badge}</span>`} <div class="image-container" data-astro-cid-goqu7m2f> <img${addAttribute(imageUrl, "src")}${addAttribute(name, "alt")} loading="lazy" data-astro-cid-goqu7m2f> </div> <div class="content" data-astro-cid-goqu7m2f> <p class="category" data-astro-cid-goqu7m2f>${category}</p> <h3 data-astro-cid-goqu7m2f>${name}</h3> <div class="pricing" data-astro-cid-goqu7m2f> ${compareAtPrice && renderTemplate`<span class="old-price" data-astro-cid-goqu7m2f>S/ ${formatPrice(compareAtPrice)}</span>`} <span class="price" data-astro-cid-goqu7m2f>S/ ${formatPrice(price)}</span> </div> <button class="btn-buy" type="button" data-astro-cid-goqu7m2f>Anadir al carrito</button> </div> </article>`;
}, "C:/Users/saran/OneDrive/Desktop/Marcos Web/Proyecto - Astro/GymLabs-Astro/src/components/ui/ProductCard.astro", void 0);

const $$SibarCategory = createComponent(($$result, $$props, $$slots) => {
  const categorias = [
    { nombre: "Suplementos", icon: "💊", active: true },
    { nombre: "Ropa", icon: "👕" },
    { nombre: "Equipamiento", icon: "🏋️" },
    { nombre: "Novedades", icon: "✨" },
    { nombre: "Ofertas", icon: "🏷️" }
  ];
  return renderTemplate`${maybeRenderHead()}<aside class="sidebar" data-astro-cid-gfetvmcc> <h2 class="logo" data-astro-cid-gfetvmcc>GymLabs</h2> <div class="section" data-astro-cid-gfetvmcc> <p class="section-title" data-astro-cid-gfetvmcc>CATEGORÍAS</p> <span class="subtitle" data-astro-cid-gfetvmcc>Refina tu rendimiento</span> <ul class="menu" data-astro-cid-gfetvmcc> ${categorias.map((cat) => renderTemplate`<li${addAttribute(`item ${cat.active ? "active" : ""}`, "class")} data-astro-cid-gfetvmcc> <span class="icon" data-astro-cid-gfetvmcc>${cat.icon}</span> ${cat.nombre} </li>`)} </ul> </div> <div class="section" data-astro-cid-gfetvmcc> <p class="section-title" data-astro-cid-gfetvmcc>RANGO DE PRECIO</p> <input type="range" min="0" max="200" class="range" data-astro-cid-gfetvmcc> <div class="range-values" data-astro-cid-gfetvmcc> <span data-astro-cid-gfetvmcc>$0</span> <span data-astro-cid-gfetvmcc>$200+</span> </div> </div> <button class="btn-clear" data-astro-cid-gfetvmcc>LIMPIAR FILTROS</button> <div class="extra" data-astro-cid-gfetvmcc> <p data-astro-cid-gfetvmcc>💬 SOPORTE</p> <p data-astro-cid-gfetvmcc>📦 SEGUIMIENTO</p> </div> </aside>`;
}, "C:/Users/saran/OneDrive/Desktop/Marcos Web/Proyecto - Astro/GymLabs-Astro/src/components/shop/SibarCategory.astro", void 0);

const $$ProductSection = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$ProductSection;
  const { title = "Ofertas destacadas", products } = Astro2.props;
  return renderTemplate`<!-- TÍTULO -->${maybeRenderHead()}<div class="section__inner" data-astro-cid-w4t24pur> <div class="section__heading" data-astro-cid-w4t24pur> <h2 id="products-title" data-astro-cid-w4t24pur>${title}</h2> </div> </div> <!-- LAYOUT PRINCIPAL --> <div class="container" data-astro-cid-w4t24pur> <!-- SIDEBAR --> ${renderComponent($$result, "SibarCategory", $$SibarCategory, { "data-astro-cid-w4t24pur": true })} <!-- PRODUCTOS --> <section class="section" id="products-section" aria-labelledby="products-title" data-astro-cid-w4t24pur> <div class="products-grid" data-astro-cid-w4t24pur> ${products.map((product) => renderTemplate`${renderComponent($$result, "ProductCard", $$ProductCard, { ...product, "data-astro-cid-w4t24pur": true })}`)} </div> </section> </div>`;
}, "C:/Users/saran/OneDrive/Desktop/Marcos Web/Proyecto - Astro/GymLabs-Astro/src/components/shop/ProductSection.astro", void 0);

const prerender = false;
const $$Shop = createComponent(async ($$result, $$props, $$slots) => {
  let productsList = [];
  const { data, error } = await supabase.from("products").select(
    `
      id,
      name,
      slug,
      price,
      compare_at_price,
      image_storage_key,
      categories(name)
    `
  ).eq("is_active", true).order("name");
  if (error) {
    console.error("Error fetching products:", error);
  } else {
    productsList = (data ?? []).map((product) => {
      const categoryRelation = product.categories;
      const categoryName = Array.isArray(categoryRelation) ? categoryRelation[0]?.name : categoryRelation?.name;
      const imageUrl = product.image_storage_key ? getProductImageUrl(product.image_storage_key) : "/images/general-img-square.png";
      return {
        id: product.id,
        name: product.name,
        category: categoryName ?? "",
        imageUrl,
        price: Number(product.price),
        compareAtPrice: product.compare_at_price ? Number(product.compare_at_price) : null
      };
    });
  }
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Tienda", "data-astro-cid-5w43p2qc": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="shop" data-astro-cid-5w43p2qc> ${renderComponent($$result2, "ProductSection", $$ProductSection, { "title": "Todos los Productos", "products": productsList, "data-astro-cid-5w43p2qc": true })} </main> ` })}`;
}, "C:/Users/saran/OneDrive/Desktop/Marcos Web/Proyecto - Astro/GymLabs-Astro/src/pages/shop.astro", void 0);

const $$file = "C:/Users/saran/OneDrive/Desktop/Marcos Web/Proyecto - Astro/GymLabs-Astro/src/pages/shop.astro";
const $$url = "/shop";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Shop,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
