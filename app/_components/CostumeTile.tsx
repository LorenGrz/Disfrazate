import Link from "next/link";
import type { CSSProperties } from "react";
import { costumeCaption, type Costume } from "@/lib/catalog";
import { formatCount, formatARS } from "@/lib/format";
import { Specimen } from "./Specimen";

type CostumeTileProps = {
  costume: Costume;
  large: boolean;
  /** Posición en la grilla, para escalonar la entrada. */
  index: number;
};

export function CostumeTile({ costume, large, index }: CostumeTileProps) {
  const caption = costumeCaption(costume);
  return (
    <li
      className={`reveal ${large ? "col-span-2 row-span-2" : ""}`}
      style={{ "--i": index % 4 } as CSSProperties}
    >
      <Link
        href={`/disfraz/${costume.slug}`}
        className="tile-link flex h-full flex-col gap-3"
      >
        <Specimen
          costume={costume}
          large={large}
          sizes={
            large
              ? "(min-width: 1024px) 50vw, 100vw"
              : "(min-width: 1024px) 25vw, 50vw"
          }
          className={large ? "min-h-64 flex-1" : "aspect-square"}
        />
        <div>
          <h3 className="font-medium">{costume.name}</h3>
          <p className="text-small">desde {formatARS(costume.priceFrom)}</p>
          <p className="text-small">
            {formatCount(costume.storesScraped)} tiendas scrapeadas
          </p>
          {caption ? (
            <p className="text-small mt-1 opacity-80">
              Foto de archivo: {caption}
            </p>
          ) : null}
        </div>
      </Link>
    </li>
  );
}
