# Fase 2b: flujo DISFRAZATE en la app (issue #5)

Spec para el worker. Depende de la fase 2a (`infra/sagemaker/`, endpoint `disfrazate-flux`). Plan madre: `2026-10-26-disfrazate-mvp.md`, cuyas secciones "Variedad de escenas" y "Arquitectura" siguen valiendo, salvo lo que cambia acá.

## Cambios respecto del plan madre

- **Proveedor de imágenes:** endpoint de SageMaker con FLUX.2 [klein] 4B, invocado con `@aws-sdk/client-sagemaker-runtime`. No usamos Gemini ni Bedrock.
- **Variables de entorno:** las `BEDROCK_*` se renombran (Vercel reserva `AWS_*`):

  | Variable                    | Default              |
  | --------------------------- | -------------------- |
  | `APP_AWS_REGION`            | `us-east-1`          |
  | `APP_AWS_ACCESS_KEY_ID`     | —                    |
  | `APP_AWS_SECRET_ACCESS_KEY` | —                    |
  | `SAGEMAKER_ENDPOINT`        | `disfrazate-flux`    |
  | `IMAGE_PROVIDER`            | `sagemaker` o `demo` |
  | `EVENT_CODE`                | —                    |
  | `MAX_GENERATIONS`           | —                    |

  Actualizar `.env.example` y `docs/architecture.md`. **No** tocar `.env.local`; lo migro yo.

- **Contador de escenas y de generaciones:** por ahora en memoria del proceso, detrás de una interfaz `UsageStore`. En la fase 3 pasa a Supabase.

## Server (`lib/`)

Todo módulo server lleva `import 'server-only'`.

- **`env.server.ts`:** lee y valida las variables con zod.
  - Si `IMAGE_PROVIDER=sagemaker` y faltan las keys, tira un error claro.
  - No exporta nada sensible al cliente.
- **`image-provider.server.ts`:**
  - `type ImageProvider = { generate(input: { photoJpegB64: string; prompt: string; seed?: number }): Promise<Result<{ jpegB64: string; seed: number; ms: number }, ProviderError>> }`, donde `Result` es una unión discriminada de AGENTS.md.
  - `sagemakerProvider`: `InvokeEndpointCommand` con `ContentType` `application/json` y body `{ image, prompt, width: 768, height: 960, steps: 4, seed }`, el contrato de `infra/sagemaker/code/inference.py`.
  - Mapeo de errores:
    - endpoint inexistente o apagado (ValidationException "Could not find endpoint") → `{ kind: "offline" }`;
    - timeout → `{ kind: "timeout" }`;
    - 4xx del modelo → `{ kind: "rejected", message }`.
  - `demoProvider`: devuelve una imagen de `public/demo/` (copiá 4 de `public/archivo/`) con un delay de 800 ms, para desarrollar sin AWS.
  - `getImageProvider()` elige según `IMAGE_PROVIDER`.
- **`scenes.ts`:** las 48 escenas en 8 categorías, tal cual la tabla del plan madre.
  - Cada escena tiene `id`, `category`, `label` (español, para la UI) y `prompt` (inglés, descriptivo, apto para el modelo).
  - Más los 6 estilos: `id`, `label`, `prompt`.
- **`pick-scenes.ts`:** `pickScenes(usage: Record<string, number>, rng: () => number, n = 4)`.
  - Elige n escenas de n categorías distintas.
  - En cada categoría, la de menor uso, con desempate por `rng`.
  - A cada escena le asigna un estilo al azar.
  - Es una función pura.
- **`prompt.ts`:** `buildPrompt({ costume, scene, style })`. Empezá con esta plantilla; la voy a ajustar con los resultados de las pruebas, así que mantenela en un solo lugar:

  > "Image editing. Keep the exact same person from the reference photo: same face, facial features, glasses, hairstyle, skin tone and body proportions. Dress this person in a complete {costume.promptEn} Halloween costume. Place them in this scene: {scene.prompt}. {style.prompt}. Full body visible, natural pose, funny but wholesome, high detail."

  Agregá `promptEn` a cada `Costume` en `lib/catalog.ts`: una descripción visual corta en inglés del disfraz.

- **`usage-store.server.ts`:** interfaz `UsageStore` con `getSceneUsage()`, `incrementScenes(ids)`, `tryConsumeGeneration(): boolean` (respeta `MAX_GENERATIONS`) y `generationsLeft()`. Implementación en memoria.
- **`event-gate.server.ts`:** cookie httpOnly `dz_event` con un HMAC del `EVENT_CODE`. Usa `crypto.createHmac` con una clave derivada del mismo code; no guarda el code en claro. Exporta `hasEventAccess()`.

## Rutas

- **`app/disfrazate/actions.ts`:** Server Action `unlockEvent(formData)`.
  - Valida con zod y compara en tiempo constante.
  - Setea la cookie (30 días, `sameSite: lax`, `secure` en producción).
  - Redirige a `/disfrazate`, conservando `?disfraz`.
- **`POST app/api/escenas/route.ts`:**
  - Requiere el acceso del evento (401 si no lo tiene).
  - Body `{ costumeSlug }` (zod; 400 si el slug no existe).
  - Responde `{ scenes: [{ id, label, styleId, styleLabel }] }` y aplica `incrementScenes`.
