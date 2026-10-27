# Fase 1: landing, scraper falso y catálogo (issue #3)

Spec para el worker. Plan madre: `2026-10-26-disfrazate-mvp.md`.

## Dirección de diseño (decidida; taste-skill aplicado a mano)

**Dirección:** "Dressed as something else" (`borrowed-category`) de taste-skill, combinada con "The specimen catalogue" para el catálogo.

**Idea:** en esta página, _el acto de disfrazarse_ se convierte en _la dirección de arte_: el sitio entero está disfrazado de **drop de streetwear**.

- Los disfraces se "lanzan" como un drop.
- Un ticker en el borde muestra el scraping falso en vivo.

**Paleta** (`orange-sky-lime`):

| Rol            | Fondo     | Tinta     |
| -------------- | --------- | --------- |
| Base           | `#161615` | `#f2f2f2` |
| Campo calabaza | `#ff8126` | `#111111` |
| Campo cielo    | `#4db3ff` | `#111111` |
| Campo lima     | `#c5f53d` | `#111111` |

- Acento `#de194b` (rojo sangre): solo en la acción principal y en una cosa más.
- Todo como tokens CSS en `app/globals.css` (`@theme`), con `--ground`, `--ink`, `--accent`, `--field-1..3`.

**Tipografía:** Archivo, una sola familia, vía `next/font/google` con el eje `wdth`.

- Display: peso 800, `font-stretch: 62%`, mayúsculas, tracking -0.01em, interlineado 0.86.
- Texto: ancho normal, 400/500, interlineado 1.5, tamaño ≥16px.
- Máximo 5 tamaños en la página. Números con `font-variant-numeric: tabular-nums`.

**Reglas de la casa (obligatorias; las verifico con screenshots):**

- Headlines de 2 líneas como máximo en 1440, 768 y 390 px.
- Un `h1` en la primera pantalla y un heading en cada sección.
- Márgenes externos iguales, 16-32 px. Separación entre secciones de 120-240 px en desktop.
- Nada de:
  - eyebrows o labels chiquitos en mayúsculas con letter-spacing;
  - monospace;
  - numeración índice (01/02, "Paso 1");
  - líneas finas o bordes de 1 px;
  - gradientes, sombras en reposo, glass/blur, emoji, blobs ni cards con íconos arriba;
  - palabra destacada con otro estilo dentro de un headline.
- Botones planos, de un solo color, con esquinas rectas. Se decide una vez y se respeta en todo el sitio.
- Las secciones vecinas no comparten layout.

**Imágenes:** fotos de archivo reales de disfraces de Halloween antiguos (1890-1940), que son graciosas y perturbadoras a la vez.

- Fuente: Wikimedia Commons, buscando con su API vía `curl` (por ejemplo `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=vintage%20halloween%20costume&prop=imageinfo&iiprop=url|extmetadata&format=json`).
- Licencias aceptadas: solo dominio público, CC0 o CC-BY/BY-SA.
- Bajar entre 6 y 12 a `public/archivo/` (redimensionadas a ≤1400 px de ancho, JPEG o WebP).
- Registrar título, autor, licencia y URL de origen en `lib/credits.ts`.
- **Mínimo 4 imágenes reales en la landing.** Los créditos van chicos en el footer.
- Nunca presentarlas como productos reales; el caption dice qué es ("Disfraz casero, c. 1910").
- Las imágenes se ven a todo color o en duotono con el color del campo. Esquinas rectas.

## Contenido y rutas

### `lib/catalog.ts` (datos puros, tipados, con tests)

**`Costume`:**

| Campo                   | Tipo                                |
| ----------------------- | ----------------------------------- |
| `slug`                  | string                              |
| `name`                  | string                              |
| `tagline`               | string (gracioso, ≤70 caracteres)   |
| `priceFrom` / `priceTo` | number (ARS, inventados y absurdos) |
| `storesScraped`         | number (inventado y enorme)         |
| `mlQuery`               | string                              |
| `field`                 | `1 \| 2 \| 3`                       |
| `image?`                | `{src, alt, creditId}`              |

**24 disfraces:**

1. vampiro
2. bruja
3. zombie
4. momia
5. esqueleto
6. fantasma de sábana
7. hombre lobo
8. calabaza
9. diablo
10. payaso siniestro
11. monstruo de Frankenstein
12. gato negro
13. murciélago
14. pirata
15. astronauta
16. dinosaurio inflable
17. la parca
18. catrina
19. muñeco poseído
20. alien
21. robot de cartón
22. pancho (sí, el pancho)
23. banana
24. monja siniestra

Nada de personajes con marca registrada.

**Tiendas falsas** (`stores`), de 3 a 4 por disfraz y deterministas por slug: "Disfraces Don Ramón", "El Rey del Cotillón", "Cotillón Once", "Todo por $999.999", "Mercado Pirata", "La Casa del Susto". Cada una tiene un precio, un "envío en 3 a 666 días" y otros detalles graciosos.

**Funciones:**

- `mercadoLibreUrl(query)` → `https://listado.mercadolibre.com.ar/disfraz-<query-slugificada>`: minúsculas, sin acentos y con espacios convertidos en `-`.
- `findCostumes(text)`: búsqueda sin distinguir acentos ni mayúsculas, sobre nombre, slug y tagline.
- `getCostume(slug)`.

### `app/page.tsx` (Server Component)

El orden de las secciones sigue el argumento de la página:

