import Link from "next/link";

export function SiteNav() {
  return (
    <header className="gutter flex items-center justify-between gap-4 py-4">
      <Link href="/" className="display text-h3 press py-2">
        Disfrazate
      </Link>
      <nav aria-label="Principal" className="flex items-center gap-4 sm:gap-6">
        <Link
          href="/disfraces"
          className="press hidden py-3 whitespace-nowrap min-[22.5rem]:inline"
        >
          El drop
        </Link>
        <Link href="/#buscador" className="press hidden py-3 sm:inline">
          Buscador
        </Link>
        <Link href="/disfrazate" className="btn btn-accent btn-compact press">
          Disfrazame
        </Link>
      </nav>
    </header>
  );
}
