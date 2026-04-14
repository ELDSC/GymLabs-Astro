import { getProductImageUrl } from "../../lib/supabase";

export interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  oldPrice: number;
  badge?: string;
  featured?: boolean;
}

export const featuredProducts: Product[] = [
  {
    id: 1,
    name: "Gold Stand Whey Protein",
    image: getProductImageUrl("products/gold-stand-whey-protein.jpg"),
    price: 44.99,
    oldPrice: 59.99,
  },
  {
    id: 2,
    name: "Creatina Monohidratada",
    image: getProductImageUrl("products/creatina-monohidratada.png"),
    price: 24.99,
    oldPrice: 34.99,
    badge: "TOP VENTAS",
    featured: true,
  },
  {
    id: 3,
    name: "Shaker Pro Steel",
    image: getProductImageUrl("products/shaker-pro-steel.webp"),
    price: 12.99,
    oldPrice: 19.99,
  },
];
