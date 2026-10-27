# Prompt sin expresiones concretas + runbook del evento (issue #17)

## Pedido de Loren

> ahora siempre hace piquito creo, corregí el prompt, lo del piquito era un ejemplo ahora sonreí y hace piquito siempre

> cuando termines subilo a prod y apagá la gpu así no me gasta créditos, y el día del evento quiero que guardes la instrucción que sea "encendé la app", para que se prenda el día del evento cuando te diga en otra sesión, guardá todos los prompts en docs y planes en docs como siempre

## Decisiones

- **`buildPrompt`:** se reemplaza "(if they pout, keep the pout; if serious, keep serious), do not add or change smiles" por "and the same facial expression as in the reference photo".
  - Probado con la misma semilla en una foto sonriendo y una seria: cada una conserva su expresión.
  - El test prohíbe `pout|smil|laugh|grin` en el prompt.
- **`docs/prompts.md`:** todos los prompts (FLUX participante, FLUX producto, Nova namer) con su historia y lecciones. Se actualiza en el mismo PR que cualquier cambio de prompt (`AGENTS.md`, mapa de docs).
- **`docs/runbook-evento.md`:** qué hacer con "encendé la app" y "apagá la app".
- **`scripts/smoke-prod.sh`:** prueba de humo de punta a punta contra producción (1 generación real), parte del runbook.
- `HANDOFF.md` al día. GPU apagada al terminar.

## Verificación

- `pnpm lint --max-warnings 0 && pnpm typecheck && pnpm test && pnpm build`.
- `EVENT_CODE=sidequest bash scripts/smoke-prod.sh` → "Todo OK" (corrido con el endpoint prendido).
- Después del deploy: `pnpm endpoint:down` y `pnpm endpoint:status` → "no existe (no cobra)".
