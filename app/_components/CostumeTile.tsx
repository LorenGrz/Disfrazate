import Link from "next/link";
import type { CSSProperties } from "react";
import type { Costume } from "@/lib/catalog";
import { formatCount, formatARS } from "@/lib/format";
import { Specimen } from "./Specimen";

type CostumeTileProps = {
  costume: Costume;
  /** Posición en la grilla, para escalonar la entrada. */
  index: number;
};

const TILE_SIZES =
  "(min-width: 1280px) 17vw, (min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw";

export function CostumeTile({ costume, index }: CostumeTileProps) {
  return (
    <li className="reveal" style={{ "--i": index % 4 } as CSSProperties}>
      <Link
        href={`/disfraz/${costume.slug}`}
        className="tile-link flex h-full flex-col gap-3"
      >
        <Specimen costume={costume} sizes={TILE_SIZES} />
        <div>
          <h3 className="font-medium">{costume.name}</h3>
          <p className="text-small">desde {formatARS(costume.priceFrom)}</p>
          <p className="text-small">
            {formatCount(costume.storesScraped)} tiendas scrapeadas
          </p>
        </div>
      </Link>
    </li>
  );
}
