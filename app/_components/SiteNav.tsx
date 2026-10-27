import Link from "next/link";

export function SiteNav() {
  return (
    <header className="gutter flex items-center justify-between gap-4 py-4">
      <Link href="/" className="display text-h3 press">
        Disfrazate
      </Link>
      <nav aria-label="Principal" className="flex items-center gap-6">
        <Link href="/disfraces" className="press hidden sm:inline">
          El drop
        </Link>
        <Link href="/#buscador" className="press hidden sm:inline">
          Buscador
        </Link>
        <Link href="/disfrazate" className="btn btn-accent press">
          Disfrazame
        </Link>
      </nav>
    </header>
  );
}
