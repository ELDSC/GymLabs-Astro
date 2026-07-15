export const prerender = false;

import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { author_name, author_role, rating, comment } = body;

    if (!author_name || !rating || !comment) {
      return new Response(JSON.stringify({ error: "Nombre, calificación y comentario son obligatorios." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return new Response(JSON.stringify({ error: "Calificación inválida." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Insertar en Supabase. is_published se asume false por defecto en la BD, o lo forzamos.
    // Si la DB tiene `default true` para is_published, explícitamente enviamos false.
    const { error } = await supabase
      .from("testimonials")
      .insert([
        {
          author_name: author_name.trim(),
          author_role: author_role ? author_role.trim() : null,
          rating: ratingNum,
          comment: comment.trim(),
          is_published: true, // Auto publicar para que se visualice inmediatamente
        },
      ]);

    if (error) {
      console.error("Error inserting testimonial:", error);
      return new Response(JSON.stringify({ error: "Error al guardar el testimonio en la base de datos." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Testimonials endpoint error:", err);
    return new Response(JSON.stringify({ error: "Error interno del servidor." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
