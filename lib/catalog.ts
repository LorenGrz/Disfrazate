import { credits } from "./credits";

export type CostumeField = 1 | 2 | 3;

export type CostumeImage = {
  src: string;
  alt: string;
  creditId: string;
};

export type Costume = {
  slug: string;
  name: string;
  tagline: string;
  priceFrom: number;
  priceTo: number;
  storesScraped: number;
  mlQuery: string;
  /** Descripción visual corta en inglés, para el prompt del modelo. */
  promptEn: string;
  field: CostumeField;
  image?: CostumeImage;
};

export type Store = {
  name: string;
  price: number;
  shipping: string;
  note: string;
};

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Quita acentos y mayúsculas para comparar. */
function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function mercadoLibreUrl(query: string): string {
  return `https://listado.mercadolibre.com.ar/disfraz-${slugify(query)}`;
}

type Seed = {
  name: string;
  promptEn: string;
  tagline: string;
  priceFrom: number;
  priceTo: number;
  storesScraped: number;
  imageId?: string;
  alt?: string;
};

const seeds: readonly Seed[] = [
  {
    name: "Vampiro",
    promptEn:
      "classic vampire with a black high-collared cape, red satin lining, pale makeup and fangs",
    tagline: "Chupa sangre, no chupa tu aguinaldo. Casi.",
    priceFrom: 18900,
    priceTo: 249000,
    storesScraped: 1204331,
  },
  {
    name: "Bruja",
    promptEn:
      "witch with a pointed black hat, long dark dress and a broomstick",
    tagline: "Incluye escoba. La nafta del vuelo va aparte.",
    priceFrom: 12500,
    priceTo: 189000,
    storesScraped: 2087412,
    imageId: "queensland",
    alt: "Foto de archivo de un grupo de chicas en disfraces caseros en 1900",
  },
  {
    name: "Zombie",
    promptEn:
      "zombie with torn bloody clothes, grey-green skin makeup and sunken eyes",
    tagline: "Ya tenés la cara un lunes a las 7 de la mañana.",
    priceFrom: 9900,
    priceTo: 154000,
    storesScraped: 954120,
  },
  {
    name: "Momia",
    promptEn: "mummy wrapped head to toe in aged linen bandages",
    tagline: "Veinte rollos de venda y un cuarto de hora de dignidad.",
    priceFrom: 7400,
    priceTo: 98000,
    storesScraped: 733902,
  },
  {
    name: "Esqueleto",
    promptEn:
      "skeleton jumpsuit with white bones printed on black fabric and a skull face paint",
    tagline: "Todo hueso, cero panza. Ideal para después de las fiestas.",
    priceFrom: 11200,
    priceTo: 133500,
    storesScraped: 1389004,
  },
  {
    name: "Fantasma de sábana",
    promptEn: "classic ghost made of a white bedsheet with two round eye holes",
    tagline: "Una sábana con dos agujeros. El clásico no falla.",
    priceFrom: 1500,
    priceTo: 79900,
    storesScraped: 4400118,
    imageId: "la1935",
    alt: "Foto de archivo de chicos con disfraces en una fiesta de Halloween de 1935",
  },
  {
    name: "Hombre lobo",
    promptEn:
      "werewolf with a furry brown body suit, claws and a snarling wolf mask",
    tagline: "Se transforma con luna llena y con el segundo fernet.",
    priceFrom: 21000,
    priceTo: 310000,
    storesScraped: 811266,
  },
  {
    name: "Calabaza",
    promptEn:
      "giant orange pumpkin with a carved jack-o-lantern face and a green stem hat",
    tagline: "Naranja, redonda y sin ningún plan de vida.",
    priceFrom: 8800,
    priceTo: 120000,
    storesScraped: 2650777,
  },
  {
    name: "Diablo",
    promptEn:
      "red devil with horns, a pointed tail, a red cape and a pitchfork",
    tagline: "Cuernos, capa y una deuda con el cotillón.",
    priceFrom: 6500,
    priceTo: 99000,
    storesScraped: 1760489,
  },
  {
    name: "Payaso siniestro",
    promptEn:
      "creepy clown with a rainbow wig, white face paint, red nose and a ruffled collar",
    tagline: "Nadie pidió este globo, pero ahí está.",
    priceFrom: 14300,
    priceTo: 212000,
    storesScraped: 666666,
    imageId: "clown",
    alt: "Foto de archivo de una mujer con traje de payaso con pompones, de estudio, c. 1900",
  },
  {
    name: "Monstruo de Frankenstein",
    promptEn:
      "Frankenstein's monster with green skin, neck bolts, a flat head and a stitched dark suit",
    tagline: "Tornillos en el cuello y los zapatos de tu papá.",
    priceFrom: 17700,
    priceTo: 187500,
    storesScraped: 902511,
  },
  {
    name: "Gato negro",
    promptEn:
      "black cat with a furry black bodysuit, pointed ears, whiskers and a long tail",
    tagline: "Mala suerte para los demás. Para vos, orejas.",
    priceFrom: 4900,
    priceTo: 64000,
    storesScraped: 3120045,
  },
  {
    name: "Murciélago",
    promptEn: "bat with large black wings, pointed ears and a dark bodysuit",
    tagline: "Colgado de cabeza, como tus cuentas del mes.",
    priceFrom: 7800,
    priceTo: 110000,
    storesScraped: 1457320,
  },
  {
    name: "Pirata",
    promptEn:
      "pirate with a tricorn hat, eye patch, striped shirt, long coat and a plastic sword",
    tagline: "Parche, loro y un mapa del tesoro que es una factura.",
    priceFrom: 9300,
    priceTo: 145000,
    storesScraped: 2299871,
  },
  {
    name: "Astronauta",
    promptEn:
      "white astronaut spacesuit with a round helmet and a mission patch",
    tagline: "Para ir a la fiesta como quien va a la Luna: con cara de nada.",
    priceFrom: 32000,
    priceTo: 395000,
    storesScraped: 540872,
  },
  {
    name: "Dinosaurio inflable",
    promptEn:
      "inflatable green dinosaur suit with a big tail and a toothy head",
    tagline: "No entrás en el ascensor. Vale cada centímetro.",
    priceFrom: 15900,
    priceTo: 168000,
    storesScraped: 3987654,
  },
  {
    name: "La Parca",
    promptEn:
      "Grim Reaper in a black hooded robe with a skull mask and a scythe",
    tagline: "Llega puntual, a diferencia del colectivo.",
    priceFrom: 10400,
    priceTo: 141000,
    storesScraped: 777123,
    imageId: "marilwyd",
    alt: "Foto de archivo de un hombre con un caballo de calavera galés, la Mari Lwyd",
  },
  {
    name: "Catrina",
    promptEn:
      "elegant Catrina with a skull face paint, a wide flowered hat and a long lace dress",
    tagline: "Elegante hasta en el más allá, con sombrero y todo.",
    priceFrom: 13600,
    priceTo: 199000,
    storesScraped: 1033900,
    imageId: "pierrot",
    alt: "Postal de archivo de un Pierrot bailando sobre una luna dorada",
  },
  {
    name: "Muñeco poseído",
    promptEn:
      "creepy possessed porcelain doll with pale cracked makeup, rosy cheeks and a frilly dress",
    tagline: "Parpadea cuando no lo mirás. Ya lo sabés.",
    priceFrom: 16600,
    priceTo: 222000,
    storesScraped: 1999999,
    imageId: "surabaya",
    alt: "Foto de archivo de un grupo de chicos disfrazados de Pierrot en un estudio, c. 1900",
  },
  {
    name: "Alien",
    promptEn:
      "green alien with big black almond eyes, antennae and a shiny silver jumpsuit",
    tagline: "Venimos en paz, pero queremos tu WiFi.",
    priceFrom: 19400,
    priceTo: 260000,
    storesScraped: 487201,
  },
  {
    name: "Robot de cartón",
    promptEn:
      "homemade cardboard box robot with silver paint, dials and foil details",
    tagline: "Caja de heladera, cinta de embalar y mucho fe.",
    priceFrom: 3200,
    priceTo: 57000,
    storesScraped: 2870330,
  },
  {
    name: "Pancho",
    promptEn:
      "giant hot dog with a bun, a sausage and mustard and ketchup stripes",
    tagline: "Sí, el pancho. Con salchicha, pan y mucha dignidad.",
    priceFrom: 5600,
    priceTo: 88000,
    storesScraped: 1312120,
  },
  {
    name: "Banana",
    promptEn: "giant yellow banana suit covering the whole body",
    tagline: "Amarilla, curva y totalmente innecesaria.",
    priceFrom: 6100,
    priceTo: 92000,
    storesScraped: 2411903,
  },
  {
    name: "Monja siniestra",
    promptEn:
      "sinister nun in a black habit with a white wimple and a heavy wooden cross",
    tagline: "Reza por vos. Y por tus tarjetas de crédito.",
    priceFrom: 12900,
    priceTo: 176000,
    storesScraped: 845777,
    imageId: "fastelavn",
    alt: "Foto de archivo de chicos con máscaras blancas en una calle, Dinamarca, c. 1930",
  },
];

