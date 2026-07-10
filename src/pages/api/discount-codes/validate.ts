import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const prerender = false;

function normalizeCode(value: unknown) {
  return String(value ?? "").trim().toUpperCase();
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export const POST: APIRoute = async ({ request }) => {
  let payload: { code?: unknown; subtotal?: unknown };

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { error: "El cuerpo debe ser JSON válido." },
      { status: 400 },
    );
  }

  const code = normalizeCode(payload.code);
  const subtotal = Number(payload.subtotal);

  if (!code) {
    return Response.json(
      { error: "Debes enviar un código de descuento." },
      { status: 400 },
    );
  }

  if (!Number.isFinite(subtotal) || subtotal < 0) {
    return Response.json(
      { error: "El subtotal debe ser un número mayor o igual a 0." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("discount_codes")
    .select("code, percentage")
    .eq("code", code)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    return Response.json(
      { error: "No se pudo validar el código." },
      { status: 500 },
    );
  }

  if (!data) {
    return Response.json(
      { error: "El código no existe o no está activo." },
      { status: 404 },
    );
  }

  const discountAmount = roundCurrency(subtotal * (data.percentage / 100));
  const total = roundCurrency(Math.max(subtotal - discountAmount, 0));

  return Response.json({
    code: data.code,
    percentage: data.percentage,
    subtotal: roundCurrency(subtotal),
    discountAmount,
    total,
  });
};
