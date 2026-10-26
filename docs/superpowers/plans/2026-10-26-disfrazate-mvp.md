# Disfrazate: plan de implementación (app + pitch para SIDEQUEST)

## Contexto

`Disfrazate` (repo `LorenGrz/Disfrazate`, Next.js 16 + Tailwind 4, armado con project-init, rama `dev`) es un proyecto para el evento **SIDEQUEST**.

**El chiste:**

- La app _dice_ que scrapea todas las tiendas del mundo buscando disfraces de Halloween. Es mentira: usa un catálogo propio, pero "Ver publicación" abre una búsqueda real en MercadoLibre.
- El botón **DISFRAZATE** toma una foto de cuerpo completo (subida o sacada con la cámara). Gemini (Nano Banana) te disfraza y te pone en **4 situaciones graciosas distintas**.
- Los resultados se pueden publicar en un **muro en vivo** para la pantalla del evento.
- Tan importante como la app es la **presentación .pptx de ~5 min, graciosa**.

**Decisiones ya tomadas con Loren:**

- Deploy en Vercel.
- Muro con opt-in, sobre Supabase (Storage + Realtime).
- Catálogo ficticio con links a búsquedas reales.
- Presentación en .pptx de ~10 slides.

**Encaje en el roadmap:** usa Next.js (etapa actual) y Supabase + WebSockets (Realtime, ya visto). No se mete en tecnologías de etapas posteriores.

## Hechos verificados que condicionan el diseño

**Modelo de imagen:** `gemini-nano-banana-2.1`.

- Soporta referencias de personajes y salida 1K/2K.
- Fallback: `gemini-3-pro-image` si la cara cambia demasiado.
- `gemini-2.5-flash-image` está dado de baja.
- El model ID va en la variable `GEMINI_IMAGE_MODEL`. Se verifica contra la doc al implementar.

**SDK:** `@google/genai` 2.31.x.

- La API nueva es Interactions: `ai.interactions.create` con `response_format: {type:"image"}`.
- `generateContent` + `inlineData` está marcado como legacy, pero funciona.
- Los tipos se verifican contra el `.d.ts` instalado.

**Costo:**

- Las imágenes **no tienen free tier**: la key de AI Studio necesita billing activo.
- A 1K son ~$0.034 por imagen, o sea ~$0.13 por participante con 4 imágenes. 100 personas ≈ US$14.

**Límites de Vercel:**

- El body de una función tiene ~4.5 MB máximo. Por eso la foto se reduce en el cliente a ~1280 px JPEG y se pide **una imagen por request**: 4 requests en paralelo, y el usuario ve aparecer las imágenes de a una.
- `maxDuration` del Route Handler: 60 s.

**Política de Google:** todas las imágenes llevan marca de agua SynthID. Se exige consentimiento sobre la foto; no se aceptan menores ni fotos de terceros.

**Reglas del repo (AGENTS.md):**

- Sin `useEffect`, `no-console`, jsx-a11y.
- zod en los bordes.
- `server-only` para la key.
- Sin `src/`. El alias `@/*` apunta a la raíz del repo.

## Paso 0: preparación

1. **Skill "good taste"** = `Leonxlnx/taste-skill` (skill `design-taste-frontend`, licencia MIT, trae scripts).
   - Antes de instalar leo su `SKILL.md`, `scripts/draw.mjs` e `inspect.mjs`.
   - Instalación como plugin, para que el `sync.sh` del hub no la toque. Loren corre `/plugin marketplace add Leonxlnx/taste-skill` y después `/plugin install taste-skill@taste-skill`.
   - Requiere Chrome o Chromium (verificar).
   - Se usa junto con `frontend-design`.
2. **PR pendiente en `disfrazate`:** traer el `guard-branch.sh` arreglado y el `gh-flow.sh` nuevo (CLICOLOR_FORCE y `--autostash`) desde el template.
3. **Plan en el repo:** copiar este plan a `docs/superpowers/plans/2026-10-26-disfrazate-mvp.md`.
4. **Issues:** crear las issues del Project con `gh-flow.sh issue`, una por fase.
5. **Credenciales que pone Loren:**
   - `GEMINI_API_KEY` con billing activo;
   - proyecto de Supabase (lo creo vía MCP con su OK);
   - cuenta de Vercel conectada a GitHub.

## Arquitectura

