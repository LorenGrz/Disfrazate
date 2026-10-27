import { eventoBody } from "@/lib/api-schemas";
import { errorResponse, readJson } from "@/lib/api-response.server";
import { grantEventAccess } from "@/lib/event-gate.server";

/** Pide el código sin salir de la página (lo usa el buscador). 204 + cookie, o 401. */
export async function POST(request: Request) {
  const parsed = eventoBody.safeParse(await readJson(request));
  if (!parsed.success || !(await grantEventAccess(parsed.data.code))) {
    return errorResponse(401, "unauthorized", "Ese código no es");
  }
  return new Response(null, { status: 204 });
}
