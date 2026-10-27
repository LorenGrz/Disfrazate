import type { CSSProperties } from "react";

const LINES = [
  "Midiendo tu aura...",
  "Negociando con el vampiro...",
  "Planchando la capa de invisibilidad...",
  "Sobornando al loro de Mercado Pirata...",
  "Buscando un portero que nos deje pasar...",
  "Revelando el negativo en un tacho de fernet...",
  "Casi. Más o menos.",
];

/** Log falso de "scraper" mientras se arman las imágenes. Solo CSS. */
export function GeneratingLog() {
  return (
    <ol aria-hidden="true" className="text-small">
      {LINES.map((line, index) => (
        <li
          key={line}
          className="log-line"
          style={{ "--i": index } as CSSProperties}
        >
          {line}
        </li>
      ))}
    </ol>
  );
}
