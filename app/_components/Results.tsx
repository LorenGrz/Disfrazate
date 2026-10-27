import Link from "next/link";
import { mercadoLibreUrl, type Costume } from "@/lib/catalog";
import { formatARS } from "@/lib/format";

type ResultsProps = {
  query: string;
  results: readonly Costume[];
};

/** Disfraces que coinciden + el link real a MercadoLibre, siempre. */
export function Results({ query, results }: ResultsProps) {
  return (
    <div>
      {results.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {results.map((costume) => (
            <li key={costume.slug}>
              <Link
                href={`/disfraz/${costume.slug}`}
                className={`press field-${costume.field} block p-4`}
              >
                <span className="display text-h3 block">{costume.name}</span>
                <span className="text-small mt-2 block">
                  desde {formatARS(costume.priceFrom)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-6">
        <a
          href={mercadoLibreUrl(query)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn press"
        >
          Ver resultados en MercadoLibre
        </a>
      </p>
    </div>
  );
}
