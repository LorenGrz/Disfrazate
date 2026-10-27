"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { Card } from "./probador-state";

type ResultCardProps = {
  card: Card;
  index: number;
  costumeSlug: string;
  onRetry: () => void;
  onOtherScene: () => void;
};

export function ResultCard({
  card,
  index,
  costumeSlug,
  onRetry,
  onOtherScene,
}: ResultCardProps) {
  const { scene, status } = card;
  return (
    <li className="flex flex-col gap-3">
      <div className="relative aspect-[4/5] w-full well">
        {status.kind === "ready" ? (
          <Image
            src={status.image}
            alt={`Vos disfrazado en: ${scene.label}`}
            fill
            unoptimized
            className="object-cover"
          />
        ) : null}
        {status.kind === "pending" ? (
          <p
            className="display text-h3 absolute inset-0 flex items-center justify-center p-6 text-center"
            style={{ "--i": index } as CSSProperties}
          >
            Generando...
          </p>
        ) : null}
        {status.kind === "error" ? (
          <div className="absolute inset-0 flex flex-col items-start justify-center gap-4 p-6">
            <p role="alert">{status.message}</p>
            <button type="button" onClick={onRetry} className="btn press">
              Reintentar
            </button>
          </div>
        ) : null}
      </div>
      <p className="text-small">
        {scene.label} ({scene.styleLabel})
      </p>
      {status.kind === "ready" ? (
        <div className="flex flex-wrap gap-3">
          <a
            href={status.image}
            download={`disfrazate-${costumeSlug}-${scene.id}.jpg`}
            className="btn btn-accent press"
          >
            Descargar
          </a>
          <button type="button" onClick={onOtherScene} className="btn press">
            Otra escena
          </button>
        </div>
      ) : null}
    </li>
  );
}
