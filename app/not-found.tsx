import Link from "next/link";

export default function NotFound() {
  return (
    <main className="gutter flex flex-1 flex-col items-start justify-center gap-8 py-20">
      <h1 className="display text-h2">Este disfraz se lo llevó el fantasma</h1>
      <p className="max-w-xl">
        Buscamos en 1.284 tiendas y nada. Capaz era una sábana común.
      </p>
      <Link href="/" className="btn btn-accent press">
        Volver al drop
      </Link>
    </main>
  );
}
