export type SceneCategory =
  | "tramites"
  | "laburo-tech"
  | "argentina-pura"
  | "cotidiano-absurdo"
  | "epico-cine"
  | "eventos-sociales"
  | "aventura"
  | "formatos";

export type Scene = {
  id: string;
  category: SceneCategory;
  /** Español, para la UI. */
  label: string;
  /** Inglés, descriptivo, para el modelo. */
  prompt: string;
};

export type Style = {
  id: string;
  label: string;
  prompt: string;
};

export const sceneCategories: readonly SceneCategory[] = [
  "tramites",
  "laburo-tech",
  "argentina-pura",
  "cotidiano-absurdo",
  "epico-cine",
  "eventos-sociales",
  "aventura",
  "formatos",
];

export const scenes: readonly Scene[] = [
  // Trámites
  {
    id: "fila-banco",
    category: "tramites",
    label: "En la fila del banco con el número 347",
    prompt:
      "standing in a long slow queue inside a Buenos Aires bank branch, holding a paper ticket with the number 347 while the screen shows number 12",
  },
  {
    id: "registro-dni",
    category: "tramites",
    label: "Sacando el DNI en el Registro",
    prompt:
      "waiting at a government civil registry office in Argentina, clutching a folder of documents, rows of plastic chairs and tired clerks behind glass",
  },
  {
    id: "colectivo-lluvia",
    category: "tramites",
    label: "Esperando el colectivo bajo la lluvia",
    prompt:
      "waiting at a rainy bus stop in Buenos Aires at dusk, puddles on the street, checking the time with a resigned expression",
  },
  {
    id: "portero",
    category: "tramites",
    label: "Discutiendo con el portero",
    prompt:
      "arguing with the building doorman in the lobby of an old apartment building, gesturing with both hands",
  },
  {
    id: "expensas",
    category: "tramites",
    label: "Pagando las expensas",
    prompt:
      "at a payment counter handing over a thick stack of banknotes to pay building fees, a long receipt printing out",
  },
  {
    id: "chatbot-ventanilla",
    category: "tramites",
    label: "Atendido por un chatbot en una ventanilla",
    prompt:
      "being attended at a service window by a clunky screen-faced chatbot robot, with a confused and polite expression",
  },
  // Laburo tech
  {
    id: "daily-zoom",
    category: "laburo-tech",
    label: "En la daily de Zoom",
    prompt:
      "in a video call grid on a big monitor during a daily standup, sitting at a home desk with a laptop and a mug",
  },
  {
    id: "deploy-viernes",
    category: "laburo-tech",
    label: "Deploy un viernes 18 h con el server en llamas",
    prompt:
      "in a server room at 6pm on a Friday, pressing the deploy button on a laptop while a rack of servers burns behind, panicked but determined",
  },
  {
    id: "entrevista-senior",
    category: "laburo-tech",
    label: "Entrevista para Senior con 15 años de experiencia en IA",
    prompt:
      "in a job interview in a modern office, sitting across a desk from skeptical recruiters, a resume on the table",
  },
  {
    id: "hackathon",
    category: "laburo-tech",
    label: "Hackathon a las 4 am entre latas",
    prompt:
      "at a hackathon at 4 in the morning, surrounded by energy drink cans and laptops, eyes wide open, typing furiously",
  },
  {
    id: "pitch-inversores",
    category: "laburo-tech",
    label: "Pitch ante inversores dormidos",
    prompt:
      "giving a startup pitch next to a presentation screen, while a row of investors in suits are fast asleep in their chairs",
  },
  {
    id: "reunion-mail",
    category: "laburo-tech",
    label: "Reunión que podía ser un mail",
    prompt:
      "sitting at a long meeting room table with a whiteboard full of arrows, everyone looking bored, a clock on the wall",
  },
  // Argentina pura
  {
    id: "asado",
    category: "argentina-pura",
    label: "Asado de domingo en la parrilla",
    prompt:
      "at a Sunday family barbecue next to a smoking grill with sausages and meat, backyard with a long table",
  },
  {
    id: "mate-plaza",
    category: "argentina-pura",
    label: "Ronda de mate en la plaza",
    prompt:
      "sitting on the grass in a sunny city park sharing a mate gourd with friends, a thermos beside them",
  },
  {
    id: "subte",
    category: "argentina-pura",
    label: "Subte en hora pico",
    prompt:
      "squeezed inside a packed subway car at rush hour, holding the handrail, surrounded by commuters",
  },
  {
    id: "tribuna-cancha",
    category: "argentina-pura",
    label: "En la tribuna de la cancha",
    prompt:
      "on the terraces of a passionate football stadium, flags and confetti all around, cheering with open arms",
  },
  {
    id: "playa-mdq",
    category: "argentina-pura",
    label: "Playa llena en Mar del Plata en enero",
    prompt:
      "on a crowded beach in Mar del Plata in January, umbrellas packed side by side, finding one square meter of sand",
  },
  {
    id: "kiosco-24h",
    category: "argentina-pura",
    label: "En el kiosco 24 h a las 3 am",
    prompt:
      "at a small 24-hour corner kiosk at 3am, bright neon light, shelves full of snacks and cigarettes behind a window grate",
  },
  // Cotidiano absurdo
  {
    id: "super-chino",
    category: "cotidiano-absurdo",
    label: "En el supermercado chino",
    prompt:
      "walking down a narrow aisle of a neighborhood Chinese supermarket packed with colorful products, pushing a tiny cart",
  },
  {
    id: "gimnasio",
    category: "cotidiano-absurdo",
    label: "Haciendo sentadillas en el gimnasio",
    prompt:
      "doing squats with a loaded barbell in a gym full of mirrors, straining with great effort",
  },
  {
    id: "yoga",
    category: "cotidiano-absurdo",
    label: "En clase de yoga",
    prompt:
      "in a calm yoga studio, twisted in an impossible pose on a mat among serene classmates",
  },
  {
    id: "peluqueria",
    category: "cotidiano-absurdo",
    label: "En la peluquería con ruleros",
    prompt:
      "sitting in a hair salon chair with hair rollers and a salon cape, under a hooded dryer, flipping through a gossip magazine",
  },
  {
    id: "dentista",
    category: "cotidiano-absurdo",
    label: "En el sillón del dentista",
    prompt:
      "reclined in a dentist chair under a bright lamp, mouth wide open, with the dentist's tools nearby",
  },
  {
    id: "platos-almuerzo",
    category: "cotidiano-absurdo",
    label: "Lavando los platos después del almuerzo familiar",
    prompt:
      "standing at a kitchen sink buried under a mountain of dirty dishes after a big family lunch, wearing rubber gloves",
  },
  // Épico / cine
  {
    id: "explosion-slowmo",
    category: "epico-cine",
    label: "Caminando en cámara lenta con una explosión atrás",
    prompt:
      "walking confidently toward the camera in slow motion while a huge fiery explosion erupts behind, cinematic action movie shot",
  },
  {
    id: "disco-cumbia",
    category: "epico-cine",
    label: "En la tapa de un disco de cumbia",
    prompt:
      "posing on a flashy cumbia album cover with neon lettering, glittery background and a dramatic pose",
  },
  {
    id: "alunizaje",
    category: "epico-cine",
    label: "Alunizaje",
    prompt:
      "standing on the surface of the moon planting a flag, the Earth rising in the black sky behind",
  },
  {
    id: "telenovela",
    category: "epico-cine",
    label: "Llanto de telenovela",
    prompt:
      "in a dramatic soap opera scene crying with exaggerated tears in a lavish living room, hand on forehead",
  },
  {
    id: "podio-f1",
    category: "epico-cine",
    label: "En el podio de Fórmula 1",
    prompt:
      "on the winner's podium of a Formula 1 race holding a trophy, spraying champagne while the crowd cheers",
  },
  {
    id: "jefe-final",
    category: "epico-cine",
    label: "Contra el jefe final de un videojuego",
    prompt:
      "facing a gigantic video game final boss in an epic arena, with a health bar floating above, heroic stance",
  },
  // Eventos sociales
  {
    id: "casamiento-vals",
    category: "eventos-sociales",
    label: "Bailando el vals en un casamiento",
    prompt:
      "dancing a waltz on the dance floor of a wedding reception, fairy lights and applauding guests",
  },
  {
    id: "cumple-pelotero",
    category: "eventos-sociales",
    label: "Cumpleaños infantil en el pelotero",
    prompt:
      "sitting in a kids' ball pit at a children's birthday party, surrounded by colorful balls and balloons",
  },
  {
    id: "graduacion",
    category: "eventos-sociales",
    label: "En una graduación con toga",
    prompt:
      "at a university graduation ceremony in a gown and cap, holding a diploma, tossing caps in the air",
  },
  {
    id: "consorcio",
    category: "eventos-sociales",
    label: "En una reunión de consorcio",
    prompt:
      "at a heated building residents' meeting in a small lobby, neighbors arguing around folding chairs and a table of papers",
  },
  {
    id: "fiesta-15",
    category: "eventos-sociales",
    label: "En una fiesta de 15",
    prompt:
      "at a quinceañera party in a decorated banquet hall, balloons and a glittery stage, posing in the middle of the party",
  },
  {
    id: "navidad-40",
    category: "eventos-sociales",
    label: "Cena de Navidad con 40 °C",
    prompt:
      "at a Christmas dinner outdoors in a sweltering summer heat, a fan blowing, sweating next to a roasted table and a sparkling tree",
  },
  // Aventura
  {
    id: "aconcagua",
    category: "aventura",
    label: "En la cumbre del Aconcagua",
    prompt:
      "standing on a snowy mountain summit with climbing gear, ice axe raised, a sea of clouds below",
  },
  {
    id: "kayak-delta",
    category: "aventura",
    label: "En kayak por el Delta",
    prompt:
      "paddling a kayak through the calm brown channels of the Paraná Delta, lush green islands and wooden stilt houses",
  },
  {
    id: "safari",
    category: "aventura",
    label: "De safari",
    prompt:
      "on a safari jeep in the African savanna, binoculars in hand, a curious elephant and giraffes behind",
  },
  {
    id: "paseador-perros",
    category: "aventura",
    label: "Paseando 8 perros en Palermo",
    prompt:
      "walking eight dogs of all sizes on tangled leashes along a tree-lined Palermo street in Buenos Aires",
  },
  {
    id: "camping-mosquitos",
    category: "aventura",
    label: "Camping lleno de mosquitos",
    prompt:
      "at a campsite at dusk next to a small tent and campfire, swatting at a swarm of mosquitos around a lantern",
  },
  {
    id: "pesca-muelle",
    category: "aventura",
    label: "Pescando en el muelle",
    prompt:
      "sitting on a wooden pier at sunrise holding a fishing rod, a bucket and a thermos at their side",
  },
  // Formatos
  {
    id: "foto-dni",
    category: "formatos",
    label: "Foto de DNI",
    prompt:
      "as an official national ID card photo, flat frontal expression against a plain light blue background, shown on an ID card layout",
  },
  {
    id: "figura-accion",
    category: "formatos",
    label: "Figura de acción en su blíster",
    prompt:
      "as a collectible action figure sealed in a plastic blister pack on a colorful cardboard card with a logo and accessories",
  },
  {
    id: "estampilla",
    category: "formatos",
    label: "Estampilla postal",
    prompt:
      "as a vintage postage stamp illustration with a perforated edge, a denomination number and a postmark",
  },
  {
    id: "foto-escolar",
    category: "formatos",
    label: "Foto escolar con los compañeros de grado",
    prompt:
      "in a school class group photo with rows of children and a teacher, in front of a blue mottled backdrop",
  },
  {
    id: "camara-ascensor",
    category: "formatos",
    label: "Cámara del ascensor",
    prompt:
      "seen from a high corner security camera inside a small elevator, fisheye distortion, awkwardly standing alone",
  },
  {
    id: "cuadro-museo",
    category: "formatos",
    label: "Cuadro de museo con visitantes mirándolo",
    prompt:
      "as a framed painting hanging on a museum wall, with a few visitors in the foreground looking at it seriously",
  },
];

