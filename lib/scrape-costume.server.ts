import "server-only";
import { fold, type Costume } from "./catalog";
import {
  customSlug,
  deriveStats,
  isCustomSlug,
  seedForSlug,
} from "./custom-costume";
import type { NewCustomCostume } from "./custom-costumes.server";
import type { NamedCostume, NamerError } from "./costume-namer.server";
import { scrapearBody, type ApiErrorKind } from "./api-schemas";
import type {
  GenerateInput,
  GenerateOutput,
  ProviderError,
} from "./image-provider.server";
import { buildProductPrompt } from "./prompt";
import { PRODUCT_REFERENCE_JPEG_B64 } from "./product-reference";
import type { Result } from "./result";

/** Límite del bucket `catalogo` (migración): 1 MB. */
export const MAX_PHOTO_UPLOAD_BYTES = 1_048_576;

/** Dependencias en el borde (Supabase, Bedrock, SageMaker, cookie): se inyectan para poder testear. */
export type ScrapeDeps = {
  hasAccess(): Promise<boolean>;
  isEnabled(): boolean;
  listCostumes(): Promise<readonly Costume[]>;
  countCustom(): Promise<number>;
  maxCustom: number;
  nameCostume(query: string): Promise<Result<NamedCostume, NamerError>>;
  tryConsumeGeneration(): Promise<boolean>;
  generate(
    input: GenerateInput,
  ): Promise<Result<GenerateOutput, ProviderError>>;
  uploadPhoto(slug: string, jpegBytes: Uint8Array): Promise<string>;
  insertCostume(costume: NewCustomCostume, photoPath: string): Promise<void>;
  photoUrl(photoPath: string): string;
};

type ErrorBody = { error: { kind: ApiErrorKind; message: string } };
export type ScrapeResponse =
  | { status: 200; body: { slug: string; created: false } }
  | {
      status: 201;
      body: { slug: string; name: string; photo: string; created: true };
    }
  | { status: 400 | 401 | 422 | 429 | 500 | 503 | 504; body: ErrorBody };

function fail(
  status: 400 | 401 | 422 | 429 | 500 | 503 | 504,
  kind: ApiErrorKind,
  message: string,
): ScrapeResponse {
  return { status, body: { error: { kind, message } } };
}

function sameText(a: string, b: string): boolean {
  return fold(a) === fold(b);
}

export async function scrapeCostume(
  deps: ScrapeDeps,
  rawBody: unknown,
): Promise<ScrapeResponse> {
  if (!(await deps.hasAccess())) {
    return fail(401, "unauthorized", "Falta el código del evento");
  }
  const parsed = scrapearBody.safeParse(rawBody);
  if (!parsed.success) {
    return fail(400, "invalid", "Escribí un disfraz de 2 a 40 letras");
  }
  if (!deps.isEnabled()) {
    return fail(503, "offline", "El scraper está apagado");
  }
  const { query } = parsed.data;

  try {
    const all = await deps.listCostumes();
    const same = all.find(
      (costume) =>
        sameText(costume.name, query) || sameText(costume.mlQuery, query),
    );
    if (same) return { status: 200, body: { slug: same.slug, created: false } };

    if ((await deps.countCustom()) >= deps.maxCustom) {
      return fail(429, "limit", "El depósito de disfraces está lleno");
    }

    const named = await deps.nameCostume(query);
    if (!named.ok) {
      switch (named.error.kind) {
        case "rejected":
          return fail(
            422,
            "rejected",
            `Ese disfraz no pasa el control de calidad del depósito. ${named.error.reason}`.trim(),
          );
        case "invalid":
        case "unavailable":
          return fail(503, "offline", "El scraper se mareó. Probá de nuevo");
      }
    }
    const { name, promptEn, tagline } = named.value;

    const slug = customSlug(name);
    if (!isCustomSlug(slug)) {
      return fail(422, "rejected", "No pudimos ponerle nombre a eso");
    }
    if (all.some((costume) => costume.slug === slug)) {
      return { status: 200, body: { slug, created: false } };
    }

    if (!(await deps.tryConsumeGeneration())) {
      return fail(429, "limit", "Se nos acabaron los disfraces por hoy");
    }
    const photo = await deps.generate({
      photoJpegB64: PRODUCT_REFERENCE_JPEG_B64,
      prompt: buildProductPrompt(promptEn),
      seed: seedForSlug(slug),
    });
    if (!photo.ok) {
      switch (photo.error.kind) {
        case "offline":
          return fail(503, "offline", "El fotógrafo está apagado");
        case "timeout":
          return fail(
            504,
            "timeout",
            "El fotógrafo tardó demasiado. Probá de nuevo",
          );
        case "rejected":
          return fail(
            422,
            "rejected",
            "No pudimos fotografiar ese disfraz. Probá con otro",
          );
      }
    }

    const bytes = Buffer.from(photo.value.jpegB64, "base64");
    if (bytes.byteLength > MAX_PHOTO_UPLOAD_BYTES) {
      return fail(500, "internal", "La foto salió demasiado pesada");
    }
    const photoPath = await deps.uploadPhoto(slug, bytes);
    await deps.insertCostume(
      { slug, name, query, promptEn, tagline, ...deriveStats(slug) },
      photoPath,
    );
    return {
      status: 201,
      body: { slug, name, photo: deps.photoUrl(photoPath), created: true },
    };
  } catch (error) {
    console.error("scrapear falló", error instanceof Error ? error.name : "");
    return fail(500, "internal", "Se rompió el scraper");
  }
}
