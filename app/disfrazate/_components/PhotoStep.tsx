"use client";

import Image from "next/image";
import type { ChangeEvent } from "react";
import { fileToJpegB64 } from "@/lib/image";
import { CameraCapture } from "./CameraCapture";

type PhotoStepProps = {
  costumeName: string;
  photo: string | null;
  consent: boolean;
  photoError: string | null;
  onPhoto: (jpegB64: string) => void;
  onPhotoError: (message: string) => void;
  onClearPhoto: () => void;
  onConsent: (value: boolean) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export function PhotoStep({
  costumeName,
  photo,
  consent,
  photoError,
  onPhoto,
  onPhotoError,
  onClearPhoto,
  onConsent,
  onSubmit,
  onBack,
}: PhotoStepProps) {
  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    try {
      onPhoto(await fileToJpegB64(file));
    } catch {
      onPhotoError("No pudimos leer esa foto. Probá con otra");
    } finally {
      input.value = "";
    }
  }

  return (
    <section className="flex flex-col gap-8">
      <h2 className="display text-h3">
        Tu foto para el disfraz de {costumeName}
      </h2>
      <p className="max-w-xl">Cuerpo entero, de frente, con buena luz.</p>

      {photo === null ? (
        <div className="flex flex-col items-start gap-6">
          <label className="btn btn-accent press">
            Sacate una foto
            <input
              type="file"
              accept="image/*"
              capture="user"
              onChange={(event) => void handleFile(event)}
              className="sr-only"
            />
          </label>
          <CameraCapture onCapture={onPhoto} onError={onPhotoError} />
        </div>
      ) : (
        <div className="flex flex-col items-start gap-6">
          <div className="relative aspect-[4/5] w-full max-w-md well">
            <Image
              src={`data:image/jpeg;base64,${photo}`}
              alt="Tu foto, lista para disfrazar"
              fill
              unoptimized
              className="object-contain"
            />
          </div>
          <button type="button" onClick={onClearPhoto} className="btn press">
            Cambiar la foto
          </button>
        </div>
      )}

      {photoError ? <p role="alert">{photoError}</p> : null}

      <label className="flex max-w-xl items-start gap-3">
        <input
          type="checkbox"
          checked={consent}
          disabled={photo === null}
          onChange={(event) => onConsent(event.currentTarget.checked)}
          className="mt-1 size-6 shrink-0 accent-[var(--accent)]"
        />
        <span>
          Esta foto es mía (o tengo permiso), soy mayor de 13 años y entiendo
          que no se guarda.
        </span>
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={photo === null || !consent}
          className="btn btn-accent press disabled:opacity-40"
        >
          Disfrazame
        </button>
        <button type="button" onClick={onBack} className="btn press">
          Elegir otro disfraz
        </button>
      </div>
    </section>
  );
}
