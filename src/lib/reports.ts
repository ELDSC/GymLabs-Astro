import type { createSupabaseServerClient } from "./supabase";

export type ReportsRangeKey = "7d" | "30d" | "90d" | "all" | "custom";

export interface ReportsFilters {
  range: ReportsRangeKey;
  from?: string; // yyyy-mm-dd
  to?: string; // yyyy-mm-dd
}

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface ProductSalesSummary {
  id: string;
  name: string;
  unitsSold: number;
  revenue: number;
  averagePrice: number;
}

export interface DailySales {
  date: string; // yyyy-mm-dd
  total: number;
  orders: number;
}

export interface ReportsData {
  filters: ReportsFilters;
  from: string | null;
  to: string | null;
  stats: {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    averageTicket: number;
    ordersWithDiscount: number;
    ordersWithoutDiscount: number;
  };
  topProductsByUnits: ProductSalesSummary[];
  topProductsByRevenue: ProductSalesSummary[];
  dailySales: DailySales[];
  productsComparison: ProductSalesSummary[];
}

function resolveDateRange(filters: ReportsFilters) {
  const now = new Date();
  let from: Date | null = null;
  let to: Date | null = null;

  if (filters.range === "custom" && filters.from && filters.to) {
    from = new Date(`${filters.from}T00:00:00.000Z`);
    to = new Date(`${filters.to}T23:59:59.999Z`);
  } else if (filters.range === "7d") {
    from = new Date(now);
    from.setUTCDate(from.getUTCDate() - 7);
  } else if (filters.range === "30d") {
    from = new Date(now);
    from.setUTCDate(from.getUTCDate() - 30);
  } else if (filters.range === "90d") {
    from = new Date(now);
    from.setUTCDate(from.getUTCDate() - 90);
  }
  // "all" -> from y to quedan null (sin límite)

  return { from, to };
}

export function parseReportsFilters(url: URL): ReportsFilters {
  const from = url.searchParams.get("from") ?? undefined;
  const to = url.searchParams.get("to") ?? undefined;

  if (from && to) {
    return { range: "custom", from, to };
  }

  const range = url.searchParams.get("range") ?? "30d";

  if (range === "7d" || range === "30d" || range === "90d" || range === "all") {
    return { range };
  }

  return { range: "30d" };
}

export async function getReportsData(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  filters: ReportsFilters,
): Promise<ReportsData> {
  const { from, to } = resolveDateRange(filters);

  // TODO: quitar el "as any" cuando purchases esté en supabase.types.ts
  let query = (supabase as any)
    .from("purchases")
    .select(
      "id, full_name, cart_items, subtotal, discount_code, discount_amount, total, created_at",
    )
    .order("created_at", { ascending: true });

  if (from) {
    query = query.gte("created_at", from.toISOString());
  }

  if (to) {
    query = query.lte("created_at", to.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`No se pudieron cargar las compras: ${error.message}`);
  }

  const purchases = data ?? [];

  const productMap = new Map<string, ProductSalesSummary>();
  const dailyMap = new Map<string, DailySales>();
  const customerSet = new Set<string>();

  let totalRevenue = 0;
  let ordersWithDiscount = 0;
  let ordersWithoutDiscount = 0;

  for (const purchase of purchases) {
    const total = Number(purchase.total ?? 0);
    totalRevenue += total;

    const customerKey = (purchase.full_name ?? "").trim().toLowerCase();
    if (customerKey) {
      customerSet.add(customerKey);
    }

    if (purchase.discount_code) {
      ordersWithDiscount += 1;
    } else {
      ordersWithoutDiscount += 1;
    }

    const day = (purchase.created_at ?? "").slice(0, 10);
    if (day) {
      const existingDay = dailyMap.get(day) ?? { date: day, total: 0, orders: 0 };
      existingDay.total += total;
      existingDay.orders += 1;
      dailyMap.set(day, existingDay);
    }

    const items = Array.isArray(purchase.cart_items)
      ? (purchase.cart_items as CartItem[])
      : [];

    for (const item of items) {
      if (!item || !item.id) continue;

      const existing = productMap.get(item.id) ?? {
        id: item.id,
        name: item.name ?? "Producto sin nombre",
        unitsSold: 0,
        revenue: 0,
        averagePrice: 0,
      };

      const quantity = Number(item.quantity ?? 0);
      const price = Number(item.price ?? 0);

      existing.unitsSold += quantity;
      existing.revenue += quantity * price;

      productMap.set(item.id, existing);
    }
  }

  const products = Array.from(productMap.values()).map((product) => ({
    ...product,
    averagePrice: product.unitsSold > 0 ? product.revenue / product.unitsSold : 0,
  }));

  const topProductsByUnits = [...products]
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 8);

  const topProductsByRevenue = [...products]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  const dailySales = Array.from(dailyMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  const totalOrders = purchases.length;
  const totalCustomers = customerSet.size;
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    filters,
    from: from ? from.toISOString().slice(0, 10) : null,
    to: to ? to.toISOString().slice(0, 10) : null,
    stats: {
      totalOrders,
      totalRevenue,
      totalCustomers,
      averageTicket,
      ordersWithDiscount,
      ordersWithoutDiscount,
    },
    topProductsByUnits,
    topProductsByRevenue,
    dailySales,
    productsComparison: [...products]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10),
  };
}