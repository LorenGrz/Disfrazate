import { hash, slugify, type CostumeField } from "./catalog";

export const CUSTOM_SLUG_PATTERN = /^s-[a-z0-9-]{2,50}$/;
const MAX_SLUG_LENGTH = 50;

/** `"s-" + slugify(name)`, cortado en 50 caracteres. */
export function customSlug(name: string): string {
  return `s-${slugify(name)}`.slice(0, MAX_SLUG_LENGTH).replace(/-+$/, "");
}

export function isCustomSlug(slug: string): boolean {
  return CUSTOM_SLUG_PATTERN.test(slug);
}

export function fieldForSlug(slug: string): CostumeField {
  const value = hash(slug) % 3;
  return value === 0 ? 1 : value === 1 ? 2 : 3;
}

function roundTo100(value: number): number {
  return Math.round(value / 100) * 100;
}

export type DerivedStats = {
  priceFrom: number;
  priceTo: number;
  storesScraped: number;
};

/** Precios absurdos y tiendas "scrapeadas", siempre iguales para el mismo slug. */
export function deriveStats(slug: string): DerivedStats {
  const h = hash(slug);
  const priceFrom = roundTo100(5000 + (h % 35001));
  const multiplier = 2 + ((h >>> 5) % 4001) / 1000;
  return {
    priceFrom,
    priceTo: roundTo100(priceFrom * multiplier),
    storesScraped: 12 + ((h >>> 3) % 329),
  };
}

/** Seed estable para la foto, derivado del slug. */
export function seedForSlug(slug: string): number {
  return hash(slug) % 100000;
}
