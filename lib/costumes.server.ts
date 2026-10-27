import "server-only";
import { getCostume, costumes, type Costume } from "./catalog";
import { getCustomCostume, listCustomCostumes } from "./custom-costumes.server";
import { isCustomSlug } from "./custom-costume";

/** Primero el catálogo estático, después los scrapeados. */
export async function getAnyCostume(
  slug: string,
): Promise<Costume | undefined> {
  const fixed = getCostume(slug);
  if (fixed) return fixed;
  return isCustomSlug(slug) ? getCustomCostume(slug) : undefined;
}

/** Estáticos más scrapeados (los más nuevos al final de los estáticos). */
export async function listAllCostumes(): Promise<Costume[]> {
  return [...costumes, ...(await listCustomCostumes())];
}
