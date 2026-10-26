import Image from "next/image";
import type { Costume } from "@/lib/catalog";

type SpecimenProps = {
  costume: Costume;
  sizes: string;
  /** Tamaño grande: el nombre usa el display de las secciones. */
  large?: boolean;
  preload?: boolean;
  className?: string;
};

/** Tile de color plano: foto de archivo en duotono o el nombre en display. */
export function Specimen({
  costume,
  sizes,
  large = false,
  preload = false,
  className = "",
}: SpecimenProps) {
  return (
    <div
      className={`relative overflow-hidden field-${costume.field} ${className}`}
    >
      {costume.image ? (
        <Image
          src={costume.image.src}
          alt={costume.image.alt}
          fill
          sizes={sizes}
          preload={preload}
          className="tile-media object-contain p-4"
        />
      ) : (
        <span
          aria-hidden="true"
          className={`display absolute inset-0 flex items-end p-3 [overflow-wrap:anywhere] ${large ? "text-h2" : "text-h3"}`}
        >
          {costume.name}
        </span>
      )}
    </div>
  );
}
