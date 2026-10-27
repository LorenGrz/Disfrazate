# Handoff - Disfrazate

<!--
First file a new session reads after AGENTS.md when work is mid-flight. Update it whenever
work pauses mid-task - before stopping, not after (see AGENTS.md "Documentation rules").
Keep it current rather than complete: stale beats missing, but wrong is worse than either,
so replace sections instead of only appending to them.
-->

Last updated: 2026-10-27

## Current state

En producción (https://disfrazate.vercel.app):

- catálogo de 60 disfraces con fotos de producto;
- buscador con "Scrapear disfraz" (Nova Lite + FLUX + Supabase);
- probador DISFRAZATE con estudio de cámara (FLUX.2 klein en SageMaker);
- fotos de participantes guardadas en privado (con `/terminos`).

La **GPU está apagada** para no gastar créditos. El día del evento, Loren dice **"encendé la app"**: seguir [`docs/runbook-evento.md`](../runbook-evento.md).

## Active plan

Ninguno en curso. Último: [`2026-10-27-prompt-expresion-y-runbook.md`](../superpowers/plans/2026-10-27-prompt-expresion-y-runbook.md).

## Pending work

1. **Día del evento:** "encendé la app", que es `pnpm endpoint:up` y después `scripts/smoke-prod.sh` (runbook). Al terminar, "apagá la app".
2. **Antes de la demo (opcional):** borrar los disfraces de prueba de `custom_costumes` y del bucket `catalogo`: tostadora, alfajor de maicena, tostadora de pan y pantera rosa.
3. **Fase 3, muro en vivo:** usar la tabla `generations` y Supabase Realtime.
4. **Fase 5, presentación .pptx** (~10 slides, graciosa), con imágenes reales generadas del equipo.
5. **Dentro de los 30 días posteriores al evento:** borrar el bucket `participantes` y la tabla `generations` (lo prometen los términos).

## How to resume

1. Read `AGENTS.md`, then `.agents/CONTEXT.md`.
2. Read the active plan above (if any) and its spec in `docs/superpowers/specs/`.
3. Check `docs/decisions/` for any ADR relevant to the area you're about to touch.
4. Pick up "Pending work" from the top.
