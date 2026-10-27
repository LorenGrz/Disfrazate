import Image from "next/image";
import type { Costume } from "@/lib/catalog";

type SpecimenProps = {
  costume: Costume;
  sizes: string;
  preload?: boolean;
  className?: string;
};

/** Campo de color plano con la foto de producto 4:5 a sangre. */
export function Specimen({
  costume,
  sizes,
  preload = false,
  className = "",
}: SpecimenProps) {
  return (
    <div
      className={`relative aspect-[4/5] overflow-hidden field-${costume.field} ${className}`}
    >
      <Image
        src={costume.photo.src}
        alt={costume.photo.alt}
        fill
        sizes={sizes}
        preload={preload}
        className="tile-media object-cover"
      />
    </div>
  );
}
