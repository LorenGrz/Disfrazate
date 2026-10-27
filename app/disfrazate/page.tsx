import { Suspense } from "react";
import Link from "next/link";
import { getCostume } from "@/lib/catalog";

async function Stub({
  searchParams,
}: Pick<PageProps<"/disfrazate">, "searchParams">) {
  const { disfraz } = await searchParams;
  const slug = typeof disfraz === "string" ? disfraz : undefined;
  const costume = slug ? getCostume(slug) : undefined;

  return (
    <>
      <h1 className="display text-h2">El probador abre pronto</h1>
      <p className="max-w-xl">
        {costume
          ? `Vas a probarte el disfraz de ${costume.name}. Todavía estamos cosiendo el probador.`
          : "Acá vas a subir una foto de cuerpo entero y la IA te va a disfrazar. Todavía estamos cosiendo el probador."}
      </p>
      <Link href="/" className="btn press">
        Volver al drop
      </Link>
    </>
  );
}

export default function DisfrazatePage(props: PageProps<"/disfrazate">) {
  return (
    <main className="gutter field-3 flex flex-1 flex-col items-start justify-center gap-8 py-20">
      <Suspense
        fallback={<p className="display text-h2">Abriendo el probador...</p>}
      >
        <Stub searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
