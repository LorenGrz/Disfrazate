"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type CSSProperties, type FormEvent } from "react";
import { z } from "zod";

type ScrapeCostumeProps = {
  query: string;
  /** Si ya hay resultados en el archivo, el botón es secundario. */
  hasResults: boolean;
};

type Phase =
  | { kind: "idle" }
  | { kind: "needsCode"; wrongCode: boolean }
  | { kind: "working" }
  | { kind: "done"; slug: string; name: string; photo: string | undefined }
  | { kind: "error"; message: string; canRetry: boolean };

const WORKING_LINES = [
  "Despertando al scraper de guardia...",
  "Infiltrando el depósito de Cotillón Once...",
  "Esquivando a un perro guardián de peluche...",
  "Negociando con un mayorista de Avellaneda...",
  "Regateando el precio de un maniquí...",
  "Llamando a un tío que sabe de disfraces...",
  "Fotografiando el disfraz con una papa...",
  "Planchando el fondo gris del estudio...",
  "Pidiéndole al modelo que no sonría...",
  "Revelando el negativo en un tacho de fernet...",
  "Inventando precios con mucha confianza...",
  "Contando tiendas que quizás existen...",
  "Subiendo la publicación a 3 marketplaces que no existen...",
  "Esperando que alguien apruebe la publicación...",
  "Casi. Más o menos.",
];

const created = z.object({
  slug: z.string().min(1),
  name: z.string().optional(),
  photo: z.string().optional(),
  created: z.boolean(),
});
const apiError = z.object({ error: z.object({ message: z.string() }) });

const NETWORK_ERROR =
  "No pudimos conectar. Revisá tu internet y probá de nuevo";

export function ScrapeCostume({ query, hasResults }: ScrapeCostumeProps) {
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const controller = useRef<AbortController | null>(null);

  async function scrape() {
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    setPhase({ kind: "working" });
    try {
      const response = await fetch("/api/scrapear", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query }),
        signal: abort.signal,
      });
      const body: unknown = await response.json().catch(() => undefined);
      if (response.status === 401) {
        setPhase({ kind: "needsCode", wrongCode: false });
        return;
      }
      const ok = created.safeParse(body);
      if (response.ok && ok.success) {
        setPhase({
          kind: "done",
          slug: ok.data.slug,
          name: ok.data.name ?? query,
          photo: ok.data.photo,
        });
        return;
      }
      const failure = apiError.safeParse(body);
      setPhase({
        kind: "error",
        message: failure.success
          ? failure.data.error.message
          : "Algo salió mal. Probá de nuevo",
        canRetry: response.status === 503 || response.status === 504,
      });
    } catch {
      if (abort.signal.aborted) return;
      setPhase({ kind: "error", message: NETWORK_ERROR, canRetry: true });
    }
  }

  async function unlock(code: string) {
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    try {
      const response = await fetch("/api/evento", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
        signal: abort.signal,
      });
      if (response.ok) {
        await scrape();
        return;
      }
      setPhase({ kind: "needsCode", wrongCode: response.status === 401 });
    } catch {
      if (abort.signal.aborted) return;
      setPhase({ kind: "error", message: NETWORK_ERROR, canRetry: false });
    }
  }

  function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("code");
    const code = typeof value === "string" ? value : "";
    if (code.trim() !== "") void unlock(code);
  }

  if (phase.kind === "working") {
    return (
      <div className="mt-8">
        <p role="status">Scrapeando «{query}», esto tarda unos segundos...</p>
        <ol aria-hidden="true" className="text-small mt-3">
          {WORKING_LINES.map((line, index) => (
            <li
              key={line}
              className="log-line"
              style={{ "--i": index } as CSSProperties}
            >
              {line}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (phase.kind === "done") {
    return (
      <div className="mt-8 flex max-w-xs flex-col gap-4" aria-live="polite">
        {phase.photo ? (
          <div className="relative aspect-[4/5] overflow-hidden field-1">
            <Image
              src={phase.photo}
              alt={`${phase.name}: foto ilustrativa`}
              fill
              sizes="320px"
              className="object-cover"
            />
          </div>
        ) : null}
        <p className="font-medium">{phase.name}</p>
        <div className="flex flex-col gap-3">
          <Link href={`/disfraz/${phase.slug}`} className="btn press">
            Ver publicación
          </Link>
          <Link
            href={`/disfrazate?disfraz=${phase.slug}`}
            className="btn btn-accent press"
          >
            DISFRAZATE con esto
          </Link>
        </div>
      </div>
    );
  }

  if (phase.kind === "needsCode") {
    return (
      <form onSubmit={submitCode} className="mt-8 flex max-w-xl flex-col gap-3">
        <p>Scrapear cuesta GPU de verdad. Necesitamos el código del evento.</p>
        <label htmlFor="scrape-code" className="font-medium">
          Código del evento
        </label>
        <input
          id="scrape-code"
          name="code"
          type="password"
          required
          autoComplete="off"
          className="text-input"
          aria-describedby={phase.wrongCode ? "scrape-code-error" : undefined}
        />
        {phase.wrongCode ? (
          <p id="scrape-code-error" role="alert">
            Ese código no es. Probá de nuevo.
          </p>
        ) : null}
        <button type="submit" className="btn press self-start">
          Entrar y scrapear
        </button>
      </form>
    );
  }

  return (
    <div className="mt-8 flex flex-col items-start gap-3">
      {phase.kind === "error" ? (
        <p role="alert">{phase.message}</p>
      ) : hasResults ? (
        <p>¿No es lo que buscabas?</p>
      ) : (
        <p className="display text-h3">No lo tenemos. Todavía.</p>
      )}
      <button
        type="button"
        onClick={() => void scrape()}
        className={
          phase.kind === "error"
            ? "btn btn-small press"
            : hasResults
              ? "btn btn-small press"
              : "btn btn-accent press"
        }
      >
        {phase.kind === "error" && phase.canRetry
          ? "Reintentar"
          : `Scrapear «${query}»`}
      </button>
    </div>
  );
}
