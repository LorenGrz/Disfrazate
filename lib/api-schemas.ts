import { z } from "zod";
import { getCostume } from "./catalog";
import { getScene, getStyle } from "./scenes";

export const MAX_PHOTO_BYTES = 1.5 * 1024 * 1024;
/** Largo máximo del base64 que decodifica a MAX_PHOTO_BYTES. */
const MAX_PHOTO_B64_LENGTH = Math.ceil((MAX_PHOTO_BYTES * 4) / 3) + 4;

const costumeSlug = z
  .string()
  .refine((slug) => getCostume(slug) !== undefined, "disfraz inexistente");

export const escenasBody = z.object({
  costumeSlug,
  /** 4 al empezar; 1 para "otra escena". */
  count: z.int().min(1).max(4).default(4),
  /** Escenas que ya están en pantalla: "otra escena" no las repite. */
  exclude: z.array(z.string().max(64)).max(8).default([]),
});

function decodedBytes(b64: string): number {
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return (b64.length * 3) / 4 - padding;
}

export const disfrazarBody = z.object({
  /** JPEG en base64, sin el prefijo data:. */
  photo: z
    .string()
    .max(MAX_PHOTO_B64_LENGTH, "foto demasiado grande")
    .regex(/^[A-Za-z0-9+/]+={0,2}$/, "no es base64")
    .refine((b64) => b64.length % 4 === 0, "no es base64")
    .refine((b64) => b64.startsWith("/9j/"), "no es un JPEG")
    .refine(
      (b64) => decodedBytes(b64) <= MAX_PHOTO_BYTES,
      "foto demasiado grande",
    ),
  costumeSlug,
  sceneId: z
    .string()
    .refine((id) => getScene(id) !== undefined, "escena inexistente"),
  styleId: z
    .string()
    .refine((id) => getStyle(id) !== undefined, "estilo inexistente"),
});

export type DisfrazarBody = z.infer<typeof disfrazarBody>;

export type ApiErrorKind =
  | "unauthorized"
  | "invalid"
  | "limit"
  | "offline"
  | "timeout"
  | "rejected"
  | "internal";

export type ApiError = { error: { kind: ApiErrorKind; message: string } };
