import "server-only";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { z } from "zod";
import type { Costume } from "./catalog";
import { fieldForSlug } from "./custom-costume";
import { getEnv } from "./env.server";
import { getSupabase } from "./supabase.server";

const TABLE = "custom_costumes";
const BUCKET = "catalogo";
const CACHE_TAG = "custom-costumes";

const row = z.object({
  slug: z.string().regex(/^s-[a-z0-9-]{2,50}$/),
  name: z.string().min(2).max(40),
  query: z.string().min(1),
  prompt_en: z.string().min(3).max(300),
  tagline: z.string(),
  price_from: z.int().positive(),
  price_to: z.int().positive(),
  stores_scraped: z.int().min(12).max(340),
  photo_path: z.string().regex(/^[a-z0-9-]+\.jpg$/),
});

type CustomRow = z.infer<typeof row>;

export type NewCustomCostume = {
  slug: string;
  name: string;
  query: string;
  promptEn: string;
  tagline: string;
  priceFrom: number;
  priceTo: number;
  storesScraped: number;
};

export function customPhotoUrl(photoPath: string): string {
  const base = getEnv().NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${BUCKET}/${photoPath}`;
}

function toCostume(data: CustomRow): Costume {
  return {
    slug: data.slug,
    name: data.name,
    tagline: data.tagline,
    priceFrom: data.price_from,
    priceTo: data.price_to,
    storesScraped: data.stores_scraped,
    category: "scrapeados",
    mlQuery: data.query,
    promptEn: data.prompt_en,
    field: fieldForSlug(data.slug),
    photo: {
      src: customPhotoUrl(data.photo_path),
      alt: `${data.name}: foto ilustrativa`,
    },
  };
}

/** Los más nuevos primero. Vacío si el scraper está apagado. */
export async function listCustomCostumes(): Promise<Costume[]> {
  "use cache";
  cacheTag(CACHE_TAG);
  cacheLife("minutes");

  const supabase = getSupabase();
  if (supabase === null) return [];
  const { data, error } = await supabase
    .from(TABLE)
    .select(
      "slug,name,query,prompt_en,tagline,price_from,price_to,stores_scraped,photo_path",
    )
    .order("created_at", { ascending: false });
  if (error)
    throw new Error(`No se pudieron leer los disfraces: ${error.code}`);
  return z.array(row).parse(data).map(toCostume);
}

export async function getCustomCostume(
  slug: string,
): Promise<Costume | undefined> {
  const all = await listCustomCostumes();
  return all.find((costume) => costume.slug === slug);
}

/** Sin cache: el tope se tiene que chequear contra el valor real. */
export async function countCustomCostumes(): Promise<number> {
  const supabase = getSupabase();
  if (supabase === null) return 0;
  const { count, error } = await supabase
    .from(TABLE)
    .select("slug", { count: "exact", head: true });
  if (error) throw new Error(`No se pudo contar los disfraces: ${error.code}`);
  return count ?? 0;
}

/** Devuelve el path dentro del bucket. */
export async function uploadCustomPhoto(
  slug: string,
  jpegBytes: Uint8Array,
): Promise<string> {
  const supabase = getSupabase();
  if (supabase === null) throw new Error("Supabase no está configurado");
  const photoPath = `${slug}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(photoPath, jpegBytes, {
      contentType: "image/jpeg",
      upsert: false,
    });
  if (error) throw new Error(`No se pudo subir la foto: ${error.message}`);
  return photoPath;
}

export async function insertCustomCostume(
  costume: NewCustomCostume,
  photoPath: string,
): Promise<void> {
  const supabase = getSupabase();
  if (supabase === null) throw new Error("Supabase no está configurado");
  const { error } = await supabase.from(TABLE).insert({
    slug: costume.slug,
    name: costume.name,
    query: costume.query,
    prompt_en: costume.promptEn,
    tagline: costume.tagline,
    price_from: costume.priceFrom,
    price_to: costume.priceTo,
    stores_scraped: costume.storesScraped,
    photo_path: photoPath,
  });
  if (error) throw new Error(`No se pudo guardar el disfraz: ${error.code}`);
  // Route Handler: updateTag solo existe en Server Actions. { expire: 0 } no
  // sirve contenido viejo, así el que scrapeó ve su disfraz en la próxima carga.
  revalidateTag(CACHE_TAG, { expire: 0 });
}
