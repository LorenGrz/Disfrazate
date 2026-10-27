import { describe, expect, it, vi } from "vitest";
import { getCostume } from "./catalog";
import { scrapeCostume, type ScrapeDeps } from "./scrape-costume.server";
import { err, ok } from "./result";

function deps(overrides: Partial<ScrapeDeps> = {}): ScrapeDeps {
  const vampiro = getCostume("vampiro");
  if (!vampiro) throw new Error("datos faltantes");
  return {
    hasAccess: () => Promise.resolve(true),
    isEnabled: () => true,
    listCostumes: () => Promise.resolve([vampiro]),
    countCustom: () => Promise.resolve(0),
    maxCustom: 100,
    nameCostume: () =>
      Promise.resolve(
        ok({
          name: "Pancho gigante",
          promptEn: "giant hot dog costume",
          tagline: "Con todas las salsas.",
        }),
      ),
    tryConsumeGeneration: () => Promise.resolve(true),
    generate: () =>
      Promise.resolve(
        ok({ jpegB64: Buffer.from("jpeg").toString("base64"), seed: 1, ms: 5 }),
      ),
    uploadPhoto: (slug) => Promise.resolve(`${slug}.jpg`),
    insertCostume: () => Promise.resolve(),
    photoUrl: (path) => `https://x.supabase.co/storage/${path}`,
    ...overrides,
  };
}

describe("scrapeCostume", () => {
  it("should return 401 when there is no event access", async () => {
    const result = await scrapeCostume(
      deps({ hasAccess: () => Promise.resolve(false) }),
      { query: "pancho" },
    );
    expect(result.status).toBe(401);
  });

  it("should return 400 when the body is invalid", async () => {
    expect((await scrapeCostume(deps(), { query: "<x>" })).status).toBe(400);
    expect((await scrapeCostume(deps(), undefined)).status).toBe(400);
  });

  it("should return 503 when the scraper is not configured", async () => {
    const result = await scrapeCostume(deps({ isEnabled: () => false }), {
      query: "vampiro",
    });
    expect(result).toMatchObject({
      status: 503,
      body: { error: { message: "El scraper está apagado" } },
    });
  });

  it("should return 200 with the existing slug when the query matches a costume", async () => {
    const generate = vi.fn();
    const result = await scrapeCostume(deps({ generate }), {
      query: "VAMPIRO",
    });
    expect(result).toEqual({
      status: 200,
      body: { slug: "vampiro", created: false },
    });
    expect(generate).not.toHaveBeenCalled();
  });

  it("should return 422 when the namer rejects the query", async () => {
    const result = await scrapeCostume(
      deps({
        nameCostume: () =>
          Promise.resolve(err({ kind: "rejected", reason: "Persona real" })),
      }),
      { query: "un famoso" },
    );
    expect(result.status).toBe(422);
  });

  it("should return 503 when the namer is unavailable", async () => {
    const result = await scrapeCostume(
      deps({
        nameCostume: () => Promise.resolve(err({ kind: "unavailable" })),
      }),
      { query: "pancho" },
    );
    expect(result.status).toBe(503);
  });

  it("should return 429 when the custom costume cap is reached", async () => {
    const result = await scrapeCostume(
      deps({ countCustom: () => Promise.resolve(100) }),
      { query: "pancho" },
    );
    expect(result.status).toBe(429);
  });

  it("should return 201 and persist the costume when everything works", async () => {
    const insertCostume = vi.fn(() => Promise.resolve());
    const result = await scrapeCostume(deps({ insertCostume }), {
      query: "pancho",
    });
    expect(result).toEqual({
      status: 201,
      body: {
        slug: "s-pancho-gigante",
        name: "Pancho gigante",
        photo: "https://x.supabase.co/storage/s-pancho-gigante.jpg",
        created: true,
      },
    });
    expect(insertCostume).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "s-pancho-gigante",
        query: "pancho",
        promptEn: "giant hot dog costume",
      }),
      "s-pancho-gigante.jpg",
    );
  });

  it("should map a provider timeout to 504", async () => {
    const result = await scrapeCostume(
      deps({ generate: () => Promise.resolve(err({ kind: "timeout" })) }),
      { query: "pancho" },
    );
    expect(result.status).toBe(504);
  });
});
