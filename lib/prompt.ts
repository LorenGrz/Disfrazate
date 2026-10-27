import type { Costume } from "./catalog";
import type { Scene, Style } from "./scenes";

type PromptInput = { costume: Costume; scene: Scene; style: Style };

/** La plantilla vive solo acá: se ajusta con los resultados de las pruebas. */
export function buildPrompt({ costume, scene, style }: PromptInput): string {
  return `Image editing. Photorealistic real-life photograph of a real person, not an illustration, not a cartoon, not a 3D render, not a painting. Keep the exact same person from the reference photo: same face, facial features, hairstyle, skin tone and body proportions; keep the exact same facial expression and mouth shape as in the reference photo (if they pout, keep the pout; if serious, keep serious), do not add or change smiles; keep or omit glasses and accessories exactly as in the photo, never add new ones. Dress this person in a complete ${costume.promptEn} Halloween costume. Place them in this scene: ${scene.prompt}. ${style.prompt}. Full body visible, natural pose, high detail. Do not render any text, letters or numbers.`;
}

/**
 * Prompt de las fotos de producto del catálogo.
 * Copia de la línea `prompt=` de infra/sagemaker/gen-catalog.sh: si cambia uno,
 * cambia el otro, para que los disfraces scrapeados se vean igual que los 60 del catálogo.
 */
export function buildProductPrompt(promptEn: string): string {
  return `E-commerce product listing photo, photorealistic real-life photograph, not an illustration, not a cartoon, not a 3D render. A real adult model wearing a complete ${promptEn} Halloween costume, full body from head to shoes, standing facing the camera, neutral relaxed expression, plain light grey seamless studio background, soft even lighting, sharp focus. Do not render any text, letters, logos or watermarks.`;
}
