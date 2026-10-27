import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { costumes, getCostume, type Costume } from "@/lib/catalog";
import { CostumeGrid } from "./_components/CostumeGrid";
import { FakeScraper } from "./_components/FakeScraper";
import { Ticker } from "./_components/Ticker";

/** Los 12 destacados del drop: uno o dos por categoría. */
const featuredSlugs: readonly string[] = [
  "vampiro",
  "pancho",
  "gaucho",
  "cono-de-transito",
  "carpincho",
  "bruja",
  "choripan",
  "abuela-con-ruleros",
  "inodoro",
  "astronauta",
  "dinosaurio-inflable",
  "banana",
];

const featured: readonly Costume[] = featuredSlugs
  .map((slug) => getCostume(slug))
  .filter((costume) => costume !== undefined);

export default function Home() {
  return (
    <main>
      <section className="flex min-h-[calc(100svh-4.5rem)] flex-col">
        <h1 className="display text-mega gutter -mb-[0.02em] overflow-hidden whitespace-nowrap">
          Disfrazate
        </h1>
        <div className="gutter relative mt-4 min-h-80 flex-1 md:mt-6">
          <div className="absolute inset-y-0 right-[var(--gutter)] left-[var(--gutter)] overflow-hidden">
            <Image
              src="/archivo/fastelavn.jpg"
              alt="Foto de archivo de chicos con máscaras blancas en una calle, Dinamarca, c. 1930"
              fill
              preload
              sizes="100vw"
              className="zoom object-cover object-[50%_35%]"
            />
          </div>
          <div className="relative flex h-full flex-col justify-end">
            <div className="surface max-w-lg p-4 md:p-6">
              <p>
                Scrapeamos todas las tiendas del planeta buscando tu disfraz de
                Halloween. Más o menos.
              </p>
              <p className="mt-4">
                <Link href="/disfrazate" className="btn btn-accent press">
                  Disfrazame
                </Link>
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Ticker />
        </div>
      </section>

      <section id="buscador" className="section-gap gutter grid gap-10">
        <h2 id="buscador-titulo" className="reveal display text-h2">
          ¿De qué te querés disfrazar?
        </h2>
        <div className="reveal" style={{ "--i": 1 } as CSSProperties}>
          <FakeScraper />
        </div>
      </section>

      <section id="drop" className="section-gap gutter">
        <h2 className="reveal display text-h2">Drop Halloween 2026</h2>
        <p
          className="reveal mt-6 max-w-xl"
          style={{ "--i": 1 } as CSSProperties}
        >
          Doce destacados de los {costumes.length} disfraces que scrapeamos con
          mucho esfuerzo. Entrá a uno y mirá cuánto cuesta en tiendas que
          juramos que existen.
        </p>
        <div className="mt-12">
          <CostumeGrid costumes={featured} />
        </div>
        <p className="mt-10">
          <Link href="/disfraces" className="btn press">
            Ver los {costumes.length} disfraces
          </Link>
        </p>
      </section>

      <section className="field-3 flex min-h-svh items-center">
        <div className="gutter w-full py-[var(--section-gap)]">
          <h2 className="reveal display text-h2">No compres. Probátelo.</h2>
          <p
            className="reveal mt-8 max-w-xl"
            style={{ "--i": 1 } as CSSProperties}
          >
            Subís una foto de cuerpo entero y la IA te disfraza en situaciones
            absurdas: de vampiro en el supermercado, de banana en una reunión de
            directorio.
          </p>
          <p className="reveal mt-8" style={{ "--i": 2 } as CSSProperties}>
            <Link href="/disfrazate" className="btn btn-accent press">
              Disfrazate
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