export const styles: readonly Style[] = [
  {
    id: "flash",
    label: "Foto de celular con flash",
    prompt:
      "Style: candid smartphone photo taken with a harsh direct flash, slightly grainy, casual snapshot look",
  },
  {
    id: "poster-80s",
    label: "Película de los 80",
    prompt:
      "Style: 1980s movie still, hand-painted illustration look, dramatic lighting, bold retro colors, no text, no title, no letters",
  },
  {
    id: "render-3d",
    label: "Render 3D de animación",
    prompt:
      "Style: stylized 3D animated movie render, soft lighting, expressive character design",
  },
  {
    id: "camara-seguridad",
    label: "Cámara de seguridad",
    prompt:
      "Style: black and white security camera footage, wide-angle lens, low resolution, high angle, no text",
  },
  {
    id: "oleo",
    label: "Óleo renacentista",
    prompt:
      "Style: Renaissance oil painting, rich chiaroscuro, craquelure texture, ornate gold frame feeling",
  },
  {
    id: "editorial",
    label: "Producción de moda",
    prompt:
      "Style: glossy high-fashion editorial photo, professional studio lighting, dramatic pose, no text, no logos",
  },
];

export function getScene(id: string): Scene | undefined {
  return scenes.find((scene) => scene.id === id);
}

export function getStyle(id: string): Style | undefined {
  return styles.find((style) => style.id === id);
}
