# Correcciones antes de la demo

## Contexto

- **Producción:** https://disfrazate.vercel.app. Vercel está conectado a GitHub (prod = `main`), las variables de entorno están cargadas y el release #7 está mergeado.
- **Endpoint:** `disfrazate-flux` (g5) está **prendido**, a ~US$1,41/h. Ya genera bien: Loren probó el flujo con el disfraz de pancho.
- Feedback de Loren después de probar el deploy:
  1. **Imágenes graciosas pero realistas, no dibujos.** Varios estilos y escenas salen como ilustración: render 3D, óleo, estampilla, figura en blíster.
  2. **Desktop:** las imágenes son enormes. El resultado va en 2 columnas de ~900 px con relación 4:5, y cada imagen es más alta que la pantalla. Los tiles del catálogo también son grandes.
  3. **Muchos más disfraces:** hoy hay 24.
  4. **Volvés al buscador, apretás DISFRAZATE y aparecen las imágenes generadas antes.** Causa: con `cacheComponents`, Next 16 preserva las rutas con `<Activity mode="hidden">` en vez de desmontarlas (`node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md`, "UI state preservation"). El `useReducer` del `Probador` sobrevive a la navegación.
  5. **Catálogo:** fotos tipo publicación de tienda, generadas con FLUX y realistas.
  6. **Tiendas scrapeadas:** números realistas, entre 12 y 340.
  7. **504 en la primera prueba:** InService no significa listo, porque el primer worker de TorchServe no terminó de cargar el modelo y se reinició. El endpoint ya responde en 4,2 s; lo que falta es el fix en `deploy.sh`.

## 1. Código de la app (worker, en `fix/<issue>-correcciones-demo`)

### Realismo (`lib/scenes.ts`, `lib/prompt.ts`)

- **Estilos:** los 6 tienen que ser fotográficos.
  - `render-3d` pasa a `celular-flash-fiesta` ("candid smartphone party photo, direct flash").
  - `oleo` pasa a `fotografo-evento` ("professional event photographer photo, 35mm, natural colors").
  - `poster-80s` pasa a "1980s film photograph, film grain, real people", con `label` "Foto de los 80".
  - Se quedan `flash`, `camara-seguridad` y `editorial`, todos fotográficos.
- **Escenas:** se revisan las 48 y se reemplazan las que inducen ilustración (estampilla postal, figura de acción en blíster, cuadro de museo y cualquier otra no fotográfica) por situaciones reales y graciosas: por ejemplo foto carnet en la cabina de la estación, cámara de fotomulta, foto de la jura de la bandera.
  - Se mantienen 8 categorías × 6.
- **`buildPrompt`:** agregar "Photorealistic real-life photograph of a real person, not an illustration, not a cartoon, not a 3D render, not a painting."
  - El test de `buildPrompt` verifica que el texto esté.
- **Expresión facial (feedback de Loren):** el modelo cambiaba la expresión. Por ejemplo, una foto con piquito salía con sonrisa en las 4 imágenes, y quedaba raro.
  - El prompt exige "Keep the exact same facial expression and mouth shape as in the reference photo (if they pout, keep the pout; if serious, keep serious); do not add or change smiles."
  - Se saca "funny but wholesome" y cualquier cosa que sugiera sonreír: lo gracioso lo pone la situación, no la cara. La pose puede cambiar; la expresión, no.
  - Test: el prompt contiene "same facial expression".

### Más disfraces (`lib/catalog.ts`)

- **De 24 a 60 disfraces**, con el campo nuevo `category`. Categorías:
  - terror clásico;
  - criaturas;
  - comida (pancho, banana, choripán, empanada, medialuna, mate…);
  - oficios (bombero, médico, chef, astronauta…);
  - animales;
  - personajes genéricos (pirata, ninja, superhéroe genérico, princesa, cowboy…);
  - argentinidad (gaucho, hincha, colectivero, abuela con ruleros…);
  - absurdos (cono de tránsito, inodoro, wifi caído…).
- Nada de marcas ni personajes con copyright.
- Cada uno lleva `promptEn`, un precio absurdo y `storesScraped` entre **12 y 340** (variado, no redondo).
- Cada uno lleva `photo: { src: "/catalogo/<slug>.jpg", alt: "<Nombre>: foto ilustrativa" }`.
- El campo `image` (archivo) sale del catálogo. Las fotos de archivo siguen en la landing; los créditos del footer quedan solo para las que se usan (`rg "/archivo/"`).
- **Exportar `scripts/catalog-prompts.mjs`** (o un `pnpm tsx` equivalente) que imprima `slug<TAB>promptEn` por línea, para el generador de fotos.

### Tamaños en desktop

