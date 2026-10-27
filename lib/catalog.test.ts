import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  costumeCategories,
  costumes,
  findCostumes,
  getCostume,
  isCostumeCategory,
  mercadoLibreUrl,
  storesFor,
} from "./catalog";

describe("catalog", () => {
  it("should have 60 unique slugs when the catalog is loaded", () => {
    const slugs = costumes.map((costume) => costume.slug);
    expect(slugs).toHaveLength(60);
    expect(new Set(slugs).size).toBe(60);
  });

  it("should keep storesScraped between 12 and 340 when the catalog is loaded", () => {
    for (const costume of costumes) {
      expect(costume.storesScraped).toBeGreaterThanOrEqual(12);
      expect(costume.storesScraped).toBeLessThanOrEqual(340);
    }
  });

  it("should derive the photo from the slug when the catalog is loaded", () => {
    for (const costume of costumes) {
      expect(costume.photo.src).toBe(`/catalogo/${costume.slug}.jpg`);
    }
  });

  it("should have a photo file for every costume when the catalog is loaded", () => {
    const missing = costumes.filter(
      (costume) =>
        !existsSync(path.join(process.cwd(), "public", costume.photo.src)),
    );
    expect(missing.map((costume) => costume.slug)).toEqual([]);
  });

  it("should use every category when the catalog is loaded", () => {
    for (const category of costumeCategories) {
      expect(costumes.some((costume) => costume.category === category)).toBe(
        true,
      );
    }
  });

  it("should accept only known categories when validating a value", () => {
    expect(isCostumeCategory("comida")).toBe(true);
    expect(isCostumeCategory("nada")).toBe(false);
    expect(isCostumeCategory(undefined)).toBe(false);
  });

  it("should keep every tagline within 70 characters when the catalog is loaded", () => {
    for (const costume of costumes) {
      expect(costume.tagline.length).toBeLessThanOrEqual(70);
    }
  });

  it("should slugify accents and spaces when building the MercadoLibre url", () => {
    expect(mercadoLibreUrl("Monstruo de Frankenstein")).toBe(
      "https://listado.mercadolibre.com.ar/disfraz-monstruo-de-frankenstein",
    );
    expect(mercadoLibreUrl("Muñeco poseído")).toBe(
      "https://listado.mercadolibre.com.ar/disfraz-muneco-poseido",
    );
  });

  it("should match ignoring case when searching MOMIA", () => {
    expect(findCostumes("MOMIA").map((costume) => costume.slug)).toContain(
      "momia",
    );
  });

  it("should match ignoring accents when searching murcielago", () => {
    expect(findCostumes("murcielago").map((costume) => costume.name)).toContain(
      "Murciélago",
    );
  });

  it("should return nothing when the search text is blank", () => {
    expect(findCostumes("   ")).toEqual([]);
  });

  it("should return undefined when the slug does not exist", () => {
    expect(getCostume("no-existe")).toBeUndefined();
  });

  it("should return 3 to 4 stable stores when asking twice for the same costume", () => {
    for (const costume of costumes) {
      const first = storesFor(costume);
      expect(first.length).toBeGreaterThanOrEqual(3);
      expect(first.length).toBeLessThanOrEqual(4);
      expect(storesFor(costume)).toEqual(first);
    }
  });
});
