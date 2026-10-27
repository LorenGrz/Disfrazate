import { NextResponse, type NextRequest } from "next/server";
import { getCostume } from "@/lib/catalog";
import { isCustomSlug } from "@/lib/custom-costume";

/**
 * /disfraz/[slug] hace streaming (loading.tsx), y después de empezar a
 * streamear ya no se puede cambiar el status. Un slug desconocido se
 * resuelve acá, antes del render, para devolver un 404 de verdad.
 *
 * Los slugs scrapeados (`s-…`) viven en Supabase y el proxy no los consulta:
 * se deja pasar todo slug con ese formato y la página hace `notFound()`. Un
 * slug scrapeado inexistente devuelve 200 con la página de no encontrado:
 * es aceptable (no hay nada que indexar ni que romper).
 */
export function proxy(request: NextRequest) {
  const [, , rawSlug] = request.nextUrl.pathname.split("/");
  let slug = rawSlug ?? "";
  try {
    slug = decodeURIComponent(slug);
  } catch {
    // slug malformado: no existe
  }
  if (getCostume(slug) || isCustomSlug(slug)) return NextResponse.next();
  return NextResponse.rewrite(new URL("/disfraz-no-encontrado", request.url));
}

export const config = {
  matcher: "/disfraz/:slug",
};