export const costumes: readonly Costume[] = seeds.map((seed, index) => {
  const field: CostumeField = index % 3 === 0 ? 1 : index % 3 === 1 ? 2 : 3;
  const base = {
    slug: slugify(seed.name),
    name: seed.name,
    tagline: seed.tagline,
    priceFrom: seed.priceFrom,
    priceTo: seed.priceTo,
    storesScraped: seed.storesScraped,
    mlQuery: seed.name,
    promptEn: seed.promptEn,
    field,
  };
  if (seed.imageId === undefined || seed.alt === undefined) return base;
  return {
    ...base,
    image: {
      src: `/archivo/${seed.imageId}.jpg`,
      alt: seed.alt,
      creditId: seed.imageId,
    },
  };
});

export function getCostume(slug: string): Costume | undefined {
  return costumes.find((costume) => costume.slug === slug);
}

/** Búsqueda sin acentos ni mayúsculas sobre nombre, slug y tagline. */
export function findCostumes(text: string): Costume[] {
  const needle = fold(text);
  if (needle === "") return [];
  return costumes.filter((costume) =>
    fold(`${costume.name} ${costume.slug} ${costume.tagline}`).includes(needle),
  );
}

export function costumeCaption(costume: Costume): string | undefined {
  if (!costume.image) return undefined;
  return credits[costume.image.creditId]?.caption;
}

