export type CostumeField = 1 | 2 | 3;

export type CostumeCategory =
  | "terror"
  | "criaturas"
  | "comida"
  | "oficios"
  | "animales"
  | "genericos"
  | "argentinidad"
  | "absurdos";

export const costumeCategories: readonly CostumeCategory[] = [
  "terror",
  "criaturas",
  "comida",
  "oficios",
  "animales",
  "genericos",
  "argentinidad",
  "absurdos",
];

/** Etiquetas en español para la UI. */
export const categoryLabels: Readonly<Record<CostumeCategory, string>> = {
  terror: "Terror clásico",
  criaturas: "Criaturas",
  comida: "Comida",
  oficios: "Oficios",
  animales: "Animales",
  genericos: "Personajes",
  argentinidad: "Argentinidad",
  absurdos: "Absurdos",
};

export type CostumePhoto = {
  src: string;
  alt: string;
};

export function isCostumeCategory(value: unknown): value is CostumeCategory {
  return costumeCategories.some((category) => category === value);
}

export type Costume = {
  slug: string;
  name: string;
  tagline: string;
  priceFrom: number;
  priceTo: number;
  storesScraped: number;
  category: CostumeCategory;
  mlQuery: string;
  /** Descripción visual corta en inglés, para el prompt del modelo. */
  promptEn: string;
  field: CostumeField;
  /** Foto de producto generada en `public/catalogo/<slug>.jpg`. */
  photo: CostumePhoto;
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
  category: CostumeCategory;
  promptEn: string;
  tagline: string;
  priceFrom: number;
  priceTo: number;
  storesScraped: number;
};

