import { NextResponse } from "next/server";
import { escenasBody } from "@/lib/api-schemas";
import { errorResponse, readJson } from "@/lib/api-response.server";
import { hasEventAccess } from "@/lib/event-gate.server";
import { pickScenes } from "@/lib/pick-scenes";
import { getUsageStore } from "@/lib/usage-store.server";

export async function POST(request: Request) {
  if (!(await hasEventAccess())) {
    return errorResponse(401, "unauthorized", "Falta el código del evento");
  }
  const parsed = escenasBody.safeParse(await readJson(request));
  if (!parsed.success) {
    return errorResponse(400, "invalid", "Pedido inválido");
  }

  const store = getUsageStore();
  const picked = pickScenes(
    await store.getSceneUsage(),
    Math.random,
    parsed.data.count,
    parsed.data.exclude,
  );
  await store.incrementScenes(picked.map(({ scene }) => scene.id));

  return NextResponse.json({
    scenes: picked.map(({ scene, style }) => ({
      id: scene.id,
      label: scene.label,
      styleId: style.id,
      styleLabel: style.label,
    })),
  });
}
