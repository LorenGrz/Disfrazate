# 0003. Disfraces scrapeados: Supabase para persistir y Nova Lite para traducir y moderar

## Status

Accepted

## Date

2026-10-27

## Context

Si alguien busca un disfraz que no está en el catálogo, la app tiene que poder "scrapearlo": crear el disfraz, generar su foto de producto y dejarlo disponible en el catálogo y en DISFRAZATE. Cada scrapeo gasta GPU y el texto lo escribe el usuario, así que hace falta persistencia, control de acceso, traducción a un prompt útil y moderación. Plan: `docs/superpowers/plans/2026-10-27-scrapear-disfraz.md`.

## Decision

- **Persistencia en Supabase** (proyecto `disfrazate`): tabla `custom_costumes` con lectura pública por RLS y escritura solo con la secret key, y bucket público `catalogo` (JPEG, 1 MB). Es la misma base que va a usar el muro de la fase 3.
- **Amazon Nova Lite en Bedrock** (Converse API) convierte el texto en español en un nombre, una descripción visual en inglés y un chiste, y decide si el pedido está permitido. No usamos un diccionario: el nombre en español no sirve como prompt (FLUX hace un disfraz genérico) y un diccionario no cubre pedidos libres ni moderación.
- **Acceso** con el código del evento (cookie `dz_event`), tope de `MAX_CUSTOM_COSTUMES` (100) y tope global de generaciones.
- **Foto** con el mismo `ImageProvider` y el prompt de producto (`buildProductPrompt`), igual a las 60 del catálogo.
- **Cache**: lecturas con `'use cache'` + `cacheTag('custom-costumes')` + `cacheLife('minutes')`; después de insertar, `revalidateTag('custom-costumes', { expire: 0 })` porque `updateTag` solo funciona en Server Actions.

## Alternatives considered

- **Guardar en disco o en memoria** — se pierde entre instancias serverless y reinicios.
- **Diccionario de traducciones** — no escala ni modera.
- **Usar el nombre en español como prompt** — probado: FLUX devuelve un disfraz genérico.
- **Moderación con una lista de palabras** — fácil de esquivar y deja pasar descripciones indirectas.

## Consequences

- La moderación automática con un LLM puede fallar (dejar pasar algo o rechazar de más). Se mitiga con el código del evento (solo asistentes), el tope de 100 disfraces y el borrado manual desde el dashboard de Supabase.
- El texto del usuario va dentro de `<query>` y se trata como dato; además hay un pre-filtro local (2 a 40 caracteres, letras, números, espacios y `-'.`) y la salida del modelo se valida con zod.
- Sin variables de Supabase el scrapeo responde 503 y el resto de la app funciona igual; el build no las necesita.
- Un slug scrapeado inexistente devuelve 200 con la página de no encontrado (el proxy no consulta Supabase).
- Cada scrapeo consume una generación de SageMaker y una llamada a Bedrock.

## Nota (2026-10-27): Micro → Lite

Probado con nombres reales: Nova Micro describía mal objetos argentinos (el alfajor salía como una torta con chispitas) y rechazaba personajes con marca en vez de hacerlos genéricos. Nova Lite, con reglas explícitas ("objetos, comida y vehículos siempre permitidos", `promptEn` siempre en inglés) y tres ejemplos en el system prompt, acierta y sigue bloqueando personas reales, drogas y contenido sexual. El costo por llamada sigue siendo de fracciones de centavo.
