import { NextResponse, type NextRequest } from "next/server";
import { getCostume } from "@/lib/catalog";

/**
 * /disfraz/[slug] hace streaming (loading.tsx), y después de empezar a
 * streamear ya no se puede cambiar el status. Un slug desconocido se
 * resuelve acá, antes del render, para devolver un 404 de verdad.
 */
export function proxy(request: NextRequest) {
  const [, , rawSlug] = request.nextUrl.pathname.split("/");
  let slug = rawSlug ?? "";
  try {
    slug = decodeURIComponent(slug);
  } catch {
    // slug malformado: no existe
  }
  if (getCostume(slug)) return NextResponse.next();
  return NextResponse.rewrite(new URL("/disfraz-no-encontrado", request.url));
}

export const config = {
  matcher: "/disfraz/:slug",
};