```
app/
  layout.tsx, globals.css        tema (de taste-skill), fuentes, metadata
  page.tsx                       landing: hero + "scraper" falso + catálogo (Server Component)
  disfraz/[slug]/page.tsx        detalle: tiendas falsas, "Ver publicación", botón DISFRAZATE
  disfrazate/page.tsx            flujo: foto → consentimiento → 4 escenas → descargar/muro
  disfrazate/_components/        PhotoPicker, SceneCard, ResultGrid ('use client', hojas)
  muro/page.tsx                  muro para la pantalla grande (Realtime, carrusel)
  api/disfrazar/route.ts         POST: {photo, costumeId, sceneId} → imagen (1 por request)
  api/escenas/route.ts           POST: asigna 4 escenas al participante
  actions/muro.ts                Server Action: publicar en el muro (zod)
  */loading.tsx, */error.tsx     por segmento, según AGENTS.md
lib/
  catalog.ts                     ~24 disfraces + tiendas falsas + mercadoLibreUrl(slug)
  scenes.ts                      48 escenas en 8 categorías + estilos visuales
  pick-scenes.ts                 elige 4 escenas de categorías distintas, priorizando las menos usadas (función pura)
  prompt.ts                      buildPrompt(costume, scene, style), función pura
  gemini.server.ts               cliente @google/genai ('server-only')
  supabase.server.ts / supabase.client.ts
  image.ts                       resize en el cliente (createImageBitmap + canvas, dentro del event handler)
supabase/migrations/             tablas wall_posts y scene_usage, RPC, RLS, bucket muro
proxy.ts (middleware)            portón con EVENT_CODE vía cookie, para que nadie gaste la key
```

**Decisiones de diseño:**

- **Foto:** `<input type="file" accept="image/*" capture="environment">` en vez de `getUserMedia`. Funciona en celulares, no necesita `useEffect` y es lo más robusto en un evento.
- **Endpoint de imágenes:** las imágenes salen de un Route Handler y no de una Server Action, por el tamaño del payload y para poder hacer 4 requests en paralelo. Esto se registra en ADR `0002`.
- **Privacidad:** la foto original **nunca se guarda**. Solo se sube al bucket `muro` la imagen generada que el usuario elige publicar.
- **Supabase:**
  - `wall_posts(id, created_at, image_path, costume_id, scene_id, caption)`: lectura pública vía RLS y escritura solo desde el server con la service role.
  - Realtime activado sobre `wall_posts`.
  - `scene_usage(scene_id, uses)` con la RPC `increment_scene_uses(ids text[])`.
- **Variables de entorno:**
  - `GEMINI_API_KEY`, `GEMINI_IMAGE_MODEL`, `SUPABASE_SERVICE_ROLE_KEY`, `EVENT_CODE` (solo server);
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (públicas);
  - se documentan en `.env.example`.

## Variedad de escenas: la recomendación central

**Mecánica:**

1. A cada participante le tocan **4 escenas de 4 categorías distintas**.
2. Dentro de cada categoría se elige la escena **menos usada globalmente** (contador en Supabase); los empates se desempatan al azar.
3. Si Supabase falla, se usa un shuffle local.
4. Cada escena se combina con un **estilo visual** al azar entre 6.

Así, 48 escenas × 6 estilos dan 288 combinaciones, y las primeras ~48 personas casi no repiten ambiente. Hay botón **"otra escena"** (cuesta 1 imagen más).

**Estilos:**

1. foto de celular con flash;
2. póster de película de los 80;
3. render 3D tipo animación;
4. cámara de seguridad en blanco y negro con timestamp;
5. óleo renacentista;
6. tapa de revista.

**Escenas** (con tono argentino y guiños tech para SIDEQUEST):

| Categoría         | Escenas                                                                                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Trámites          | fila del banco con el número 347 · sacando el DNI en el Registro · esperando el colectivo bajo la lluvia · discutiendo con el portero · pagando expensas · atendido por un chatbot en una ventanilla                           |
| Laburo tech       | daily en Zoom · deploy un viernes 18 h con el server en llamas · entrevista para Senior "con 15 años de experiencia en IA" · hackathon a las 4 am entre latas · pitch ante inversores dormidos · reunión que podía ser un mail |
| Argentina pura    | asado de domingo en la parrilla · ronda de mate en la plaza · subte en hora pico · tribuna de la cancha · playa llena en Mar del Plata en enero · kiosco 24 h a las 3 am                                                       |
| Cotidiano absurdo | supermercado chino · gimnasio haciendo sentadillas · clase de yoga · peluquería con ruleros · sillón del dentista · lavando los platos después de un almuerzo familiar                                                         |
| Épico / cine      | caminando en cámara lenta con una explosión atrás · tapa de disco de cumbia · alunizaje · llanto de telenovela · podio de Fórmula 1 · jefe final de videojuego                                                                 |
| Eventos sociales  | casamiento bailando el vals · cumpleaños infantil en el pelotero · graduación con toga · reunión de consorcio · fiesta de 15 · cena de Navidad con 40 °C                                                                       |
| Aventura          | cumbre del Aconcagua · kayak en el Delta · safari · paseador con 8 perros en Palermo · camping lleno de mosquitos · pescando en el muelle                                                                                      |
| Formatos          | foto de DNI · figura de acción en su blíster · estampilla postal · foto escolar con los compañeros de grado · cámara del ascensor · cuadro de museo con visitantes mirándolo                                                   |

