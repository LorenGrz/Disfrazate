# 0004. Guardar las fotos de los participantes y sus resultados

## Status

Accepted

## Date

2026-10-27

## Context

El plan original decía que la foto del usuario nunca se guardaba. Queremos conservar las fotos y las imágenes generadas para mostrarlas en el evento y en la presentación de SIDEQUEST, y para mejorar la app. Son fotos de caras de personas: dato personal sensible.

## Decision

- Después de cada generación exitosa, `POST /api/disfrazar` agenda con `after()` (`next/server`) `saveGeneration` (`lib/participant-photos.server.ts`): la respuesta no espera al guardado.
- Bucket privado `participantes` (JPEG, 2 MB) con `<sha256 de la foto>/original.jpg` y `<sha256>/<escena>-<estilo>-<seed>.jpg`; el hash hace idempotente el upload de las 4 requests paralelas con la misma foto. Una fila por imagen en `public.generations`.
- RLS activo sin políticas: solo la secret key del servidor lee y escribe.
- El consentimiento y las condiciones están en `/terminos`; el checkbox del Probador enlaza ahí.
- Solo mayores de 18 o con permiso de un adulto responsable; fotos propias o con permiso.
- Borrado dentro de los 30 días posteriores al evento, y a pedido a los organizadores.

## Alternatives considered

- **No guardar nada** — es lo más privado, pero perdemos los resultados para la presentación.
- **Guardar solo la imagen generada** — menos sensible, pero igual contiene la cara del participante y no resuelve el pedido de borrado por foto.
- **Bucket público** — más simple para mostrar, pero expone caras a cualquiera con el link.

## Consequences

- Privacidad vs. conservar los resultados: aceptamos guardar a cambio de bucket privado, RLS, consentimiento explícito, 18+ y borrado a los 30 días.
- El borrado a 30 días es manual (dashboard de Supabase o SQL + Storage); no hay job automático.
- Si Supabase falla o no está configurado, la generación sigue funcionando: `saveGeneration` nunca lanza y solo loguea un error corto, sin datos de la imagen.
- Los datos viajan a AWS (EE.UU.), Supabase y Vercel; están listados en `/terminos`.
