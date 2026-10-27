import { describe, expect, it } from "vitest";
import { nameCostume, parseNamerOutput } from "./costume-namer.server";

const valid = {
  allowed: true,
  reason: "ok",
  name: "Pancho gigante",
  promptEn: "giant hot dog costume with a yellow mustard stripe",
  tagline: "Con todas las salsas.",
};

describe("parseNamerOutput", () => {
  it("should return the named costume when the JSON is valid", () => {
    const result = parseNamerOutput(JSON.stringify(valid));
    expect(result).toEqual({
      ok: true,
      value: {
        name: valid.name,
        promptEn: valid.promptEn,
        tagline: valid.tagline,
      },
    });
  });

  it("should extract the JSON when it is wrapped in text", () => {
    const result = parseNamerOutput(
      `Claro, acá va:\n\`\`\`json\n${JSON.stringify(valid)}\n\`\`\` Listo {fin}`,
    );
    expect(result.ok).toBe(true);
  });

  it("should return rejected with the reason when allowed is false", () => {
    const result = parseNamerOutput(
      JSON.stringify({ allowed: false, reason: "Es una persona real" }),
    );
    expect(result).toEqual({
      ok: false,
      error: { kind: "rejected", reason: "Es una persona real" },
    });
  });

  it("should return invalid when a field is too long", () => {
    const result = parseNamerOutput(
      JSON.stringify({ ...valid, tagline: "x".repeat(71) }),
    );
    expect(result).toEqual({ ok: false, error: { kind: "invalid" } });
  });

  it("should return invalid when there is no JSON or it is broken", () => {
    expect(parseNamerOutput("no puedo ayudar")).toEqual({
      ok: false,
      error: { kind: "invalid" },
    });
    expect(parseNamerOutput("{allowed: true")).toEqual({
      ok: false,
      error: { kind: "invalid" },
    });
  });
});

describe("nameCostume", () => {
  it("should return invalid without calling anything when the query fails the pre-filter", async () => {
    expect(await nameCostume("<x>")).toEqual({
      ok: false,
      error: { kind: "invalid" },
    });
  });

  it("should use the query as the prompt when running in demo mode", async () => {
    const result = await nameCostume("  pancho ");
    expect(result).toMatchObject({
      ok: true,
      value: { name: "Pancho", promptEn: "pancho" },
    });
  });
});
