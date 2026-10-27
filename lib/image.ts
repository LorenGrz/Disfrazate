export const MAX_SIDE = 1024;
export const JPEG_QUALITY = 0.85;

/** Escala (width, height) para que el lado mayor no pase de `maxSide`. Nunca agranda. */
export function fitWithin(
  width: number,
  height: number,
  maxSide: number = MAX_SIDE,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxSide) return { width, height };
  const scale = maxSide / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/** Dibuja en un canvas reducido y devuelve JPEG base64 sin el prefijo data:. */
export async function drawToJpegB64(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
): Promise<string> {
  const { width, height } = fitWithin(sourceWidth, sourceHeight);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas no disponible");
  context.drawImage(source, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
  });
  if (!blob) throw new Error("no se pudo codificar la foto");
  return bytesToBase64(new Uint8Array(await blob.arrayBuffer()));
}

/** Archivo de la cámara/galería → JPEG base64 (≤1024 px, orientación EXIF aplicada). */
export async function fileToJpegB64(file: Blob): Promise<string> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  try {
    return await drawToJpegB64(bitmap, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}
