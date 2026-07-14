export const prerender = false;

import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { fullName, age, sex, items, discountCode } = body;

    if (!fullName || !age || !sex || !items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "Faltan datos obligatorios" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Calcular subtotal real (simulación)
    let subtotal = 0;
    for (const item of items) {
      if (item.price && item.quantity) {
        subtotal += item.price * item.quantity;
      }
    }

    let discountPercentage = 0;
    
    if (discountCode) {
      // Validar código
      const { data: codeData } = await supabase
        .from("discount_codes")
        .select("percentage")
        .eq("code", discountCode.toUpperCase())
        .eq("is_active", true)
        .is("deleted_at", null)
        .single();
        
      if (codeData) {
        discountPercentage = codeData.percentage;
      }
    }

    const discountAmount = (subtotal * discountPercentage) / 100;
    const total = subtotal - discountAmount;

    // Insertar compra en base de datos
    const { error } = await supabase
      .from("purchases")
      .insert([
        {
          full_name: fullName,
          age,
          sex,
          cart_items: items,
          subtotal,
          discount_code: discountCode || null,
          discount_amount: discountAmount,
          total,
        },
      ]);

    if (error) {
      console.error("Error inserting purchase:", error);
      return new Response(JSON.stringify({ error: "Error al procesar la compra" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, total }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Checkout endpoint error:", err);
    return new Response(JSON.stringify({ error: "Error de servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
