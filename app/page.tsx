import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { costumes } from "@/lib/catalog";
import { CostumeTile } from "./_components/CostumeTile";
import { FakeScraper } from "./_components/FakeScraper";
import { Ticker } from "./_components/Ticker";

/** Tiles al doble: uno cada 6-7, elegidos para que la grilla cierre prolija. */
const bigTiles: readonly number[] = [5, 11, 17, 21];

const said: readonly string[] = [
  "Scraping cuántico distribuido en 190 países",
  "Inteligencia artificial de última generación",
  "Precios en tiempo real de millones de tiendas",
  "Envíos a todo el planeta",
];

const did: readonly string[] = [
  "Un archivo con 24 disfraces",
  "Un filtro que se hace el distraído con las tildes",
  "Precios inventados con mucho cariño",
  "Un link a MercadoLibre. Ese sí es de verdad.",
];

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
        <p className="text-small gutter mt-2 opacity-80">
          Foto de archivo: nenes con máscaras en el carnaval infantil danés, c.
          1930.
        </p>
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
          Veinticuatro disfraces que scrapeamos con mucho esfuerzo. Entrá a uno
          y mirá cuánto cuesta en tiendas que juramos que existen.
        </p>
        <ul className="mt-12 grid grid-flow-dense grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-4">
          {costumes.map((costume, index) => (
            <CostumeTile
              key={costume.slug}
              costume={costume}
              large={bigTiles.includes(index)}
              index={index}
            />
          ))}
        </ul>
      </section>

      <section className="section-gap field-2 py-[var(--section-gap)]">
        <div className="gutter">
          <h2 className="reveal display text-h2">
            Lo que decimos y lo que hacemos
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div
              className="reveal py-6 md:pr-6"
              style={{ "--i": 1 } as CSSProperties}
            >
              <h3 className="font-medium">Lo que decimos</h3>
              <ul className="text-h3 display mt-4 space-y-5">
                {said.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div
              className="reveal surface p-6"
              style={{ "--i": 2 } as CSSProperties}
            >
              <h3 className="font-medium">Lo que hacemos</h3>
              <ul className="text-h3 display mt-4 space-y-5">
                {did.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
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
