import { describe, expect, it } from "vitest";
import {
  costumes,
  findCostumes,
  getCostume,
  mercadoLibreUrl,
  storesFor,
} from "./catalog";
import { credits } from "./credits";

describe("catalog", () => {
  it("should have 24 unique slugs when the catalog is loaded", () => {
    const slugs = costumes.map((costume) => costume.slug);
    expect(slugs).toHaveLength(24);
    expect(new Set(slugs).size).toBe(24);
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

  it("should reference an existing credit when a costume has an image", () => {
    const withImage = costumes.filter((costume) => costume.image);
    expect(withImage.length).toBeGreaterThanOrEqual(4);
    for (const costume of withImage) {
      expect(costume.image?.creditId).toBeDefined();
      expect(Object.keys(credits)).toContain(costume.image?.creditId);
    }
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
