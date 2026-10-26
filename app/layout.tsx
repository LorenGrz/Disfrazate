import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { SiteFooter } from "./_components/SiteFooter";
import { SiteNav } from "./_components/SiteNav";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  weight: "variable",
  display: "swap",
});

const description =
  "Scrapeamos todas las tiendas del planeta buscando tu disfraz de Halloween. Más o menos. Y después la IA te disfraza.";

export const metadata: Metadata = {
  title: {
    default: "Disfrazate",
    template: "%s | Disfrazate",
  },
  description,
  openGraph: {
    title: "Disfrazate",
    description,
    siteName: "Disfrazate",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={`${archivo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteNav />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