**Plantilla del prompt** (vive en `lib/prompt.ts` y tiene tests):

> "Use the person from the reference photo. Keep their face, facial features, skin tone, body shape and identity completely unchanged. Dress them as {costume}. Scene: {scene}. Visual style: {style}. Full body visible, funny and wholesome, expressive pose, no text unless the scene requires it. Vertical 4:5."

## Fases y PRs (cada una con issue, rama y PR a `dev` vía gh-flow)

1. **feat/catalogo-scraper:**
   - aplicar el design system con taste-skill;
   - landing con "scraping" falso (animación con logs inventados, por ejemplo "Scrapeando 4.812.337 tiendas… ignorando Temu por razones legales");
   - grilla de ~24 disfraces y página de detalle con "Ver publicación" (búsqueda real en MercadoLibre);
   - tests de `catalog.ts`.
2. **feat/disfrazate:**
   - foto, resize y consentimiento;
   - endpoints `/api/escenas` y `/api/disfrazar`, `scenes.ts`, `pick-scenes.ts`, `prompt.ts` y `gemini.server.ts`;
   - grilla de resultados progresiva, descarga y "otra escena";
   - portón con `EVENT_CODE`;
   - ADR 0002;
   - tests de pick-scenes, del prompt y de los schemas zod.
3. **feat/muro:**
   - migración de Supabase (vía MCP, con confirmación);
   - Server Action para publicar;
   - `/muro` con Realtime y carrusel full-screen;
   - QR a la app.
4. **chore/deploy:** proyecto en Vercel conectado a GitHub, variables de entorno, preview de `dev` y producción desde `main` (`gh-flow release`).
5. **Presentación .pptx:** ver la sección siguiente.

Cada fase la implementa un `worker` con la spec y el comando de aceptación. Yo reviso cada PR y corro la verificación.

## Presentación (.pptx, ~10 slides, 5 min, skill `anthropic-skills:pptx`)

Tono: **pitch falso de startup**, con la estética de la app y notas de orador con los chistes y los tiempos.

1. **Portada:** "DISFRAZATE: el Google de los disfraces (Google no nos auspicia)".
2. **El problema:** 31/10, 22 h, sin disfraz. Estadística inventada: "el 87 % termina disfrazado de 'yo, pero cansado'".
3. **La solución:** "IA + scraping de TODAS las tiendas del universo conocido".
4. **Arquitectura:** dos columnas. A la izquierda, la que mostramos a inversores ("scraping cuántico distribuido"); a la derecha, la real ("un JSON con 24 disfraces").
5. **Demo en vivo:** QR y código del evento. Alguien del público aprieta DISFRAZATE.
6. **El botón:** antes y después.
7. **Galería:** el equipo en 4 situaciones absurdas, con imágenes reales generadas con la app.
8. **Modelo de negocio:** "monetizamos tu vergüenza" y métricas falsas (MAU: 3, incluida mi vieja).
9. **Roadmap:** "Q3 2027: scraping de verdad · Q4: disfrazar a tu jefe sin consentimiento (no, eso no; el legal dijo que no)".
10. **Cierre:** muro en vivo en pantalla y "¿Preguntas? No aceptamos".

Para las slides 6 y 7 Loren y el equipo tienen que pasar fotos de cuerpo completo, que se generan con la app ya deployada.

## Verificación

- **Por PR:**
  - `pnpm lint --max-warnings 0`, `pnpm typecheck`, `pnpm test`, `pnpm build`;
  - `verify-ci.sh` del skill sobre el HEAD;
  - CI en verde antes de `gh-flow merge`.
- **Tests unitarios (Vitest):**
  - `pickScenes`: 4 categorías distintas y prioridad a las menos usadas;
  - `buildPrompt`;
  - `mercadoLibreUrl`;
  - schemas zod de los endpoints.
- **Manual con key real:**
  - en el celu (cámara) y en el escritorio (upload): 4 imágenes distintas que conservan la cara;
  - publicar en el muro y verlo aparecer en `/muro`, en otra pestaña, sin recargar.
- **taste-skill:** `inspect.mjs` y screenshots en 3 anchos.
- **Vercel preview:** el flujo completo, revisando la latencia y que los payloads entren en 4.5 MB.
- **PPT:** renderizar las slides a imagen y revisarlas visualmente (lo pide el skill pptx) antes de entregar.