- **Resultados del probador** (`Probador.tsx` / `ResultCard.tsx`): 1 columna en mobile, 2 en `md` y **4 en `lg`**. Cada imagen 4:5 queda de ~440 × 550 px en 1920 y entra entera en la pantalla junto con su etiqueta.
- **Catálogo:**
  - Grilla uniforme 4:5 (sin el tile doble), con `object-cover` a sangre sobre el campo de color.
  - Columnas: 2 en mobile, 3 en `md`, **5 en `lg` y 6 en `xl`**.
  - La landing ("El drop") muestra 12 destacados y un link a la nueva `/disfraces`.
- **Nueva ruta `app/disfraces/page.tsx`:**
  - los 60 disfraces, con filtro por categoría como links `?cat=`;
  - Server Component, con `loading.tsx` y `error.tsx`, y metadata.
  - "El drop" del nav apunta a `/disfraces`.
- **Detalle `/disfraz/[slug]`:** foto 4:5 de ancho máximo ~480 px junto a la tabla en desktop, no a pantalla completa.
- **Elegir disfraz en el probador:** con 60 opciones, un input de filtro (`findCostumes`) sobre una grilla compacta de miniaturas chicas.

### Estado viejo al volver (`Probador.tsx`)

- Siguiendo la recomendación de la doc de Next, reset explícito al ocultarse la ruta: `useLayoutEffect(() => () => { abortar requests en vuelo; dispatch({ type: "reset" }) }, [])`.
  - Es sincronización con el ciclo de vida de `<Activity>`, el caso permitido. Si una regla de ESLint lo bloquea, `eslint-disable-next-line` con el motivo.
  - Las requests en vuelo usan un `AbortController` guardado en un ref.
- Test: el reducer vuelve a `elegir` (o a `foto` con la preselección de la URL) cuando recibe `reset`.

### Tiendas realistas

- `Ticker.tsx` y `not-found.tsx` pasan de "4.812.337 tiendas" a "1.284 tiendas".
- Las exageraciones de "Lo que decimos" se quedan, porque son el chiste.

### Tests

- 60 slugs únicos.
- Cada disfraz tiene su `public/catalogo/<slug>.jpg`. Este test se agrega cuando estén las fotos: lo agrego yo después de generarlas.
- `storesScraped` entre 12 y 340.
- El prompt incluye la cláusula de realismo.
- Reset del reducer.

### Aceptación

```
pnpm lint --max-warnings 0 && pnpm typecheck && pnpm test && pnpm build
```

## 2. Fotos de producto (yo, con el endpoint prendido)

- **Script `infra/sagemaker/gen-catalog.sh`:** recorre la salida de `catalog-prompts`.
  - Referencia neutra: fondo gris liso de 768x960 hecho con `magick`. `seed` fijo por slug.
  - Prompt: "E-commerce product listing photo, photorealistic. A real adult model wearing a complete {promptEn} Halloween costume, full body, standing, plain light grey studio background, soft even lighting. Do not render any text, logos or watermarks."
  - Salida: `public/catalogo/<slug>.jpg` en JPEG q82.
- 60 fotos × ~4,5 s ≈ 5 minutos. Primero pruebo con 2.
- Hoja de contacto con `magick montage`. Regenero con otro seed las que salgan dibujadas, con texto o deformes.

## 3. Arranque del endpoint (`infra/sagemaker/deploy.sh`)

- **En `up`, después de InService:** loop de calentado. Invoca con una imagen gris de 512x512 y `steps: 1` hasta recibir un 200 (70 s por intento, 15 minutos como máximo). Recién ahí imprime "listo para usar"; si falla, muestra los logs y sale con error.
- Agregar `TS_DEFAULT_STARTUP_TIMEOUT=900` al modelo. Se aplica en el próximo `up`; no redeployo ahora.
- Actualizar el README de infra.

## 4. Integración y verificación

1. Issue `fix` + `gh-flow start`. Copiar este plan a `docs/superpowers/plans/2026-10-27-correcciones-demo.md`.
2. El worker implementa la sección 1. Mientras tanto hago el fix de la sección 3, y cuando está la lista de 60, genero las fotos de la sección 2.
3. Reviso el diff y agrego el test de fotos.
4. PR a `dev`, CI en verde, merge, release a `main` y deploy en prod.
5. **Verificación en prod:**
   - screenshots a 1920 y 390 de la landing, `/disfraces`, el detalle y el resultado del probador;
   - e2e (`scratchpad/e2e-prod.mjs`) con 4 imágenes 200 y fotográficas;
   - ir al buscador, volver a DISFRAZATE y verificar que el probador arranca limpio;
   - te paso las capturas.
6. Actualizar `.agents/CONTEXT.md` y `docs/architecture.md` (`/disfraces`, categorías, reset por Activity).
7. **Endpoint:** prendido hasta que termines de probar; lo bajo cuando me digas. Todo esto cabe en ~1 a 1,5 h, o sea ~US$2 de créditos.
