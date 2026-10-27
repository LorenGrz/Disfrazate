import { describe, expect, it } from "vitest";
import {
  customSlug,
  deriveStats,
  isCustomSlug,
  seedForSlug,
} from "./custom-costume";

describe("customSlug", () => {
  it("should prefix with s- and strip accents and spaces when building a slug", () => {
    expect(customSlug("Árbol de Navidad")).toBe("s-arbol-de-navidad");
  });

  it("should cut to 50 characters without a trailing dash when the name is long", () => {
    const slug = customSlug(`${"a".repeat(48)} bbbb cccc`);
    expect(slug.length).toBeLessThanOrEqual(50);
    expect(slug.endsWith("-")).toBe(false);
    expect(isCustomSlug(slug)).toBe(true);
  });

  it("should produce an invalid slug when the name has no letters or digits", () => {
    expect(isCustomSlug(customSlug("!!"))).toBe(false);
  });
});

describe("deriveStats", () => {
  it("should stay inside the absurd ranges and be stable when deriving from a slug", () => {
    for (const slug of [
      "s-semaforo",
      "s-pancho",
      "s-a1",
      "s-un-disfraz-largo",
    ]) {
      const stats = deriveStats(slug);
      expect(stats).toEqual(deriveStats(slug));
      expect(stats.priceFrom).toBeGreaterThanOrEqual(5000);
      expect(stats.priceFrom).toBeLessThanOrEqual(40000);
      expect(stats.priceFrom % 100).toBe(0);
      expect(stats.priceTo % 100).toBe(0);
      expect(stats.priceTo).toBeGreaterThanOrEqual(stats.priceFrom * 2);
      expect(stats.priceTo).toBeLessThanOrEqual(stats.priceFrom * 6);
      expect(stats.storesScraped).toBeGreaterThanOrEqual(12);
      expect(stats.storesScraped).toBeLessThanOrEqual(340);
    }
  });

  it("should give a stable seed when called twice with the same slug", () => {
    expect(seedForSlug("s-pancho")).toBe(seedForSlug("s-pancho"));
  });
});
