export type Credit = {
  id: string;
  title: string;
  author: string;
  license: string;
  sourceUrl: string;
  /** Qué es la foto, en criollo. Nunca es un producto. */
  caption: string;
};

const list: readonly Credit[] = [
  {
    id: "fastelavn",
    title: "Børn rasleboesse 193x (Kgl. Bib. Billedsamling)",
    author: "Autor desconocido",
    license: "Dominio público",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Boern_rasleboesse_193x_kgl_bib_billedsamling.jpg",
    caption: "Nenes con máscaras en el carnaval infantil danés, c. 1930",
  },
];

export const credits: Readonly<Record<string, Credit>> = Object.fromEntries(
  list.map((credit) => [credit.id, credit]),
);

export const creditList: readonly Credit[] = list;
