"use client";

import Image from "next/image";
import Link from "next/link";
import { PhotoStage } from "./CameraCapture";

type PhotoStepProps = {
  costumeName: string;
  costumePhoto: string | null;
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
  costumePhoto,
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
  return (
    <section className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <PhotoStage
        photo={photo}
        onPhoto={onPhoto}
        onClear={onClearPhoto}
        onError={onPhotoError}
      />

      <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
        <div className="flex items-center gap-4">
          {costumePhoto ? (
            <div className="field-1 relative aspect-[4/5] w-20 shrink-0 overflow-hidden">
              <Image
                src={costumePhoto}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          ) : null}
          <h2 className="display text-h3">Disfraz de {costumeName}</h2>
        </div>

        {photoError ? <p role="alert">{photoError}</p> : null}

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={consent}
            disabled={photo === null}
            onChange={(event) => onConsent(event.currentTarget.checked)}
            className="mt-1 size-6 shrink-0 accent-[var(--accent)]"
          />
          <span>
            La foto es mía (o tengo permiso), soy mayor de 18 años (o un adulto
            me dio permiso) y acepto los{" "}
            <Link
              href="/terminos"
              target="_blank"
              className="underline underline-offset-4"
            >
              términos
            </Link>
            : la foto y las imágenes generadas se guardan en privado para el
            evento.
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
            Otro disfraz
          </button>
        </div>
        {photo === null ? (
          <p className="text-small opacity-80">
            Primero la foto: prendé la cámara o subí una.
          </p>
        ) : null}
      </aside>
    </section>
  );
}
