export type AdminSection = "products" | "categories" | "discounts";

export interface ProductItem {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  isActive: boolean;
  isTopSeller: boolean;
  imageStorageKey: string | null;
  imageUrl: string | null;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

export interface DiscountItem {
  id: string;
  code: string;
  percentage: number;
  isActive: boolean;
}

export interface Feedback {
  type: "success" | "error";
  message: string;
}
