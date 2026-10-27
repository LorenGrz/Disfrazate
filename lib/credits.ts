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
  {
    id: "la1935",
    title: "Children at a Halloween Party, Los Angeles, 1935",
    author: "Los Angeles Times",
    license: "CC BY 4.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Children_at_a_Halloween_Party,_Los_Angeles,_1935.jpg",
    caption: "Fiesta de Halloween, Los Ángeles, 1935",
  },
  {
    id: "queensland",
    title:
      "Girls from Milton College, Warwick, Queensland, in fancy dress, 1900",
    author: "W. H. Poulsen",
    license: "Dominio público",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:StateLibQld_1_167747_Girls_from_Milton_College,_Warwick,_Queensland,_in_fancy_dress,_1900.jpg",
    caption: "Colegio en disfraces caseros, Queensland, 1900",
  },
  {
    id: "marilwyd",
    title: "Mari Lwyd NLW",
    author: "Thomas Christopher Evans (Cadrawd)",
    license: "Dominio público",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Mari_Lwyd_NLW.jpg",
    caption: "Mari Lwyd, el caballo de calavera galés, c. 1900",
  },
  {
    id: "pierrot",
    title: "Pierrot postcard, c. 1900s",
    author: "Halloween HJB",
    license: "CC0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:-Pierrot_postcard-,_c._1900s._(50040187301).jpg",
    caption: "Postal de Pierrot, c. 1900",
  },
  {
    id: "surabaya",
    title:
      "KITLV 178718 - Studio portrait of children dressed as Pierrot, Surabaya",
    author: "Ohannes Kurkdjian",
    license: "Dominio público",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:KITLV_-_178718_-_Kurkdjian,_Ohannes_-_Soerabaya_-_Studio_portrait_of_children_dressed_as_Pierrot,_Surabaya_-_circa_1900.tiff",
    caption: "Retrato de estudio, chicos disfrazados de Pierrot, c. 1900",
  },
  {
    id: "clown",
    title: "Studioportret van een jonge vrouw in een clownskostuum",
    author: "Rijksmuseum",
    license: "CC0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Studioportret_van_een_jonge_vrouw_in_een_clownskostuum,_RP-F-2004-87-18.jpg",
    caption: "Retrato de estudio, mujer con traje de payaso, c. 1900",
  },
];

export const credits: Readonly<Record<string, Credit>> = Object.fromEntries(
  list.map((credit) => [credit.id, credit]),
);

export const creditList: readonly Credit[] = list;
