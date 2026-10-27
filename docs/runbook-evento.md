# Runbook del evento SIDEQUEST

Qué hacer cuando Loren dice **"encendé la app"** (prender) o **"apagá la app"** (apagar). La web en Vercel está siempre arriba; lo que se prende y se apaga es la **GPU** (el endpoint de SageMaker `disfrazate-flux`), que es lo único que cobra por hora (~US$1,41/h, sale de los créditos de AWS).

- Producción: https://disfrazate.vercel.app
- Código del evento: está en `EVENT_CODE` (Vercel y `.env.local`). Hoy es `sidequest`.
- Proyecto de Supabase: `disfrazate` (ref `qshltvhswxzkotyqwmsu`).

## "Encendé la app"

Desde la raíz del repo, con el perfil de AWS `disfrazate-deploy` configurado:

1. **Estado actual:** `pnpm endpoint:status`.
   - Si dice `InService`, pasá directo al paso 3.
   - Si dice `no existe (no cobra)`, seguí con el paso 2.
2. **Prender la GPU:** `pnpm endpoint:up`.
   - Tarda **10 a 20 minutos**: descarga la imagen y los pesos, y después calienta el modelo.
   - **Esperá el mensaje "listo para usar"**, no el "InService". InService llega antes de que el modelo haya cargado; si se prueba en ese momento, la app da 504.
   - Si falla con `InsufficientInstanceCapacity` en g5, probá con `INSTANCE_TYPE=ml.g6.xlarge pnpm endpoint:up` (la cuota permite 1 de cada una). Si fallan las dos, esperá unos minutos y reintentá.
   - Si falla por otra cosa: `pnpm endpoint:logs`, y recordá **apagar** con `pnpm endpoint:down` para no pagar un endpoint roto.
3. **Prueba de humo contra producción:** `EVENT_CODE=sidequest bash scripts/smoke-prod.sh`.
   - Tiene que terminar en "Todo OK".
   - Genera 1 imagen real, con la foto de producto del pancho como persona.
4. **Avisarle a Loren:**
   - que la app está lista;
   - la hora de encendido;
   - el costo por hora;
   - el recordatorio de decir "apagá la app" al terminar.

Opcional antes del evento:

- revisar los créditos de AWS que quedan (Billing → Credits);
- borrar los disfraces de prueba de `custom_costumes` (y sus fotos del bucket `catalogo`).

## "Apagá la app"

1. `pnpm endpoint:down`. Borra el endpoint, las configs y los models, y deja el bucket y el rol.
2. Confirmar con `pnpm endpoint:status`: tiene que decir `no existe (no cobra)`.
3. Avisarle a Loren cuánto tiempo estuvo prendida (≈ US$1,41 por hora).

Con la GPU apagada, la web sigue andando: el catálogo y el buscador funcionan. DISFRAZATE y "Scrapear" responden "El probador está apagado" / "El fotógrafo está apagado".

## Después del evento

- **Dentro de los 30 días** (lo prometen los `/terminos`):
  - borrar las fotos del bucket privado `participantes`;
  - vaciar la tabla `generations`.
- Si no se van a usar más, borrar también los disfraces scrapeados.
