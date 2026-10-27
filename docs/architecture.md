# Architecture - Disfrazate

## Overview

Next.js 16 server-rendered. La landing y el catálogo son Server Components sobre datos estáticos (`lib/catalog.ts`); el único componente cliente es el buscador (`app/_components/FakeScraper.tsx`), cuyo "scraping" es un log animado por CSS. El flujo DISFRAZATE (fase 2) genera imágenes con un endpoint de SageMaker (FLUX.2 klein 4B) vía Route Handlers; fase 3 suma el muro (Supabase Realtime).

## Modules / boundaries

| Módulo                                                                       | Responsabilidad                                                                                                                                       |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/catalog.ts`                                                             | 60 disfraces en 8 categorías, tiendas falsas, búsqueda y URL de MercadoLibre. Puro, sin I/O.                                                          |
| `lib/credits.ts`                                                             | Créditos de las fotos de archivo usadas (`public/archivo/`, Wikimedia Commons).                                                                       |
| `app/_components/`                                                           | UI compartida; solo `FakeScraper` es `'use client'`.                                                                                                  |
| `proxy.ts`                                                                   | 404 real para slugs de disfraz inexistentes.                                                                                                          |
| `lib/scenes.ts`, `lib/pick-scenes.ts`, `lib/prompt.ts`                       | 48 escenas en 8 categorías + 6 estilos (todos fotográficos); elección de 4 escenas (pura); plantilla del prompt.                                      |
| `lib/image-provider.server.ts`                                               | Interfaz `ImageProvider`: SageMaker (real) y demo (`public/demo/`).                                                                                   |
| `lib/env.server.ts`, `lib/event-gate.server.ts`, `lib/usage-store.server.ts` | Env validado con zod; portón por cookie `dz_event` (HMAC); contadores en memoria (`UsageStore`).                                                      |
| `lib/image.ts`                                                               | Resize/JPEG en el cliente (lado mayor 1024, calidad 0.85).                                                                                            |
| `app/api/escenas`, `app/api/disfrazar`                                       | Route Handlers del flujo (requieren la cookie del evento).                                                                                            |
| `app/disfrazate/`                                                            | Portón con Server Action + `Probador` (`useReducer`, cámara por handlers).                                                                            |
| `lib/custom-costumes.server.ts`, `lib/costumes.server.ts`                    | Disfraces scrapeados en Supabase (lecturas con `'use cache'` + tag `custom-costumes`); `getAnyCostume`/`listAllCostumes` unen estáticos y scrapeados. |
| `lib/costume-namer.server.ts`, `lib/scrape-costume.server.ts`                | Nova Lite (Bedrock) traduce y modera el texto; el orquestador de `POST /api/scrapear` con dependencias inyectadas.                                    |
| `app/api/scrapear`, `app/api/evento`                                         | Crear un disfraz desde el buscador; pedir el código del evento sin salir de la página.                                                                |

## Data model

Supabase (proyecto `disfrazate`): tabla `custom_costumes` (lectura pública por RLS, escritura con la secret key) y bucket público `catalogo` (JPEG ≤ 1 MB); migración en `supabase/migrations/`. Tipo `Costume` en `lib/catalog.ts` (los scrapeados usan la categoría `scrapeados`). Tabla `generations` (RLS sin políticas, solo secret key) y bucket privado `participantes` (JPEG ≤ 2 MB, `<sha256>/original.jpg` y `<sha256>/<escena>-<estilo>-<seed>.jpg`): fotos de participantes y resultados, a borrar a los 30 días del evento. Los contadores de escenas y de generaciones viven en memoria del proceso (`UsageStore`); en fase 3 pasan a Supabase.

## Key flows

- **Catálogo**: `/` muestra 12 destacados y `/disfraces` los 60, con filtro por categoría vía `?cat=` (valor inválido: se muestran todos). Las fotos de producto (FLUX, 4:5) viven en `public/catalogo/<slug>.jpg`; `pnpm catalog:prompts` imprime `slug<TAB>promptEn` para generarlas.

- **Buscar**: `FakeScraper` (form) → estado en el submit → log CSS escalonado → `findCostumes` + link real a MercadoLibre. Sin JS: GET `/buscar?q=`.
- **Ver disfraz**: `/disfraz/[slug]` (estático vía `generateStaticParams`) → "Ver publicación" (MercadoLibre) o DISFRAZATE → `/disfrazate?disfraz=<slug>`.

- **DISFRAZATE**: `/disfrazate` sin cookie `dz_event` muestra el form del código (Server Action `unlockEvent`, comparación en tiempo constante) → con acceso, `Probador`: elegir disfraz → foto (input con `capture` o `getUserMedia` en el click; resize en el cliente; consentimiento) → `POST /api/escenas` (4 escenas de 4 categorías, las menos usadas) → 4 × `POST /api/disfrazar` en paralelo (cada tarjeta se actualiza sola; "reintentar" y "otra escena" por tarjeta). El `Probador` se resetea al ocultarse la ruta: con `cacheComponents` Next la conserva en `<Activity hidden>`, así que un `useLayoutEffect` cleanup aborta los fetch en vuelo (`AbortController` en un ref) y despacha `reset` (vuelve a `elegir`, o a `foto` si la URL trae `?disfraz=`). La foto nunca se loguea; con el consentimiento de `/terminos`, después de responder (`after()`) `saveGeneration` guarda la original y el resultado en el bucket privado `participantes` y una fila en `generations` (ADR 0004). Errores JSON `{ error: { kind, message } }`: 401 sin acceso, 400 inválido, 429 tope de generaciones, 503 endpoint apagado, 504 timeout, 422 rechazada.

- **Scrapear disfraz**: sin resultados (o desde "¿No es lo que buscabas?") el buscador muestra el botón → `POST /api/scrapear` (cookie del evento; sin ella 401 y el cliente pide el código a `POST /api/evento` y reintenta). El servidor valida el texto, devuelve el existente si coincide, aplica el tope `MAX_CUSTOM_COSTUMES`, Nova Lite devuelve `{name, promptEn, tagline}` o rechaza (422), SageMaker genera la foto de producto con la referencia gris, se sube a Storage, se inserta la fila y se revalida el tag `custom-costumes` con `revalidateTag(tag, { expire: 0 })` (en Route Handlers no existe `updateTag`). Sin variables de Supabase responde 503 "El scraper está apagado". `/disfraz/s-…` pasa por `proxy.ts` por formato y la página hace `notFound()` (un slug scrapeado inexistente devuelve 200 con la página de no encontrado). ADR 0003.

## External services

- AWS SageMaker (endpoint `disfrazate-flux`, FLUX.2 klein 4B; ADR 0002). Se cobra por hora prendido: `pnpm endpoint:up` / `endpoint:down`.
- Supabase (Postgres + Storage): disfraces scrapeados (ADR 0003) y fotos de participantes (ADR 0004).
- Amazon Bedrock (Nova Lite, Converse API): traduce y modera el texto del scrapeo.
- MercadoLibre: solo links a búsquedas (`mercadoLibreUrl`), sin API.
- Wikimedia Commons: origen de las fotos de archivo (descargadas al repo).

## Env vars

Ver `.env.example`. Server-only, validadas con zod en `lib/env.server.ts`:

| Variable                                                 | Default                 | Nota                                        |
| -------------------------------------------------------- | ----------------------- | ------------------------------------------- |
| `IMAGE_PROVIDER`                                         | `demo`                  | `sagemaker` o `demo`                        |
| `APP_AWS_REGION`                                         | `us-east-1`             |                                             |
| `APP_AWS_ACCESS_KEY_ID` / `APP_AWS_SECRET_ACCESS_KEY`    | -                       | obligatorias con `IMAGE_PROVIDER=sagemaker` |
| `SAGEMAKER_ENDPOINT`                                     | `disfrazate-flux`       |                                             |
| `EVENT_CODE`                                             | -                       | sin él nadie entra al probador              |
| `MAX_GENERATIONS`                                        | sin tope                | tope de imágenes generadas                  |
| `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | -                       | sin ellas el scrapeo responde 503           |
| `BEDROCK_TEXT_MODEL`                                     | `amazon.nova-lite-v1:0` |                                             |
| `MAX_CUSTOM_COSTUMES`                                    | `100`                   | tope de disfraces scrapeados                |

## Deploy

Pendiente: Vercel (fase 4).
