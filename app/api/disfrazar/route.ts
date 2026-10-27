import { NextResponse } from "next/server";
import { disfrazarBody } from "@/lib/api-schemas";
import { errorResponse, readJson } from "@/lib/api-response.server";
import { getCostume } from "@/lib/catalog";
import { hasEventAccess } from "@/lib/event-gate.server";
import { getImageProvider } from "@/lib/image-provider.server";
import { buildPrompt } from "@/lib/prompt";
import { getScene, getStyle } from "@/lib/scenes";
import { getUsageStore } from "@/lib/usage-store.server";

export const maxDuration = 60;

// La foto del usuario nunca se loguea ni se guarda: solo pasa al proveedor.
export async function POST(request: Request) {
  if (!(await hasEventAccess())) {
    return errorResponse(401, "unauthorized", "Falta el código del evento");
  }
  const parsed = disfrazarBody.safeParse(await readJson(request));
  if (!parsed.success) {
    return errorResponse(400, "invalid", "Pedido inválido");
  }
  const { photo, costumeSlug, sceneId, styleId } = parsed.data;
  const costume = getCostume(costumeSlug);
  const scene = getScene(sceneId);
  const style = getStyle(styleId);
  if (!costume || !scene || !style) {
    return errorResponse(400, "invalid", "Pedido inválido");
  }

  if (!(await getUsageStore().tryConsumeGeneration())) {
    return errorResponse(429, "limit", "Se nos acabaron los disfraces por hoy");
  }

  try {
    const result = await getImageProvider().generate({
      photoJpegB64: photo,
      prompt: buildPrompt({ costume, scene, style }),
    });
    if (result.ok) {
      return NextResponse.json({
        image: `data:image/jpeg;base64,${result.value.jpegB64}`,
        seed: result.value.seed,
      });
    }
    switch (result.error.kind) {
      case "offline":
        return errorResponse(503, "offline", "El probador está apagado");
      case "timeout":
        return errorResponse(
          504,
          "timeout",
          "El probador tardó demasiado. Probá de nuevo",
        );
      case "rejected":
        return errorResponse(
          422,
          "rejected",
          "No pudimos disfrazar esa foto. Probá con otra",
        );
    }
  } catch (error) {
    console.error("disfrazar falló", error instanceof Error ? error.name : "");
    return errorResponse(500, "internal", "Se rompió el probador");
  }
}
