# Revisión responsive — Disfrazate

## Context

Loren pidió una revisión a fondo del responsive antes del evento SIDEQUEST (se va a usar en celulares).
Auditoría hecha con chromium headless por CDP (script en scratchpad, no en el repo), en 320/375/414/768/1024/1440 px,
sobre `/`, `/disfraces`, `/disfraz/vampiro`, `/buscar?q=vampiro`, `/disfrazate` (portón + flujo completo
elegir → foto → resultado con `IMAGE_PROVIDER=demo` y un `EVENT_CODE` de prueba), `/terminos` y 404.

**Lo que está bien:** cero scroll horizontal en todas las rutas y anchos; la tipografía con `clamp` escala bien;
los formularios pasan a columna en mobile; el estudio de foto y el aside del probador se apilan bien;
el mega título del footer se recorta a propósito (`overflow-hidden`).

## Hallazgos y cambios (ordenados por impacto)

1. **Nav mobile sin catálogo** — `app/_components/SiteNav.tsx`: "El drop" y "Buscador" son `hidden sm:inline`;
   debajo de 640 px no hay forma de llegar a `/disfraces` desde el header (solo scrolleando la landing).
   → Mostrar "El drop" siempre (texto corto, entra al lado del logo y del botón en 320 px con `gap-4`);
   dejar "Buscador" solo desde `sm`. Verificar que en 320 px no desborde.

2. **Filtros de `/disfraces` ocupan ~370 px en mobile** — `app/disfraces/page.tsx`: 10 botones `.btn` con
   `flex-wrap` = 6 filas antes del primer disfraz en 375 px.
   → En mobile: una tira con scroll horizontal (`flex-nowrap overflow-x-auto` + `-mx-[var(--gutter)] px-[var(--gutter)]`,
   `snap-x`, sin barra) y `btn-small`; desde `md` vuelve a `flex-wrap` con `.btn` normal.

3. **Tabla de tiendas recortada en mobile** — `app/disfraz/[slug]/page.tsx`: `min-w-[40rem]` con `overflow-x-auto`;
   en 375 px la columna "Detalle" queda fuera y "Envío" cortada, sin indicio de que se puede deslizar.
   → Debajo de `md`, renderizar cada tienda como bloque apilado (nombre + precio en una fila, envío y detalle abajo)
   y dejar la `<table>` desde `md` (`hidden md:block` / `md:hidden`). Ambas con los mismos datos de `storesFor`.

4. **Detalle del disfraz: en mobile la foto ocupa toda la primera pantalla** y el nombre/CTAs quedan abajo del pliegue;
   en 768 px la foto de 480 px queda alineada a la izquierda con media pantalla vacía (las 2 columnas recién aparecen en `lg`).
   → Pasar el grid a `md:grid-cols-[minmax(0,22rem)_1fr]` y `lg:grid-cols-[minmax(0,30rem)_1fr]`;
   en mobile limitar la foto (`max-h-[60svh]` con `w-auto mx-auto` o `max-w-[20rem]`) para que el título asome.

5. **Hero en 320 px corta la "E"** — `app/globals.css` `--text-mega: clamp(4rem, 21.2vw, 26rem)`: el h1 mide 324 px
   en 320 px (con `overflow-hidden`). → Bajar a `20.6vw` (y el mínimo a `3.75rem`); comprobar que en 375–1440 sigue
   ocupando el ancho (footer usa el mismo token).

6. **Probador en mobile: espacio y largo** — `app/disfrazate/page.tsx` usa `py-20` (80 px arriba en un celu);
   resultado = 4 tarjetas en 1 columna (~2.300 px de scroll). → `py-10 md:py-20`; grid de resultados
   `sm:grid-cols-2` (en vez de `md:`) en `Probador.tsx`. En 1 columna dejarlo así en <640 px (las fotos son el producto).

7. **Hover pegajoso en touch** — `globals.css`: `.tile-link:hover .tile-media { scale(1.04) }` y `.press:hover`
   quedan aplicados tras un tap en iOS/Android. → Envolver los `:hover` en `@media (hover: hover)`.

8. **Áreas táctiles chicas** — logo del nav (112×22), links "El drop"/"Buscador" (27 px de alto), link "términos"
   del consentimiento (20 px). → `py-2`/`inline-block` en los links del nav y del logo para llegar a ~44 px de alto.
   (El checkbox de 24 px está dentro de un `<label>` grande: OK.)

### No se cambia (anotado)

- Cámara en celular real (`getUserMedia` pide 1920×1080 ideal, puede venir apaisado en portrait): no verificable sin
  dispositivo; queda en Known issues como está. Probar en el celu el día del evento.
- Animaciones `reveal` (scroll-driven) dejan secciones vacías en capturas full-page: es comportamiento de captura, no bug.

## Archivos

`app/_components/SiteNav.tsx`, `app/disfraces/page.tsx`, `app/disfraz/[slug]/page.tsx`, `app/globals.css`,
`app/disfrazate/page.tsx`, `app/disfrazate/_components/Probador.tsx`, `app/disfrazate/_components/PhotoStep.tsx` (link términos).
Sin cambios de arquitectura → no hace falta tocar AGENTS.md/architecture.md; copiar este plan a
`docs/superpowers/plans/2026-10-29-revision-responsive.md`.

## Flujo

`scripts/gh-flow.sh issue fix "Revisión responsive"` → `scripts/gh-flow.sh start fix <N>-responsive --issue N`
→ cambios (≤ 7 archivos, CSS/clases; inline) → verificación → `gh-flow.sh pr` → CI verde → `gh-flow.sh merge`.

## Verificación

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.
- Re-correr la auditoría CDP (scratchpad `audit.mjs` + `probador.mjs`) con `IMAGE_PROVIDER=demo EVENT_CODE=audit-test pnpm dev --port 3123`:
  esperado `scroll == viewport` en todo, h1 sin recorte en 320, y revisar capturas de 320/375/768 de
  `/disfraces` (filtros en 1 fila), `/disfraz/vampiro` (título visible en primer viewport, tabla apilada) y nav con "El drop".
- Además 740×360 (celu apaisado) para hero y estudio de foto.

## Resultado (implementado)

- Nav: en 320 px no entraban logo + "El drop" + CTA. "El drop" aparece desde 360 px (`min-[22.5rem]:inline`) y el CTA
  usa `.btn-compact` (más chico solo debajo de `sm`; las utilidades de Tailwind no pisan `.btn` porque está fuera de capa).
- Link "términos" del consentimiento: se dejó como está (link en línea dentro de texto, excepción de WCAG 2.5.8;
  `inline-block py-2` agrandaba la línea).
- Turbopack sirvió CSS viejo tras editar `globals.css`; hizo falta borrar `.next/dev` y reiniciar `pnpm dev`.
- Re-auditoría: 56 combinaciones ruta × ancho (320–1440 + 740 apaisado) sin scroll horizontal; h1 sin recorte en 320.
- Limitación: si la categoría activa está al final de la tira, en mobile queda fuera de vista hasta deslizar.
