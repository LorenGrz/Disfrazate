import { Suspense } from "react";
import { costumes, getCostume } from "@/lib/catalog";
import { hasEventAccess } from "@/lib/event-gate.server";
import { unlockEvent } from "./actions";
import { Probador } from "./_components/Probador";

async function Gate({
  searchParams,
}: Pick<PageProps<"/disfrazate">, "searchParams">) {
  const { disfraz, error } = await searchParams;
  const slug = typeof disfraz === "string" ? disfraz : undefined;
  const costume = slug ? getCostume(slug) : undefined;

  if (await hasEventAccess()) {
    return (
      <Probador
        initialSlug={costume?.slug}
        costumes={costumes.map(({ slug, name, field }) => ({
          slug,
          name,
          field,
        }))}
      />
    );
  }

  return (
    <form action={unlockEvent} className="flex max-w-xl flex-col gap-6">
      <h2 className="display text-h3">Código del evento</h2>
      <p>
        El probador es solo para quienes están en el evento. Pedile el código a
        alguien del equipo.
      </p>
      {costume ? (
        <input type="hidden" name="disfraz" value={costume.slug} />
      ) : null}
      <label htmlFor="code" className="font-medium">
        Código
      </label>
      <input
        id="code"
        name="code"
        type="password"
        required
        autoComplete="off"
        className="text-input"
        aria-describedby={error ? "code-error" : undefined}
      />
      {error ? (
        <p id="code-error" role="alert">
          Ese código no es. Probá de nuevo.
        </p>
      ) : null}
      <button type="submit" className="btn btn-accent press self-start">
        Entrar al probador
      </button>
    </form>
  );
}

export default function DisfrazatePage(props: PageProps<"/disfrazate">) {
  return (
    <main className="gutter surface flex flex-1 flex-col gap-10 py-20">
      <h1 className="display text-h2">El probador</h1>
      <Suspense fallback={<p role="status">Abriendo el probador...</p>}>
        <Gate searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
