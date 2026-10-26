import { creditList } from "@/lib/credits";

export function SiteFooter() {
  return (
    <footer className="section-gap overflow-hidden pb-6">
      <p
        aria-hidden="true"
        className="display text-mega gutter -mb-[0.04em] whitespace-nowrap"
      >
        Disfrazate
      </p>
      <div className="gutter mt-10 grid gap-10 md:grid-cols-[1fr_2fr]">
        <div>
          <h2 className="display text-h3">Hecho para SIDEQUEST</h2>
          <p className="text-small mt-4">No scrapeamos nada. Todavía.</p>
        </div>
        <div>
          <h2 className="text-small font-medium">Fotos de archivo</h2>
          <ul className="text-small mt-2 space-y-1">
            {creditList.map((credit) => (
              <li key={credit.id}>
                <a
                  href={credit.sourceUrl}
                  className="link-plain"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {credit.caption}
                </a>
                {`, ${credit.author}, ${credit.license}.`}
              </li>
            ))}
          </ul>
          <p className="text-small mt-4">
            Imágenes de Wikimedia Commons. Ninguna es un producto a la venta.
          </p>
        </div>
      </div>
    </footer>
  );
}
