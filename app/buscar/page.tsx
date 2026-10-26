import type { Metadata } from "next";
import { Suspense } from "react";
import { costumes, findCostumes } from "@/lib/catalog";
import { Results } from "@/app/_components/Results";

export const metadata: Metadata = {
  title: "Buscar",
  description:
    "Buscá tu disfraz de Halloween en nuestro archivo de scrapeo falso.",
};

async function SearchResults({
  searchParams,
}: Pick<PageProps<"/buscar">, "searchParams">) {
  const { q } = await searchParams;
  const query = (typeof q === "string" ? q : "").trim();

  if (query === "") {
    return <p>Escribí qué disfraz querés y apretá Scrapear. No mordemos.</p>;
  }

  const results = findCostumes(query);
  return (
    <>
      <p aria-live="polite">
        {results.length > 0
          ? `Encontramos ${results.length} ${results.length === 1 ? "disfraz" : "disfraces"} para "${query}" en nuestro archivo de ${costumes.length}.`
          : `Nada para "${query}" en nuestro archivo de ${costumes.length}. En MercadoLibre capaz sí.`}
      </p>
      <Results query={query} results={results} />
    </>
  );
}

export default function SearchPage(props: PageProps<"/buscar">) {
  return (
    <main className="gutter flex flex-1 flex-col gap-8 py-12">
      <h1 className="display text-h2">Resultados del scrapeo</h1>
      <form
        action="/buscar"
        method="get"
        className="flex max-w-2xl flex-col gap-3 sm:flex-row"
      >
        <input
          type="search"
          name="q"
          required
          autoComplete="off"
          aria-label="¿De qué te querés disfrazar?"
          placeholder="vampiro, banana, pancho..."
          className="text-input flex-1"
        />
        <button type="submit" className="btn press">
          Scrapear
        </button>
      </form>
      <Suspense fallback={<p>Scrapeando tiendas...</p>}>
        <SearchResults searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
