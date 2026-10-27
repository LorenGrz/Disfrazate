"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { findCostumes, costumes } from "@/lib/catalog";
import { Results } from "./Results";

type Run = { id: number; query: string };

function logLines(query: string, found: number): string[] {
  return [
    "Despertando a 4.812.337 scrapers...",
    `Buscando "${query}" en Disfraces Don Ramón`,
    "Esquivando un cartel de vuelvo en 5 minutos",
    "Ignorando Temu por razones legales",
    "Sobornando al loro de Mercado Pirata",
    `Contando ${found} resultados sospechosos en Quilmes`,
    "Listo. Más o menos.",
  ];
}

export function FakeScraper() {
  const [run, setRun] = useState<Run | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("q");
    const query = typeof value === "string" ? value.trim() : "";
    if (query === "") return;
    setRun((previous) => ({ id: (previous?.id ?? 0) + 1, query }));
  }

  const results = run ? findCostumes(run.query) : [];
  const lines = run ? logLines(run.query, results.length) : [];

  return (
    <div>
      <form
        action="/buscar"
        method="get"
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="search"
          name="q"
          required
          autoComplete="off"
          placeholder="vampiro, banana, pancho..."
          aria-labelledby="buscador-titulo"
          className="text-input flex-1"
        />
        <button type="submit" className="btn press">
          Scrapear
        </button>
      </form>

      {run ? (
        <div key={run.id} className="mt-8">
          <ol aria-hidden="true" className="text-small">
            {lines.map((line, index) => (
              <li
                key={line}
                className="log-line"
                style={{ "--i": index } as CSSProperties}
              >
                {line}
              </li>
            ))}
          </ol>
          <div
            className="log-result mt-6"
            style={{ "--i": lines.length } as CSSProperties}
          >
            <Results query={run.query} results={results} />
          </div>
        </div>
      ) : null}

      <div aria-live="polite" className="mt-6">
        {run ? (
          <p
            key={run.id}
            className="log-result"
            style={{ "--i": lines.length } as CSSProperties}
          >
            {results.length > 0
              ? `Encontramos ${results.length} ${results.length === 1 ? "disfraz" : "disfraces"} para "${run.query}" en nuestro archivo de ${costumes.length}. Y en MercadoLibre, los de verdad.`
              : `Nada para "${run.query}" en nuestro archivo de ${costumes.length}. En MercadoLibre capaz sí.`}
          </p>
        ) : null}
      </div>
    </div>
  );
}
