import { describe, expect, it } from "vitest";
import { pickScenes } from "./pick-scenes";
import { scenes, styles } from "./scenes";

/** rng determinista (mulberry32). */
function seeded(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("scenes data", () => {
  it("should have 48 unique scenes in 8 categories and 6 styles when loaded", () => {
    expect(new Set(scenes.map((s) => s.id)).size).toBe(48);
    expect(new Set(scenes.map((s) => s.category)).size).toBe(8);
    expect(styles).toHaveLength(6);
  });
});

describe("pickScenes", () => {
  it("should pick 4 scenes from 4 different categories when called with defaults", () => {
    const picked = pickScenes({}, seeded(1));
    expect(picked).toHaveLength(4);
    expect(new Set(picked.map((p) => p.scene.category)).size).toBe(4);
  });

  it("should prefer the least used scene of each category when usage is uneven", () => {
    const usage = Object.fromEntries(scenes.map((s) => [s.id, 5]));
    const target = scenes.find((s) => s.category === "tramites");
    if (!target) throw new Error("falta la categoría");
    usage[target.id] = 0;
    for (let seed = 0; seed < 20; seed++) {
      const picked = pickScenes(usage, seeded(seed), 8);
      const tramites = picked.find((p) => p.scene.category === "tramites");
      expect(tramites?.scene.id).toBe(target.id);
    }
  });

  it("should be deterministic when the rng is fixed", () => {
    const a = pickScenes({}, seeded(42));
    const b = pickScenes({}, seeded(42));
    expect(a.map((p) => [p.scene.id, p.style.id])).toEqual(
      b.map((p) => [p.scene.id, p.style.id]),
    );
  });

  it("should not return excluded scenes when asked for another one", () => {
    const exclude = scenes.slice(0, 6).map((s) => s.id);
    for (let seed = 0; seed < 20; seed++) {
      const [one] = pickScenes({}, seeded(seed), 1, exclude);
      expect(one).toBeDefined();
      expect(exclude).not.toContain(one?.scene.id);
    }
  });
});
