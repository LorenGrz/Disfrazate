import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  categoryLabels,
  costumeCategories,
  costumes,
  isCostumeCategory,
} from "@/lib/catalog";
import { CostumeGrid } from "@/app/_components/CostumeGrid";

export const metadata: Metadata = {
  title: "Todos los disfraces",
  description: `Los ${costumes.length} disfraces de nuestro archivo de scrapeo falso, con filtro por categoría.`,
};

async function Catalog({
  searchParams,
}: Pick<PageProps<"/disfraces">, "searchParams">) {
  const { cat } = await searchParams;
  // Categoría inválida o repetida: se muestran todos.
  const active = isCostumeCategory(cat) ? cat : undefined;
  const visible = active
    ? costumes.filter((costume) => costume.category === active)
    : costumes;

  return (
    <>
      <nav aria-label="Categorías">
        <ul className="flex flex-wrap gap-3">
          <li>
            <Link
              href="/disfraces"
              aria-current={active === undefined ? "page" : undefined}
              className={`btn press ${active === undefined ? "btn-accent" : ""}`}
            >
              Todos ({costumes.length})
            </Link>
          </li>
          {costumeCategories.map((category) => (
            <li key={category}>
              <Link
                href={`/disfraces?cat=${category}`}
                aria-current={active === category ? "page" : undefined}
                className={`btn press ${active === category ? "btn-accent" : ""}`}
              >
                {categoryLabels[category]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p aria-live="polite" className="text-small">
        {visible.length} {visible.length === 1 ? "disfraz" : "disfraces"}
        {active ? ` en ${categoryLabels[active]}` : ""}.
      </p>
      <CostumeGrid costumes={visible} />
    </>
  );
}

export default function CostumesPage(props: PageProps<"/disfraces">) {
  return (
    <main className="gutter flex flex-1 flex-col gap-8 py-12">
      <h1 className="display text-h2">Todos los disfraces</h1>
      <Suspense fallback={<p role="status">Revolviendo el archivo...</p>}>
        <Catalog searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
