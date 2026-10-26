import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  costumeCaption,
  costumes,
  getCostume,
  mercadoLibreUrl,
  storesFor,
} from "@/lib/catalog";
import { formatARS, formatCount } from "@/lib/format";
import Link from "next/link";
import { Specimen } from "@/app/_components/Specimen";

export function generateStaticParams() {
  return costumes.map((costume) => ({ slug: costume.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/disfraz/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const costume = getCostume(slug);
  if (!costume) return { title: "Disfraz no encontrado" };
  return {
    title: costume.name,
    description: `${costume.tagline} Desde ${formatARS(costume.priceFrom)} en ${formatCount(costume.storesScraped)} tiendas scrapeadas (más o menos).`,
  };
}

export default async function CostumePage({
  params,
}: PageProps<"/disfraz/[slug]">) {
  const { slug } = await params;
  const costume = getCostume(slug);
  if (!costume) notFound();

  const stores = storesFor(costume);
  const caption = costumeCaption(costume);

  return (
    <main className="gutter pb-10">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <Specimen
            costume={costume}
            large
            preload
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="aspect-square"
          />
          {caption ? (
            <p className="text-small mt-3 opacity-80">
              Foto de archivo: {caption}. No es un producto a la venta.
            </p>
          ) : null}
        </div>
        <div className="flex flex-col items-start gap-6">
          <h1 className="display text-h2">{costume.name}</h1>
          <p className="max-w-xl text-h3 font-medium leading-tight">
            {costume.tagline}
          </p>
          <p>
            Desde {formatARS(costume.priceFrom)} hasta{" "}
            {formatARS(costume.priceTo)}, según a quién le creas. Scrapeamos{" "}
            {formatCount(costume.storesScraped)} tiendas para llegar acá.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={mercadoLibreUrl(costume.mlQuery)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn press"
            >
              Ver publicación
            </a>
            <Link
              href={`/disfrazate?disfraz=${costume.slug}`}
              className="btn btn-accent press"
            >
              Disfrazate
            </Link>
          </div>
        </div>
      </div>

      <section className="section-gap">
        <h2 className="display text-h2">Dónde lo scrapeamos</h2>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left">
            <caption className="sr-only">
              Tiendas inventadas que venden {costume.name}
            </caption>
            <thead>
              <tr className="border-b border-current">
                <th scope="col" className="py-3 pr-4 font-medium">
                  Tienda
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  Precio
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  Envío
                </th>
                <th scope="col" className="py-3 font-medium">
                  Detalle
                </th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.name} className="border-b border-current/30">
                  <th scope="row" className="py-4 pr-4 font-medium">
                    {store.name}
                  </th>
                  <td className="py-4 pr-4">{formatARS(store.price)}</td>
                  <td className="py-4 pr-4">{store.shipping}</td>
                  <td className="py-4">{store.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-small mt-4 opacity-80">
          Tiendas y precios inventados. El link a MercadoLibre es real.
        </p>
      </section>
    </main>
  );
}
