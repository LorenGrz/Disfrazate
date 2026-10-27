import type { Costume } from "./catalog";
import type { Scene, Style } from "./scenes";

type PromptInput = { costume: Costume; scene: Scene; style: Style };

/** La plantilla vive solo acá: se ajusta con los resultados de las pruebas. */
export function buildPrompt({ costume, scene, style }: PromptInput): string {
  return `Image editing. Keep the exact same person from the reference photo: same face, facial features, hairstyle, skin tone and body proportions; keep or omit glasses and accessories exactly as in the photo, never add new ones. Dress this person in a complete ${costume.promptEn} Halloween costume. Place them in this scene: ${scene.prompt}. ${style.prompt}. Full body visible, natural pose, funny but wholesome, high detail. Do not render any text, letters or numbers.`;
}
