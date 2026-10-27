import "server-only";
import { createHash } from "node:crypto";
import { getSupabase } from "./supabase.server";

const BUCKET = "participantes";
const TABLE = "generations";

export type ParticipantPaths = {
  photoHash: string;
  originalPath: string;
  imagePath: string;
};

/** Paths dentro del bucket: una carpeta por foto original (sha256 de los bytes). */
export function participantPaths(
  photoBytes: Uint8Array,
  sceneId: string,
  styleId: string,
  seed: number,
): ParticipantPaths {
  const photoHash = createHash("sha256").update(photoBytes).digest("hex");
  return {
    photoHash,
    originalPath: `${photoHash}/original.jpg`,
    imagePath: `${photoHash}/${sceneId}-${styleId}-${seed}.jpg`,
  };
}

export type SaveGenerationInput = {
  photoJpegB64: string;
  imageJpegB64: string;
  costumeSlug: string;
  sceneId: string;
  styleId: string;
  seed: number;
};

/**
 * Guarda la foto original y la imagen generada (consentido en /terminos).
 * No-op sin Supabase. Nunca lanza: se llama desde `after()`.
 */
export async function saveGeneration(
  input: SaveGenerationInput,
): Promise<void> {
  try {
    const supabase = getSupabase();
    if (supabase === null) return;
    const photo = Buffer.from(input.photoJpegB64, "base64");
    const image = Buffer.from(input.imageJpegB64, "base64");
    const { photoHash, originalPath, imagePath } = participantPaths(
      photo,
      input.sceneId,
      input.styleId,
      input.seed,
    );
    const options = { contentType: "image/jpeg", upsert: true };
    const storage = supabase.storage.from(BUCKET);
    const [original, generated] = await Promise.all([
      storage.upload(originalPath, photo, options),
      storage.upload(imagePath, image, options),
    ]);
    if (original.error || generated.error) {
      console.error("No se pudieron guardar las imágenes del participante");
      return;
    }
    const { error } = await supabase.from(TABLE).insert({
      photo_hash: photoHash,
      original_path: originalPath,
      image_path: imagePath,
      costume_slug: input.costumeSlug,
      scene_id: input.sceneId,
      style_id: input.styleId,
      seed: input.seed,
    });
    if (error) {
      console.error("No se pudo registrar la generación", error.code);
    }
  } catch (error) {
    console.error(
      "saveGeneration falló",
      error instanceof Error ? error.name : "",
    );
  }
}
