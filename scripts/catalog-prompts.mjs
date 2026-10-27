// Imprime `slug<TAB>promptEn` por línea para el generador de fotos del catálogo.
// Node importa lib/catalog.ts directo (type stripping): ese módulo no debe
// tener imports con alias ni sintaxis TypeScript no borrable (enums).
import { costumes } from "../lib/catalog.ts";

for (const costume of costumes) {
  process.stdout.write(`${costume.slug}\t${costume.promptEn}\n`);
}