const storeDefs: readonly { name: string; note: string; shipping: string }[] = [
  {
    name: "Disfraces Don Ramón",
    note: "Don Ramón atiende cuando quiere.",
    shipping: "Envío en 3 a 40 días",
  },
  {
    name: "El Rey del Cotillón",
    note: "Incluye gorrito de cumpleaños de regalo.",
    shipping: "Envío en 3 a 90 días",
  },
  {
    name: "Cotillón Once",
    note: "Se paga en efectivo y a los gritos.",
    shipping: "Envío en 3 a 13 días",
  },
  {
    name: "Todo por $999.999",
    note: "Todo cuesta lo mismo. Todo.",
    shipping: "Envío en 3 a 365 días",
  },
  {
    name: "Mercado Pirata",
    note: "El vendedor firma con un loro.",
    shipping: "Envío en 3 a 666 días",
  },
  {
    name: "La Casa del Susto",
    note: "Entrega sorpresa, a las 3 de la mañana.",
    shipping: "Envío en 3 a 31 días",
  },
];

function hash(text: string): number {
  let value = 5381;
  for (const char of text) {
    value = ((value * 33) ^ (char.codePointAt(0) ?? 0)) >>> 0;
  }
  return value;
}

/** Entre 3 y 4 tiendas inventadas, siempre las mismas para el mismo slug. */
export function storesFor(costume: Costume): Store[] {
  const h = hash(costume.slug);
  const count = 3 + (h % 2);
  const start = h % storeDefs.length;
  const span = costume.priceTo - costume.priceFrom;
  return Array.from({ length: count }, (_, k) => {
    const def = storeDefs[(start + k) % storeDefs.length];
    if (!def) throw new Error("storeDefs vacío");
    const price =
      k === 0
        ? costume.priceFrom
        : costume.priceFrom +
          (((h >>> (k * 3)) * 7919 + k * 104729) % (span + 1));
    return {
      name: def.name,
      price,
      shipping: def.shipping,
      note: def.note,
    };
  });
}
