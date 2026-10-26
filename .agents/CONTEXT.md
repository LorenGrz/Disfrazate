# Disfrazate - Repository Context

<!-- Keep this file <= 60 lines: CLAUDE.md imports it into every session automatically. -->

## Purpose

App para el evento SIDEQUEST: "scrapea" (de mentira) tiendas buscando disfraces de Halloween, linkea a búsquedas reales de MercadoLibre y, con el botón DISFRAZATE, disfraza al usuario con IA en situaciones graciosas. Plan: `docs/superpowers/plans/2026-10-26-disfrazate-mvp.md`.

## Stack

Next.js 16 (App Router, `cacheComponents`), React 19, Tailwind 4, pnpm, Vitest. Fuente Archivo (`next/font`). Generación de imágenes: AWS Bedrock Nova Canvas (fase 2, pendiente).

## Commands

See AGENTS.md for the full table (dev/test/lint/typecheck/format/format:check).

## Architecture

- `lib/catalog.ts`: 24 disfraces, tiendas falsas, `mercadoLibreUrl`, `findCostumes` (datos puros + tests).
- `app/page.tsx` landing (hero, buscador `FakeScraper`, drop, "lo que decimos/hacemos", CTA); `app/disfraz/[slug]`, `app/buscar` (fallback sin JS), `app/disfrazate` (stub hasta fase 2).
- `proxy.ts`: reescribe slugs inexistentes para que `/disfraz/<x>` devuelva 404 real (con `cacheComponents` + `loading.tsx` el `notFound()` llega con 200).
- Detalle completo: `docs/architecture.md`.

## Conventions

See the stack conventions section in AGENTS.md for stack-specific rules.

## Known issues

- Los tiles del catálogo sin foto muestran solo el nombre; en fase 2 se reemplazan por las imágenes de referencia de cada disfraz.
- Vitest no tiene alias `@/`: tests e imports de `lib/` usan rutas relativas.

## Repo facts

- Owner: LorenGrz
- Base branch: dev (main is release-only) — full git rules + where each is enforced: "Workflow contract" in AGENTS.md
- Project number: 2

Last validated: 2026-10-26