1. **Hero.**
   - `h1` "DISFRAZATE" monumental: ancho de viewport, en mayúsculas comprimidas, puede cortarse contra el borde.
   - Una sola oración debajo: "Scrapeamos todas las tiendas del planeta buscando tu disfraz de Halloween. Más o menos."
   - Botón principal con acento: "Disfrazame" → `/disfrazate`.
   - Una foto de archivo grande, ≥40% de la primera pantalla.
   - **Ticker de borde** con logs falsos de scraping que se desplazan, por ejemplo:
     - "4.812.337 tiendas revisadas";
     - "ignorando Temu por razones legales";
     - "encontramos 14 vampiros en Quilmes".
   - El ticker es una animación CSS que con `prefers-reduced-motion` queda estática.
2. **Buscador** (lo interactivo), en `app/_components/FakeScraper.tsx` (`'use client'`, hoja).
   - Pregunta "¿De qué te querés disfrazar?" con un input y un botón "Scrapear".
   - Al enviar se muestra un log de scraping falso. Las líneas aparecen con CSS `animation-delay` escalonado, **sin timers ni `useEffect`**: el estado cambia en el submit y el resto es CSS.
   - Después aparecen los disfraces que coinciden (`findCostumes`) y **siempre** el link real "Ver resultados en MercadoLibre" (`mercadoLibreUrl`).
   - Región `aria-live="polite"` con el resultado final.
   - Si no hay JS: el form hace GET a `/buscar?q=` (página server simple con los mismos resultados).
3. **El drop** ("Drop Halloween 2026").
   - Catálogo con el formato specimen: tiles de color plano que rotan entre los campos 1-3, con imagen centrada si existe y, si no, el nombre en display grande dentro del tile.
   - Uno de cada 6-7 tiles va a tamaño doble.
   - Fuera del tile: nombre, "desde $X" y "N tiendas scrapeadas".
   - Cada tile es un link a `/disfraz/[slug]`.
4. **"Lo que decimos / lo que hacemos".** Dos columnas, por ejemplo: "Scraping cuántico distribuido en 190 países" frente a "Un archivo con 24 disfraces". Es honestidad graciosa y refuerza el chiste del pitch.
5. **Campo DISFRAZATE.** Sección de pantalla completa en campo lima.
   - Headline del estilo "No compres. Probátelo."
   - Una oración explicando que con una foto de cuerpo entero la IA te disfraza en situaciones absurdas.
   - Botón → `/disfrazate`.
6. **Footer.** El nombre de nuevo a ancho completo, "Hecho para SIDEQUEST", los créditos de las fotos de archivo y un disclaimer chico ("No scrapeamos nada. Todavía.").

### Otras rutas

- **`app/disfraz/[slug]/page.tsx`:**
  - specimen grande, tagline y tiendas falsas en una tabla real (`<table>`; acá se permiten líneas);
  - botón "Ver publicación" → `mercadoLibreUrl`, con `target=_blank rel=noopener`;
  - botón DISFRAZATE → `/disfrazate?disfraz=<slug>`;
  - `generateStaticParams` y `generateMetadata`;
  - `notFound()` si el slug no existe.
- **`app/disfrazate/page.tsx`:** stub temporal ("El probador abre pronto"). Se reemplaza en la fase 2. Lee `searchParams.disfraz` y nombra el disfraz si es válido.
- **`app/buscar/page.tsx`:** fallback sin JS del buscador.
- **`loading.tsx` / `error.tsx`** por segmento, según AGENTS.md. **`not-found.tsx`** con chiste ("Este disfraz se lo llevó el fantasma").
- **`app/layout.tsx`:**
  - `lang="es-AR"`;
  - metadata con título "Disfrazate", descripción y Open Graph;
  - fuente Archivo;
  - un nav simple: wordmark, "El drop", "Buscador" y el botón "Disfrazame".
- Borrar los SVG del template en `public/` y la landing de Next por defecto.

## Movimiento (CSS, sin JS)

- Entrada por sección con heading, después texto, después imagen, escalonados 60-90 ms y subiendo 16-32 px. Se hace con `animation-timeline: view()` donde esté soportado; donde no, el contenido queda visible sin animar. Nunca puede quedar contenido oculto.
- Feedback de press, hover y focus en botones, links y tiles: transform y opacity, sin sombras.
- Ticker y escala lenta sobre la foto del hero.
- Todo bajo `@media (prefers-reduced-motion: no-preference)`.

## Reglas del repo

- Nada de `useEffect`.
- `'use client'` solo en hojas.
- `no-console`, jsx-a11y y `import type`.
- Sin `any`.
- Imágenes con `next/image` y su `alt`.
- Agregar `.taste-skill/` a `.gitignore`.

## Tests (Vitest, junto al código: `lib/catalog.test.ts`)

Nombres con el formato "should X when Y". Casos:

- 24 slugs únicos;
- `mercadoLibreUrl` con acentos y espacios ("Monstruo de Frankenstein" → `disfraz-monstruo-de-frankenstein`);
- `findCostumes("MOMIA")` y `findCostumes("murcielago")`, que tiene que encontrar "murciélago";
- `getCostume` con un slug inexistente → `undefined`;
- cada `image.creditId` existe en `credits`.

## Aceptación

```
pnpm lint --max-warnings 0 && pnpm typecheck && pnpm test && pnpm build
```

Además, `pnpm start` levanta y `/`, `/disfraz/vampiro`, `/buscar?q=bruja`, `/disfrazate` y `/disfraz/no-existe` (que debe dar 404) responden. El worker commitea en `feat/3-catalogo-scraper` con un Conventional Commit, sin pushear. La revisión visual la hago yo con screenshots.