const seeds: readonly Seed[] = [
  {
    name: "Vampiro",
    category: "terror",
    promptEn:
      "classic vampire with a black high-collared cape, red satin lining, pale makeup and fangs",
    tagline: "Chupa sangre, no chupa tu aguinaldo. Casi.",
    priceFrom: 18900,
    priceTo: 249000,
    storesScraped: 203,
  },
  {
    name: "Bruja",
    category: "terror",
    promptEn:
      "witch with a pointed black hat, long dark dress and a broomstick",
    tagline: "Incluye escoba. La nafta del vuelo va aparte.",
    priceFrom: 12500,
    priceTo: 189000,
    storesScraped: 57,
  },
  {
    name: "Zombie",
    category: "terror",
    promptEn:
      "zombie with torn bloody clothes, grey-green skin makeup and sunken eyes",
    tagline: "Ya tenés la cara un lunes a las 7 de la mañana.",
    priceFrom: 9900,
    priceTo: 154000,
    storesScraped: 311,
  },
  {
    name: "Momia",
    category: "terror",
    promptEn: "mummy wrapped head to toe in aged linen bandages",
    tagline: "Veinte rollos de venda y un cuarto de hora de dignidad.",
    priceFrom: 7400,
    priceTo: 98000,
    storesScraped: 28,
  },
  {
    name: "Esqueleto",
    category: "terror",
    promptEn:
      "skeleton jumpsuit with white bones printed on black fabric and a skull face paint",
    tagline: "Todo hueso, cero panza. Ideal para después de las fiestas.",
    priceFrom: 11200,
    priceTo: 133500,
    storesScraped: 174,
  },
  {
    name: "Fantasma de sábana",
    category: "terror",
    promptEn: "classic ghost made of a white bedsheet with two round eye holes",
    tagline: "Una sábana con dos agujeros. El clásico no falla.",
    priceFrom: 1500,
    priceTo: 79900,
    storesScraped: 262,
  },
  {
    name: "Hombre lobo",
    category: "criaturas",
    promptEn:
      "werewolf with a furry brown body suit, claws and a snarling wolf mask",
    tagline: "Se transforma con luna llena y con el segundo fernet.",
    priceFrom: 21000,
    priceTo: 310000,
    storesScraped: 19,
  },
  {
    name: "Calabaza",
    category: "criaturas",
    promptEn:
      "giant orange pumpkin with a carved jack-o-lantern face and a green stem hat",
    tagline: "Naranja, redonda y sin ningún plan de vida.",
    priceFrom: 8800,
    priceTo: 120000,
    storesScraped: 138,
  },
  {
    name: "Diablo",
    category: "criaturas",
    promptEn:
      "red devil with horns, a pointed tail, a red cape and a pitchfork",
    tagline: "Cuernos, capa y una deuda con el cotillón.",
    priceFrom: 6500,
    priceTo: 99000,
    storesScraped: 295,
  },
  {
    name: "Payaso siniestro",
    category: "terror",
    promptEn:
      "creepy clown with a rainbow wig, white face paint, red nose and a ruffled collar",
    tagline: "Nadie pidió este globo, pero ahí está.",
    priceFrom: 14300,
    priceTo: 212000,
    storesScraped: 84,
  },
  {
    name: "Monstruo de Frankenstein",
    category: "criaturas",
    promptEn:
      "Frankenstein's monster with green skin, neck bolts, a flat head and a stitched dark suit",
    tagline: "Tornillos en el cuello y los zapatos de tu papá.",
    priceFrom: 17700,
    priceTo: 187500,
    storesScraped: 47,
  },
  {
    name: "Gato negro",
    category: "animales",
    promptEn:
      "black cat with a furry black bodysuit, pointed ears, whiskers and a long tail",
    tagline: "Mala suerte para los demás. Para vos, orejas.",
    priceFrom: 4900,
    priceTo: 64000,
    storesScraped: 226,
  },
  {
    name: "Murciélago",
    category: "animales",
    promptEn: "bat with large black wings, pointed ears and a dark bodysuit",
    tagline: "Colgado de cabeza, como tus cuentas del mes.",
    priceFrom: 7800,
    priceTo: 110000,
    storesScraped: 333,
  },
  {
    name: "Pirata",
    category: "genericos",
    promptEn:
      "pirate with a tricorn hat, eye patch, striped shirt, long coat and a plastic sword",
    tagline: "Parche, loro y un mapa del tesoro que es una factura.",
    priceFrom: 9300,
    priceTo: 145000,
    storesScraped: 102,
  },
  {
    name: "Astronauta",
    category: "oficios",
    promptEn:
      "white astronaut spacesuit with a round helmet and a mission patch",
    tagline: "Para ir a la fiesta como quien va a la Luna: con cara de nada.",
    priceFrom: 32000,
    priceTo: 395000,
    storesScraped: 71,
  },
  {
    name: "Dinosaurio inflable",
    category: "criaturas",
    promptEn:
      "inflatable green dinosaur suit with a big tail and a toothy head",
    tagline: "No entrás en el ascensor. Vale cada centímetro.",
    priceFrom: 15900,
    priceTo: 168000,
    storesScraped: 189,
  },
  {
    name: "La Parca",
    category: "terror",
    promptEn:
      "Grim Reaper in a black hooded robe with a skull mask and a scythe",
    tagline: "Llega puntual, a diferencia del colectivo.",
    priceFrom: 10400,
    priceTo: 141000,
    storesScraped: 248,
  },
  {
    name: "Catrina",
    category: "terror",
    promptEn:
      "elegant Catrina with a skull face paint, a wide flowered hat and a long lace dress",
    tagline: "Elegante hasta en el más allá, con sombrero y todo.",
    priceFrom: 13600,
    priceTo: 199000,
    storesScraped: 36,
  },
  {
    name: "Muñeco poseído",
    category: "terror",
    promptEn:
      "creepy possessed porcelain doll with pale cracked makeup, rosy cheeks and a frilly dress",
    tagline: "Parpadea cuando no lo mirás. Ya lo sabés.",
    priceFrom: 16600,
    priceTo: 222000,
    storesScraped: 157,
  },
  {
    name: "Alien",
    category: "criaturas",
    promptEn:
      "green alien with big black almond eyes, antennae and a shiny silver jumpsuit",
    tagline: "Venimos en paz, pero queremos tu WiFi.",
    priceFrom: 19400,
    priceTo: 260000,
    storesScraped: 299,
  },
  {
    name: "Robot de cartón",
    category: "genericos",
    promptEn:
      "homemade cardboard box robot with silver paint, dials and foil details",
    tagline: "Caja de heladera, cinta de embalar y mucho fe.",
    priceFrom: 3200,
    priceTo: 57000,
    storesScraped: 64,
  },
  {
    name: "Pancho",
    category: "comida",
    promptEn:
      "giant hot dog with a bun, a sausage and mustard and ketchup stripes",
    tagline: "Sí, el pancho. Con salchicha, pan y mucha dignidad.",
    priceFrom: 5600,
    priceTo: 88000,
    storesScraped: 121,
  },
  {
    name: "Banana",
    category: "comida",
    promptEn: "full-body costume shaped like a giant curved yellow banana fruit with brown tips, the face showing through an oval opening near the top",
    tagline: "Amarilla, curva y totalmente innecesaria.",
    priceFrom: 6100,
    priceTo: 92000,
    storesScraped: 214,
  },
  {
    name: "Monja siniestra",
    category: "terror",
    promptEn:
      "sinister nun in a black habit with a white wimple and a heavy wooden cross",
    tagline: "Reza por vos. Y por tus tarjetas de crédito.",
    priceFrom: 12900,
    priceTo: 176000,
    storesScraped: 92,
  },
  {
    name: "Sirena",
    category: "criaturas",
    promptEn:
      "mermaid with a shimmering green sequin tail skirt, a seashell top and long wavy hair",
    tagline: "Cola de lentejuelas y cero capacidad de caminar.",
    priceFrom: 14800,
    priceTo: 176000,
    storesScraped: 17,
  },
  {
    name: "Dragón",
    category: "criaturas",
    promptEn:
      "green dragon onesie with spiked back ridges, small wings and a snout hood",
    tagline: "Echa fuego solo si le prestás el encendedor.",
    priceFrom: 19500,
    priceTo: 238000,
    storesScraped: 276,
  },
  {
    name: "Yeti",
    category: "criaturas",
    promptEn:
      "big white furry yeti suit with a shaggy hood, blue face and oversized feet",
    tagline: "Peludo, frío y con un ligero problema de higiene.",
    priceFrom: 22300,
    priceTo: 274000,
    storesScraped: 183,
  },
  {
    name: "Choripán",
    category: "comida",
    promptEn:
      "giant choripán costume: a crusty bread roll with a red chorizo sausage and green chimichurri",
    tagline: "El pan, el chori y la tapa de colesterol.",
    priceFrom: 5900,
    priceTo: 86000,
    storesScraped: 44,
  },
  {
    name: "Empanada",
    category: "comida",
    promptEn:
      "giant baked empanada costume with golden crimped edges and a brown pastry shell",
    tagline: "Con repulgue a mano. No preguntes el relleno.",
    priceFrom: 6700,
    priceTo: 94000,
    storesScraped: 321,
  },
  {
    name: "Medialuna",
    category: "comida",
    promptEn:
      "giant golden croissant medialuna costume with a glossy sugar glaze",
    tagline: "De manteca, de grasa o de lo que haya.",
    priceFrom: 5400,
    priceTo: 81500,
    storesScraped: 109,
  },
  {
    name: "Mate",
    category: "comida",
    promptEn:
      "giant mate gourd costume with a metal bombilla straw and a green yerba rim",
    tagline: "Siempre lavado. Siempre pasa de mano en mano.",
    priceFrom: 6200,
    priceTo: 89900,
    storesScraped: 238,
  },
  {
    name: "Pizza de muzzarella",
    category: "comida",
    promptEn:
      "giant pizza slice costume with melted cheese, red sauce and a crust border",
    tagline: "Con faina y sin ninguna dignidad calórica.",
    priceFrom: 7100,
    priceTo: 102000,
    storesScraped: 76,
  },
  {
    name: "Sándwich de miga",
    category: "comida",
    promptEn:
      "giant triangular sandwich de miga costume with white crustless bread and thin ham layers",
    tagline: "Triple, de jamón y queso. Corte triangular obligatorio.",
    priceFrom: 6800,
    priceTo: 97500,
    storesScraped: 152,
  },
  {
    name: "Bombero",
    category: "oficios",
    promptEn:
      "firefighter in a yellow turnout coat, red helmet, reflective stripes and a hose",
    tagline: "Apaga incendios, pero no los del aguinaldo.",
    priceFrom: 16400,
    priceTo: 201000,
    storesScraped: 26,
  },
  {
    name: "Médico",
    category: "oficios",
    promptEn:
      "doctor in a white lab coat with a stethoscope, a head mirror and a clipboard",
    tagline: "Cobra la consulta aunque sea de disfraz.",
    priceFrom: 11800,
    priceTo: 138000,
    storesScraped: 257,
  },
  {
    name: "Chef",
    category: "oficios",
    promptEn:
      "chef in a double-breasted white jacket, a tall white toque hat and a striped apron",
    tagline: "La cocina es un caos, pero con gorro alto.",
    priceFrom: 9400,
    priceTo: 119000,
    storesScraped: 198,
  },
  {
    name: "Cartero",
    category: "oficios",
    promptEn:
      "mail carrier in a blue uniform with a cap and a messenger bag full of envelopes",
    tagline: "Trae cartas, facturas y malas noticias por igual.",
    priceFrom: 8900,
    priceTo: 107000,
    storesScraped: 59,
  },
  {
    name: "Mecánico",
    category: "oficios",
    promptEn:
      "mechanic in grease-stained blue overalls with a big wrench and a red rag in the pocket",
    tagline: "Dice que es cosa de dos horas. Son dos semanas.",
    priceFrom: 9900,
    priceTo: 121000,
    storesScraped: 284,
  },
  {
    name: "Pingüino",
    category: "animales",
    promptEn:
      "penguin costume with a black and white bodysuit, an orange beak and flippers",
    tagline: "Va de smoking a todos lados, hasta al supermercado.",
    priceFrom: 8300,
    priceTo: 115000,
    storesScraped: 131,
  },
  {
    name: "Carpincho",
    category: "animales",
    promptEn:
      "capybara costume with a brown furry bodysuit, small round ears and a blunt snout",
    tagline: "El más tranquilo de la fiesta, y de la urbanización.",
    priceFrom: 12100,
    priceTo: 148000,
    storesScraped: 163,
  },
  {
    name: "Pulpo",
    category: "animales",
    promptEn:
      "purple octopus costume with eight long floppy tentacles and a big round hood",
    tagline: "Ocho brazos para sostener ocho vasos.",
    priceFrom: 13500,
    priceTo: 164000,
    storesScraped: 23,
  },
  {
    name: "Flamenco",
    category: "animales",
    promptEn:
      "pink flamingo costume with long thin legs, a feathered body and a curved neck hood",
    tagline: "Parado en una pata desde 1987.",
    priceFrom: 10700,
    priceTo: 126000,
    storesScraped: 305,
  },
  {
    name: "Vaca",
    category: "animales",
    promptEn:
      "black and white spotted cow costume with a pink udder, small horns and a cowbell",
    tagline: "Muuy buena onda. Incluye cencerro.",
    priceFrom: 7500,
    priceTo: 104000,
    storesScraped: 88,
  },
  {
    name: "Ninja",
    category: "genericos",
    promptEn:
      "black ninja outfit with a face wrap, a red sash and a plastic katana",
    tagline: "Se mueve en silencio, menos cuando se choca la puerta.",
    priceFrom: 8100,
    priceTo: 109000,
    storesScraped: 218,
  },
  {
    name: "Superhéroe genérico",
    category: "genericos",
    promptEn:
      "generic superhero in a bright purple and green tight bodysuit with a flowing orange cape, a plain round blank chest badge with no letters or symbols, and a simple eye mask",
    tagline: "Con capa, sin marca registrada, y con la nuestra.",
    priceFrom: 14200,
    priceTo: 172000,
    storesScraped: 41,
  },
  {
    name: "Princesa",
    category: "genericos",
    promptEn:
      "princess in a big pastel pink ball gown, a sparkling tiara and long white gloves",
    tagline: "Corona de plástico, aires de realeza.",
    priceFrom: 15600,
    priceTo: 186000,
    storesScraped: 270,
  },
  {
    name: "Cowboy",
    category: "genericos",
    promptEn:
      "cowboy in a wide-brim leather hat, a fringed vest, a bandana and a toy sheriff star",
    tagline: "Del oeste. Del oeste del Gran Buenos Aires.",
    priceFrom: 9600,
    priceTo: 127000,
    storesScraped: 147,
  },
  {
    name: "Caballero medieval",
    category: "genericos",
    promptEn:
      "medieval knight in a silver chainmail tunic with a plastic helmet and a wooden shield",
    tagline: "Armadura de cartón, honor de sobra.",
    priceFrom: 18300,
    priceTo: 224000,
    storesScraped: 112,
  },
  {
    name: "Mago",
    category: "genericos",
    promptEn:
      "wizard in a long starry purple robe, a tall pointed hat and a long white beard",
    tagline: "Hace desaparecer la plata de la billetera.",
    priceFrom: 10300,
    priceTo: 132000,
    storesScraped: 334,
  },
  {
    name: "Gaucho",
    category: "argentinidad",
    promptEn:
      "gaucho in a flat black hat, a poncho, baggy bombacha trousers, a red neckerchief and a wide leather belt",
    tagline: "Facón de goma y la pampa en la cabeza.",
    priceFrom: 13900,
    priceTo: 167000,
    storesScraped: 66,
  },
  {
    name: "Hincha de fútbol",
    category: "argentinidad",
    promptEn:
      "football fan in a light blue and white striped jersey, a team scarf and a face painted with the same colors",
    tagline: "Canta aunque el equipo pierda. Sobre todo si pierde.",
    priceFrom: 8700,
    priceTo: 112000,
    storesScraped: 193,
  },
  {
    name: "Colectivero",
    category: "argentinidad",
    promptEn:
      "city bus driver in a grey uniform shirt with a cap, holding a big steering wheel prop and a ticket machine",
    tagline: "No frena en la parada. Nunca frena en la parada.",
    priceFrom: 9200,
    priceTo: 118000,
    storesScraped: 31,
  },
  {
    name: "Abuela con ruleros",
    category: "argentinidad",
    promptEn:
      "grandmother in a quilted floral housecoat with pink hair rollers, slippers and a knitted shawl",
    tagline: "Te da de comer aunque hayas comido recién.",
    priceFrom: 7900,
    priceTo: 103000,
    storesScraped: 243,
  },
  {
    name: "Bailarín de tango",
    category: "argentinidad",
    promptEn:
      "tango dancer in a black fedora, a pinstripe suit, a red scarf and polished two-tone shoes",
    tagline: "Dos para el tango, uno para la foto.",
    priceFrom: 16900,
    priceTo: 205000,
    storesScraped: 96,
  },
  {
    name: "Mozo de bodegón",
    category: "argentinidad",
    promptEn:
      "bodegón waiter in a white shirt, a black vest and bow tie, a white apron and a towel over the arm",
    tagline: "Hoy no hay de lo que pediste. Hay milanesa.",
    priceFrom: 8600,
    priceTo: 114000,
    storesScraped: 178,
  },
  {
    name: "Cono de tránsito",
    category: "absurdos",
    promptEn:
      "orange traffic cone costume with white reflective stripes and a flat base ring",
    tagline: "Tenés que correrte. Él no se va a correr.",
    priceFrom: 4800,
    priceTo: 69000,
    storesScraped: 252,
  },
  {
    name: "Inodoro",
    category: "absurdos",
    promptEn:
      "giant white toilet costume with an open lid, a seat ring around the waist and a toilet paper roll hat",
    tagline: "Lo más cerca de un trono que vas a estar.",
    priceFrom: 5300,
    priceTo: 78500,
    storesScraped: 14,
  },
  {
    name: "Wifi caído",
    category: "absurdos",
    promptEn:
      "cardboard wifi symbol costume worn on the chest with a big red cross over the arcs",
    tagline: "Todo el mundo te necesita y nadie te encuentra.",
    priceFrom: 3900,
    priceTo: 56000,
    storesScraped: 126,
  },
  {
    name: "Heladera",
    category: "absurdos",
    promptEn:
      "big white fridge costume made of a box with a freezer door, handles and fridge magnets",
    tagline: "Por dentro hay una cebolla y mucha esperanza.",
    priceFrom: 11400,
    priceTo: 141000,
    storesScraped: 289,
  },
  {
    name: "Semáforo",
    category: "absurdos",
    promptEn:
      "traffic light costume made of a black box with red, yellow and green glowing circles on the torso",
    tagline: "Siempre está en amarillo cuando más apurado estás.",
    priceFrom: 6400,
    priceTo: 91000,
    storesScraped: 53,
  },
];

export const costumes: readonly Costume[] = seeds.map((seed, index) => {
  const field: CostumeField = index % 3 === 0 ? 1 : index % 3 === 1 ? 2 : 3;
  const slug = slugify(seed.name);
  return {
    slug,
    name: seed.name,
    tagline: seed.tagline,
    priceFrom: seed.priceFrom,
    priceTo: seed.priceTo,
    storesScraped: seed.storesScraped,
    category: seed.category,
    mlQuery: seed.name,
    promptEn: seed.promptEn,
    field,
    photo: {
      src: `/catalogo/${slug}.jpg`,
      alt: `${seed.name}: foto ilustrativa`,
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
