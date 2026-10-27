# Disfrazate - Repository Context

<!-- Keep this file <= 60 lines: CLAUDE.md imports it into every session automatically. -->

## Purpose

App para el evento SIDEQUEST: "scrapea" (de mentira) tiendas buscando disfraces de Halloween, linkea a búsquedas reales de MercadoLibre y, con el botón DISFRAZATE, disfraza al usuario con IA en situaciones graciosas. Plan: `docs/superpowers/plans/2026-10-26-disfrazate-mvp.md`.

## Stack

Next.js 16 (App Router, `cacheComponents`), React 19, Tailwind 4, pnpm, Vitest. Fuente Archivo (`next/font`). Generación de imágenes: endpoint de SageMaker con FLUX.2 klein 4B (ADR 0002), `IMAGE_PROVIDER=demo` para desarrollar sin AWS. Validación con zod. Supabase (disfraces scrapeados) y Bedrock Nova Micro (texto).

## Commands

See AGENTS.md for the full table (dev/test/lint/typecheck/format/format:check).

## Architecture

- `lib/catalog.ts`: 60 disfraces en 8 categorías (`category`), tiendas falsas, `mercadoLibreUrl`, `findCostumes` (datos puros + tests). Fotos 4:5 en `public/catalogo/<slug>.jpg`; `pnpm catalog:prompts` lista los prompts.
- `app/page.tsx` landing (hero, buscador `FakeScraper`, drop con 12 destacados, "lo que decimos/hacemos", CTA); `app/disfraces` (60 disfraces, filtro `?cat=`), `app/disfraz/[slug]`, `app/buscar` (fallback sin JS), `app/disfrazate` (portón con `EVENT_CODE` + `Probador` con cámara, 4 escenas en paralelo; se resetea con un cleanup al ocultarse la ruta por `<Activity>`).
- `lib/*.server.ts` (env, proveedor de imágenes, portón, contadores en memoria), `lib/scenes.ts` + `pick-scenes.ts` + `prompt.ts`, `app/api/{escenas,disfrazar}`.
- `proxy.ts`: reescribe slugs inexistentes para que `/disfraz/<x>` devuelva 404 real (con `cacheComponents` + `loading.tsx` el `notFound()` llega con 200).
- Disfraces scrapeados: `POST /api/scrapear` (portón del evento, Nova Micro traduce/modera, foto con el mismo `ImageProvider`, persistencia en Supabase `custom_costumes` + bucket `catalogo`, slugs `s-…`; sin variables de Supabase responde 503). Lecturas con `'use cache'` + tag `custom-costumes`. ADR 0003.
- Detalle completo: `docs/architecture.md`.

## Conventions

See the stack conventions section in AGENTS.md for stack-specific rules.

## Known issues

- Las fotos de `public/catalogo/` se generan aparte con el endpoint; mientras no existan el tile muestra el campo de color con el alt.
- Vitest tiene `vitest.config.mts` con el alias `@/` y un stub de `server-only`; aun así `lib/` usa rutas relativas.
- Los contadores (escenas, generaciones) están en memoria: se reinician con el proceso y no se comparten entre instancias serverless hasta la fase 3 (Supabase).
- El `demoProvider` lee `public/demo/` con `fs`; en Vercel solo sirve para desarrollo.
- El endpoint de SageMaker cobra por hora: apagarlo con `pnpm endpoint:down` después del evento.
- La cámara de la compu (`getUserMedia`) necesita https o localhost; la UI no se probó en celulares reales.

## Repo facts

- Owner: LorenGrz
- Base branch: dev (main is release-only) — full git rules + where each is enforced: "Workflow contract" in AGENTS.md
- Project number: 2

Last validated: 2026-10-27
