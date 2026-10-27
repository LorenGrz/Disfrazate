# Architecture - Disfrazate

## Overview

Next.js 16 server-rendered. La landing y el catálogo son Server Components sobre datos estáticos (`lib/catalog.ts`); el único componente cliente es el buscador (`app/_components/FakeScraper.tsx`), cuyo "scraping" es un log animado por CSS. El flujo DISFRAZATE (fase 2) genera imágenes con un endpoint de SageMaker (FLUX.2 klein 4B) vía Route Handlers; fase 3 suma el muro (Supabase Realtime).

## Modules / boundaries

| Módulo                                                                       | Responsabilidad                                                                                                  |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `lib/catalog.ts`                                                             | 60 disfraces en 8 categorías, tiendas falsas, búsqueda y URL de MercadoLibre. Puro, sin I/O.                     |
| `lib/credits.ts`                                                             | Créditos de las fotos de archivo usadas (`public/archivo/`, Wikimedia Commons).                                  |
| `app/_components/`                                                           | UI compartida; solo `FakeScraper` es `'use client'`.                                                             |
| `proxy.ts`                                                                   | 404 real para slugs de disfraz inexistentes.                                                                     |
| `lib/scenes.ts`, `lib/pick-scenes.ts`, `lib/prompt.ts`                       | 48 escenas en 8 categorías + 6 estilos (todos fotográficos); elección de 4 escenas (pura); plantilla del prompt. |
| `lib/image-provider.server.ts`                                               | Interfaz `ImageProvider`: SageMaker (real) y demo (`public/demo/`).                                              |
| `lib/env.server.ts`, `lib/event-gate.server.ts`, `lib/usage-store.server.ts` | Env validado con zod; portón por cookie `dz_event` (HMAC); contadores en memoria (`UsageStore`).                 |
| `lib/image.ts`                                                               | Resize/JPEG en el cliente (lado mayor 1024, calidad 0.85).                                                       |
| `app/api/escenas`, `app/api/disfrazar`                                       | Route Handlers del flujo (requieren la cookie del evento).                                                       |
| `app/disfrazate/`                                                            | Portón con Server Action + `Probador` (`useReducer`, cámara por handlers).                                       |

## Data model

Sin base de datos todavía. Tipo `Costume` en `lib/catalog.ts`. Los contadores de escenas y de generaciones viven en memoria del proceso (`UsageStore`); en fase 3 pasan a Supabase.

## Key flows

- **Catálogo**: `/` muestra 12 destacados y `/disfraces` los 60, con filtro por categoría vía `?cat=` (valor inválido: se muestran todos). Las fotos de producto (FLUX, 4:5) viven en `public/catalogo/<slug>.jpg`; `pnpm catalog:prompts` imprime `slug<TAB>promptEn` para generarlas.

- **Buscar**: `FakeScraper` (form) → estado en el submit → log CSS escalonado → `findCostumes` + link real a MercadoLibre. Sin JS: GET `/buscar?q=`.
- **Ver disfraz**: `/disfraz/[slug]` (estático vía `generateStaticParams`) → "Ver publicación" (MercadoLibre) o DISFRAZATE → `/disfrazate?disfraz=<slug>`.

- **DISFRAZATE**: `/disfrazate` sin cookie `dz_event` muestra el form del código (Server Action `unlockEvent`, comparación en tiempo constante) → con acceso, `Probador`: elegir disfraz → foto (input con `capture` o `getUserMedia` en el click; resize en el cliente; consentimiento) → `POST /api/escenas` (4 escenas de 4 categorías, las menos usadas) → 4 × `POST /api/disfrazar` en paralelo (cada tarjeta se actualiza sola; "reintentar" y "otra escena" por tarjeta). El `Probador` se resetea al ocultarse la ruta: con `cacheComponents` Next la conserva en `<Activity hidden>`, así que un `useLayoutEffect` cleanup aborta los fetch en vuelo (`AbortController` en un ref) y despacha `reset` (vuelve a `elegir`, o a `foto` si la URL trae `?disfraz=`). La foto nunca se guarda ni se loguea. Errores JSON `{ error: { kind, message } }`: 401 sin acceso, 400 inválido, 429 tope de generaciones, 503 endpoint apagado, 504 timeout, 422 rechazada.

## External services

- AWS SageMaker (endpoint `disfrazate-flux`, FLUX.2 klein 4B; ADR 0002). Se cobra por hora prendido: `pnpm endpoint:up` / `endpoint:down`.
- MercadoLibre: solo links a búsquedas (`mercadoLibreUrl`), sin API.
- Wikimedia Commons: origen de las fotos de archivo (descargadas al repo).

## Env vars

Ver `.env.example`. Server-only, validadas con zod en `lib/env.server.ts`:

| Variable                                              | Default           | Nota                                        |
| ----------------------------------------------------- | ----------------- | ------------------------------------------- |
| `IMAGE_PROVIDER`                                      | `demo`            | `sagemaker` o `demo`                        |
| `APP_AWS_REGION`                                      | `us-east-1`       |                                             |
| `APP_AWS_ACCESS_KEY_ID` / `APP_AWS_SECRET_ACCESS_KEY` | -                 | obligatorias con `IMAGE_PROVIDER=sagemaker` |
| `SAGEMAKER_ENDPOINT`                                  | `disfrazate-flux` |                                             |
| `EVENT_CODE`                                          | -                 | sin él nadie entra al probador              |
| `MAX_GENERATIONS`                                     | sin tope          | tope de imágenes generadas                  |

## Deploy

Pendiente: Vercel (fase 4).
