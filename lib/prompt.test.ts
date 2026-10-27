import { describe, expect, it } from "vitest";
import { getCostume } from "./catalog";
import { buildPrompt, buildProductPrompt } from "./prompt";
import { getScene, getStyle } from "./scenes";

function sample() {
  const costume = getCostume("vampiro");
  const scene = getScene("fila-banco");
  const style = getStyle("fotografo-evento");
  if (!costume || !scene || !style) throw new Error("datos faltantes");
  return { costume, scene, style };
}

describe("buildPrompt", () => {
  it("should include the costume, the scene and the style when building the prompt", () => {
    const costume = getCostume("vampiro");
    const scene = getScene("fila-banco");
    const style = getStyle("fotografo-evento");
    if (!costume || !scene || !style) throw new Error("datos faltantes");
    const prompt = buildPrompt({ costume, scene, style });
    expect(prompt).toContain(costume.promptEn);
    expect(prompt).toContain(scene.prompt);
    expect(prompt).toContain(style.prompt);
    expect(prompt).toContain("same face");
  });

  it("should demand a photographic result when building the prompt", () => {
    expect(buildPrompt(sample())).toContain("not a cartoon");
  });

  it("should keep the facial expression and not suggest smiling when building the prompt", () => {
    const prompt = buildPrompt(sample());
    expect(prompt).toContain("same facial expression");
    expect(prompt).not.toContain("funny but wholesome");
  });
});

describe("buildProductPrompt", () => {
  it("should include the description and demand a photographic result when building the prompt", () => {
    const prompt = buildProductPrompt("giant hot dog costume");
    expect(prompt).toContain("giant hot dog costume");
    expect(prompt).toContain("photorealistic");
  });
});
