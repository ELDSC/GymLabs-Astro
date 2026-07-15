import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase.types";
import { getRequiredEnv } from "./supabase";

export type AdminSection = "products" | "categories" | "discounts" | "reports";

export type Feedback = {
  type: "success" | "error";
  message: string;
};

export type AdminCounts = Record<AdminSection, number>;

type AdminClient = SupabaseClient<Database>;

export function normalizeSearchValue(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function slugify(value: string) {
  return normalizeSearchValue(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

function normalizeDiscountCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

function parseCurrency(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;

  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function parseInteger(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;

  const parsed = Number.parseInt(text, 10);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export async function getAdminCounts(client: AdminClient): Promise<AdminCounts> {
  const [products, categories, discounts, reports] = await Promise.all([
    client.from("products").select("id", { count: "exact", head: true }).is("deleted_at", null),
    client.from("categories").select("id", { count: "exact", head: true }).is("deleted_at", null),
    client.from("discount_codes").select("id", { count: "exact", head: true }).is("deleted_at", null),
    // "reports" no es una tabla propia: mostramos el total de pedidos (purchases)
    // como indicador rápido en el tab de Reportes.
    (client as any).from("purchases").select("id", { count: "exact", head: true }),
  ]);

  return {
    products: products.count ?? 0,
    categories: categories.count ?? 0,
    discounts: discounts.count ?? 0,
    reports: reports.count ?? 0,
  };
}

export async function saveProduct(client: AdminClient, formData: FormData): Promise<Feedback> {
  const productId = String(formData.get("productId") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const skuInput = String(formData.get("sku") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const price = parseCurrency(formData.get("price"));
  const compareAtPrice = parseCurrency(formData.get("compareAtPrice"));
  const stock = parseInteger(formData.get("stock"));
  const isActive = formData.get("isActive") === "on";
  const isTopSeller = formData.get("isTopSeller") === "on";
  const removeImageValue = String(formData.get("removeImage") ?? "");
  const removeImage = removeImageValue === "on" || removeImageValue === "true";
  const imageFile = formData.get("image");
  const slug = slugify(slugInput || name);
  const sku = skuInput || `GYM-${Date.now()}`;

  if (!name) return { type: "error", message: "Debes indicar el nombre del producto." };
  if (!slug) return { type: "error", message: "El slug no puede quedar vacío." };
  if (!categoryId) return { type: "error", message: "Selecciona una colección." };
  if (!sku) return { type: "error", message: "Debes indicar el SKU del producto." };
  if (price === null || Number.isNaN(price) || price < 0) {
    return { type: "error", message: "El precio debe ser un número mayor o igual a 0." };
  }
  if (compareAtPrice !== null && (Number.isNaN(compareAtPrice) || compareAtPrice < price)) {
    return {
      type: "error",
      message: "El precio comparativo debe ser mayor o igual al precio base.",
    };
  }
  if (stock === null || Number.isNaN(stock) || stock < 0) {
    return { type: "error", message: "El stock debe ser un entero mayor o igual a 0." };
  }

  const bucket = getRequiredEnv("SUPABASE_PRODUCT_IMAGE_BUCKET");
  let previousImageStorageKey: string | null = null;
  let imageStorageKey: string | null = null;

  if (productId) {
    const { data: existingProduct, error: existingProductError } = await client
      .from("products")
      .select("image_storage_key")
      .eq("id", productId)
      .is("deleted_at", null)
      .maybeSingle();

    if (existingProductError) {
      return {
        type: "error",
        message: `No se pudo cargar el producto: ${existingProductError.message}`,
      };
    }

    previousImageStorageKey = existingProduct?.image_storage_key ?? null;
    imageStorageKey = previousImageStorageKey;
  }

  if (removeImage) {
    imageStorageKey = null;
  }

  if (imageFile instanceof File && imageFile.size > 0) {
    const extension = imageFile.name.includes(".")
      ? imageFile.name.split(".").pop()?.toLowerCase()
      : "bin";
    imageStorageKey = `admin/${slug}-${Date.now()}.${extension || "bin"}`;

    const { error: uploadError } = await client.storage
      .from(bucket)
      .upload(imageStorageKey, imageFile, {
        upsert: false,
        contentType: imageFile.type || undefined,
      });

    if (uploadError) {
      return {
        type: "error",
        message: `No se pudo subir la imagen: ${uploadError.message}`,
      };
    }
  }

  const payload = {
    category_id: categoryId,
    compare_at_price: compareAtPrice,
    deleted_at: null,
    description,
    image_storage_key: imageStorageKey,
    is_active: isActive,
    is_top_seller: isTopSeller,
    name,
    name_search: normalizeSearchValue(name),
    price,
    sku,
    slug,
    stock,
  };

  const { error } = productId
    ? await client.from("products").update(payload).eq("id", productId)
    : await client.from("products").insert(payload);

  if (error) {
    return {
      type: "error",
      message: `No se pudo ${productId ? "guardar" : "agregar"} el producto: ${error.message}`,
    };
  }

  if (previousImageStorageKey && previousImageStorageKey !== imageStorageKey) {
    await client.storage.from(bucket).remove([previousImageStorageKey]);
  }

  return {
    type: "success",
    message: productId ? "Producto actualizado." : "Producto agregado.",
  };
}

export async function deleteProduct(client: AdminClient, formData: FormData): Promise<Feedback> {
  const productId = String(formData.get("productId") ?? "").trim();

  if (!productId) return { type: "error", message: "No se recibió el producto a eliminar." };

  const { error } = await client
    .from("products")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", productId)
    .is("deleted_at", null);

  return error
    ? { type: "error", message: `No se pudo eliminar el producto: ${error.message}` }
    : { type: "success", message: "Producto eliminado." };
}

export async function saveCategory(client: AdminClient, formData: FormData): Promise<Feedback> {
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const sortOrder = parseInteger(formData.get("sortOrder"));
  const isActive = formData.get("isActive") === "on";
  const slug = slugify(slugInput || name);

  if (!name) return { type: "error", message: "Ingresa el nombre de la colección." };
  if (!slug) return { type: "error", message: "El slug de la colección no puede quedar vacío." };
  if (sortOrder === null || Number.isNaN(sortOrder)) {
    return { type: "error", message: "El orden debe ser un número entero." };
  }

  const payload = {
    deleted_at: null,
    description,
    is_active: isActive,
    name,
    slug,
    sort_order: sortOrder,
  };

  const { error } = categoryId
    ? await client.from("categories").update(payload).eq("id", categoryId)
    : await client.from("categories").insert(payload);

  return error
    ? {
        type: "error",
        message: `No se pudo ${categoryId ? "guardar" : "crear"} la colección: ${error.message}`,
      }
    : {
        type: "success",
        message: categoryId ? "Colección actualizada." : "Colección creada.",
      };
}

export async function deleteCategory(client: AdminClient, formData: FormData): Promise<Feedback> {
  const categoryId = String(formData.get("categoryId") ?? "").trim();

  if (!categoryId) return { type: "error", message: "No se recibió la colección a eliminar." };

  const { count, error: countError } = await client
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId)
    .is("deleted_at", null);

  if (countError) {
    return {
      type: "error",
      message: `No se pudo validar la colección: ${countError.message}`,
    };
  }

  if ((count ?? 0) > 0) {
    return {
      type: "error",
      message: "No puedes eliminar una colección que todavía tiene productos.",
    };
  }

  const { error } = await client
    .from("categories")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", categoryId)
    .is("deleted_at", null);

  return error
    ? { type: "error", message: `No se pudo eliminar la colección: ${error.message}` }
    : { type: "success", message: "Colección eliminada." };
}

export async function saveDiscount(client: AdminClient, formData: FormData): Promise<Feedback> {
  const discountId = String(formData.get("discountId") ?? "").trim();
  const code = normalizeDiscountCode(String(formData.get("code") ?? ""));
  const percentage = parseInteger(formData.get("percentage"));
  const isActive = formData.get("isActive") === "on";

  if (!code) return { type: "error", message: "Ingresa el código." };
  if (percentage === null || Number.isNaN(percentage) || percentage < 1 || percentage > 100) {
    return { type: "error", message: "El porcentaje debe estar entre 1 y 100." };
  }

  const payload = {
    code,
    deleted_at: null,
    is_active: isActive,
    percentage,
  };

  const { error } = discountId
    ? await client.from("discount_codes").update(payload).eq("id", discountId)
    : await client.from("discount_codes").insert(payload);

  return error
    ? {
        type: "error",
        message: `No se pudo ${discountId ? "guardar" : "crear"} el código: ${error.message}`,
      }
    : {
        type: "success",
        message: discountId ? "Código actualizado." : "Código creado.",
      };
}

export async function deleteDiscount(client: AdminClient, formData: FormData): Promise<Feedback> {
  const discountId = String(formData.get("discountId") ?? "").trim();

  if (!discountId) return { type: "error", message: "No se recibió el código a eliminar." };

  const { error } = await client
    .from("discount_codes")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", discountId)
    .is("deleted_at", null);

  return error
    ? { type: "error", message: `No se pudo eliminar el código: ${error.message}` }
    : { type: "success", message: "Código eliminado." };
}