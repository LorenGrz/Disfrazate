# Architecture - Disfrazate

## Overview

Next.js 16 server-rendered. La landing y el catálogo son Server Components sobre datos estáticos (`lib/catalog.ts`); el único componente cliente es el buscador (`app/_components/FakeScraper.tsx`), cuyo "scraping" es un log animado por CSS. Fase 2 suma la generación de imágenes (AWS Bedrock) vía Route Handlers; fase 3 el muro (Supabase Realtime).

## Modules / boundaries

| Módulo             | Responsabilidad                                                           |
| ------------------ | ------------------------------------------------------------------------- |
| `lib/catalog.ts`   | Disfraces, tiendas falsas, búsqueda y URL de MercadoLibre. Puro, sin I/O. |
| `lib/credits.ts`   | Créditos de las fotos de archivo (`public/archivo/`, Wikimedia Commons).  |
| `app/_components/` | UI compartida; solo `FakeScraper` es `'use client'`.                      |
| `proxy.ts`         | 404 real para slugs de disfraz inexistentes.                              |

## Data model

Sin base de datos todavía. Tipo `Costume` en `lib/catalog.ts`.

## Key flows

- **Buscar**: `FakeScraper` (form) → estado en el submit → log CSS escalonado → `findCostumes` + link real a MercadoLibre. Sin JS: GET `/buscar?q=`.
- **Ver disfraz**: `/disfraz/[slug]` (estático vía `generateStaticParams`) → "Ver publicación" (MercadoLibre) o DISFRAZATE → `/disfrazate?disfraz=<slug>`.

## External services

- MercadoLibre: solo links a búsquedas (`mercadoLibreUrl`), sin API.
- Wikimedia Commons: origen de las fotos de archivo (descargadas al repo).

## Env vars

Ninguna en fase 1.

## Deploy

Pendiente: Vercel (fase 4).