- **`POST app/api/disfrazar/route.ts`:**
  - `export const maxDuration = 60`.
  - Requiere el acceso del evento.
  - Body `{ photo: string (base64 JPEG, sin el prefijo data:, ≤ 1.5 MB decodificado), costumeSlug, sceneId, styleId }`, validado con zod.
  - Llama a `tryConsumeGeneration()`; si devuelve false, responde 429 con un mensaje gracioso ("Se nos acabaron los disfraces por hoy").
  - Después `buildPrompt` y `provider.generate`.
  - Responde 200 con `{ image: "data:image/jpeg;base64,...", seed }`.
  - Errores: `offline` → 503 ("El probador está apagado"), `timeout` → 504, `rejected` → 422. Siempre JSON `{ error: { kind, message } }`.
  - **Nunca** loguea ni guarda la foto.
- **`app/disfrazate/page.tsx`:** Server Component.
  - Sin acceso: muestra el form del código, con la Server Action.
  - Con acceso: renderiza `<Probador costume={...} costumes={...} />`. Lee `searchParams.disfraz`; si no viene, el usuario elige en el probador.

## Cliente (`app/disfrazate/_components/`, `'use client'` solo en las hojas)

**Nada de `useEffect`.** Cada efecto ocurre dentro de su event handler o de un ref callback.

**`Probador.tsx`:** una máquina de estados con `useReducer`. Los estados son `elegir` → `foto` → `generando` → `resultado`, más `error`.

- **Elegir disfraz:** grilla compacta, o la preselección que viene por URL.
- **Foto**, con dos caminos:
  1. `<input type="file" accept="image/*" capture="user">`, etiquetado "Sacate una foto". En el celular abre la cámara frontal directo; en desktop abre el selector de archivos.
  2. Botón "Usar la cámara de la compu", que llama a `navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })` **en el click**.
     - El stream se asigna a un `<video>` con un ref callback.
     - El botón "Sacar foto" dibuja el frame en un canvas y detiene los tracks en ese mismo handler.
     - Otro botón cancela y también detiene los tracks.
     - Si `getUserMedia` falla o no existe, se esconde este camino y se muestra un mensaje.
     - Hace falta un contexto seguro: localhost o https.
  - **Preview** de la foto, con un tip: "Cuerpo entero, de frente, con buena luz".
  - **Checkbox obligatorio de consentimiento:** "Esta foto es mía (o tengo permiso), soy mayor de 13 años y entiendo que no se guarda" (texto final a revisar).
- **Resize en el cliente:** `lib/image.ts`, una función pura más el helper de canvas.
  - `createImageBitmap(file, { imageOrientation: "from-image" })`.
  - Lado mayor 1024 y JPEG con calidad 0.85 vía `canvas.toBlob`.
  - Base64 sin el prefijo.
  - Se ejecuta en el handler del input o de la captura.
- **Generar:**
  1. POST `/api/escenas`.
  2. Después 4 POST `/api/disfrazar` **en paralelo**. Cada tarjeta muestra su estado (generando, lista o error con "reintentar") y se actualiza apenas llega su respuesta.
  - Mientras genera, se muestra el log falso estilo scraper ("Midiendo tu aura…", "Negociando con el vampiro…").
- **Resultado:** grilla de 4 tarjetas con la imagen y la etiqueta de la escena.
  - "Descargar" (link `download`).
  - "Otra escena": pide 1 escena nueva y regenera esa tarjeta.
  - "Probar otro disfraz".
- **Diseño:** el mismo sistema de la fase 1 (tokens, Archivo y las reglas de la casa de `2026-10-26-fase-1-catalogo.md`). Las 4 imágenes van grandes, con relación 4:5 y esquinas rectas. En el celular, una columna.
- **Accesibilidad:** foco visible, cada estado anunciado con `aria-live` y botones con nombre accesible.

## Docs

- ADR `docs/decisions/0002-generacion-de-imagenes-sagemaker-flux.md`, a partir de `0000-template.md`. Registra por qué SageMaker con FLUX.2 klein 4B y no Gemini (prepago de US$30), Nova Canvas (dado de baja) ni Stability en Bedrock (Marketplace). También el trade-off: se cobra por hora mientras el endpoint está prendido y hay que apagarlo.
- `docs/architecture.md`: flujo DISFRAZATE, variables de entorno y el proveedor.
- `.agents/CONTEXT.md`: actualizar el stack y los known issues.

## Tests (Vitest)

- `pickScenes`:
  - 4 categorías distintas;
  - prioridad a las menos usadas;
  - determinista con un rng fijo.
- `buildPrompt` incluye el disfraz, la escena y el estilo.
- Schemas zod de los dos endpoints: casos válidos e inválidos (slug inexistente, foto demasiado grande).
- `demoProvider` devuelve `ok`.
- Helper puro de `lib/image.ts` (el cálculo de dimensiones).

## Aceptación

```
pnpm lint --max-warnings 0 && pnpm typecheck && pnpm test && pnpm build
```

Además, con `IMAGE_PROVIDER=demo EVENT_CODE=test pnpm start`:

- `/disfrazate` sin cookie muestra el form del código;
- POST `/api/disfrazar` sin cookie → 401;
- con cookie, un POST válido → 200 (`demo`).

El worker commitea en la rama con un Conventional Commit, sin pushear. **No** llama a AWS.
