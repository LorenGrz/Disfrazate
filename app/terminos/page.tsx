import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description:
    "Qué guardamos de tus fotos en Disfrazate, para qué, por cuánto tiempo y cómo pedir que las borremos.",
};

const sections: readonly { title: string; body: readonly string[] }[] = [
  {
    title: "Qué es Disfrazate",
    body: [
      "Disfrazate es una app de entretenimiento para el evento SIDEQUEST. Los disfraces, las tiendas y los precios son de mentira. Los links a MercadoLibre son reales.",
    ],
  },
  {
    title: "Qué guardamos",
    body: [
      "Guardamos la foto que sacás o subís y las imágenes que genera la IA a partir de ella. Van a un almacenamiento privado (Supabase). No son públicas.",
    ],
  },
  {
    title: "Para qué las usamos",
    body: [
      "Para mostrar los resultados en el evento y en la presentación de SIDEQUEST, y para mejorar la app. No las vendemos ni las usamos para entrenar modelos.",
    ],
  },
  {
    title: "Cuánto tiempo",
    body: ["Las borramos dentro de los 30 días posteriores al evento."],
  },
  {
    title: "Quién las procesa",
    body: [
      "Amazon Web Services genera las imágenes (en Estados Unidos), Supabase las almacena y Vercel aloja la app.",
    ],
  },
  {
    title: "Requisitos",
    body: [
      "Tenés que ser mayor de 18 años o tener permiso de un adulto responsable.",
      "Subí solo fotos tuyas o de personas que te dieron permiso. Nada ofensivo.",
    ],
  },
  {
    title: "Tus derechos",
    body: [
      "Podés pedir que borremos tus fotos en cualquier momento escribiendo a los organizadores de SIDEQUEST.",
    ],
  },
  {
    title: "Disfraces scrapeados",
    body: [
      "Si scrapeás un disfraz, el nombre que escribís se procesa con IA (Amazon Bedrock) y el disfraz queda público en el catálogo.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="gutter pb-10">
      <div className="flex max-w-2xl flex-col items-start gap-8">
        <h1 className="display text-h2">Términos y condiciones</h1>
        {sections.map((section) => (
          <section key={section.title} className="flex flex-col gap-3">
            <h2 className="text-h3 font-medium leading-tight">
              {section.title}
            </h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
        <p className="text-small">
          Última actualización: 27 de octubre de 2026
        </p>
      </div>
    </main>
  );
}
