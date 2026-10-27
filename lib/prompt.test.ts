import { describe, expect, it } from "vitest";
import { getCostume } from "./catalog";
import { buildPrompt } from "./prompt";
import { getScene, getStyle } from "./scenes";

describe("buildPrompt", () => {
  it("should include the costume, the scene and the style when building the prompt", () => {
    const costume = getCostume("vampiro");
    const scene = getScene("fila-banco");
    const style = getStyle("oleo");
    if (!costume || !scene || !style) throw new Error("datos faltantes");
    const prompt = buildPrompt({ costume, scene, style });
    expect(prompt).toContain(costume.promptEn);
    expect(prompt).toContain(scene.prompt);
    expect(prompt).toContain(style.prompt);
    expect(prompt).toContain("same face");
  });
});
