import type { SceneRef } from "./probador-state";

export type ApiOutcome<T> =
  { ok: true; value: T } | { ok: false; status: number; message: string };

const NETWORK_ERROR =
  "No pudimos conectar. Revisá tu internet y probá de nuevo";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function errorMessage(body: unknown): string {
  if (isRecord(body) && isRecord(body.error)) {
    const { message } = body.error;
    if (typeof message === "string") return message;
  }
  return "Algo salió mal. Probá de nuevo";
}

async function post(
  url: string,
  payload: unknown,
  signal: AbortSignal,
): Promise<ApiOutcome<unknown>> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
    const body: unknown = await response.json().catch(() => undefined);
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: errorMessage(body),
      };
    }
    return { ok: true, value: body };
  } catch {
    return { ok: false, status: 0, message: NETWORK_ERROR };
  }
}

function toSceneRef(value: unknown): SceneRef | undefined {
  if (!isRecord(value)) return undefined;
  const { id, label, styleId, styleLabel } = value;
  if (
    typeof id === "string" &&
    typeof label === "string" &&
    typeof styleId === "string" &&
    typeof styleLabel === "string"
  ) {
    return { id, label, styleId, styleLabel };
  }
  return undefined;
}

export async function requestScenes(
  costumeSlug: string,
  count: number,
  exclude: readonly string[],
  signal: AbortSignal,
): Promise<ApiOutcome<SceneRef[]>> {
  const outcome = await post(
    "/api/escenas",
    { costumeSlug, count, exclude },
    signal,
  );
  if (!outcome.ok) return outcome;
  const raw = isRecord(outcome.value) ? outcome.value.scenes : undefined;
  const scenes = Array.isArray(raw)
    ? raw.map(toSceneRef).filter((scene) => scene !== undefined)
    : [];
  if (scenes.length === 0) {
    return { ok: false, status: 500, message: "No llegaron escenas" };
  }
  return { ok: true, value: scenes };
}

export async function requestImage(input: {
  photo: string;
  costumeSlug: string;
  scene: SceneRef;
  signal: AbortSignal;
}): Promise<ApiOutcome<string>> {
  const outcome = await post(
    "/api/disfrazar",
    {
      photo: input.photo,
      costumeSlug: input.costumeSlug,
      sceneId: input.scene.id,
      styleId: input.scene.styleId,
    },
    input.signal,
  );
  if (!outcome.ok) return outcome;
  const image = isRecord(outcome.value) ? outcome.value.image : undefined;
  if (typeof image !== "string") {
    return { ok: false, status: 500, message: "No llegó la imagen" };
  }
  return { ok: true, value: image };
}
