"use client";

type ErrorViewProps = {
  title: string;
  retry: () => void;
};

export function ErrorView({ title, retry }: ErrorViewProps) {
  return (
    <main className="gutter flex flex-1 flex-col items-start justify-center gap-8 py-20">
      <h1 className="display text-h2">{title}</h1>
      <p className="max-w-xl">
        Se rompió algo de nuestro lado. Probablemente un scraper se comió un
        disfraz.
      </p>
      <button type="button" onClick={retry} className="btn press">
        Probar de nuevo
      </button>
    </main>
  );
}
