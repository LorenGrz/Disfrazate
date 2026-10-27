# Endpoint de SageMaker (FLUX.2 [klein] 4B)

Endpoint propio `disfrazate-flux` para generar los disfraces. Modelo `black-forest-labs/FLUX.2-klein-4B` (Apache 2.0) sobre el DLC de PyTorch 2.6, en una instancia `ml.g5.xlarge` (GPU A10G 24 GB).

## Advertencia de costo

**Mientras el endpoint existe cobra US$1,408 por hora, lo uses o no.** Prendelo solo para pruebas y para el evento, y **apagalo siempre después de usar**:

```bash
pnpm endpoint:down
```

Con los US$129 de créditos alcanza para unas 114 horas de endpoint prendido.

## Comandos

Usan el perfil `disfrazate-deploy` (overrideable con `AWS_PROFILE`), cuenta `493735739644`, región `us-east-1`.

| Comando                | Qué hace                                                                          |
| ---------------------- | --------------------------------------------------------------------------------- |
| `pnpm endpoint:up`     | Crea bucket y rol si faltan, sube el código, crea modelo + config + endpoint.     |
| `pnpm endpoint:down`   | Borra endpoint, endpoint-configs y models `disfrazate-flux-*`. Deja bucket y rol. |
| `pnpm endpoint:status` | Estado del endpoint, o "no existe (no cobra)".                                    |
| `pnpm endpoint:logs`   | Últimos 100 eventos de CloudWatch del endpoint.                                   |

`up` tarda entre 10 y 20 minutos (descarga de la imagen y de los pesos). Es idempotente: si el endpoint ya existe, lo actualiza.

**Esperá el mensaje "listo para usar", no el InService.** SageMaker marca el endpoint InService antes de que TorchServe termine de cargar el modelo; el 2026-10-27 el primer worker se reinició y las primeras requests quedaron 90 s en cola (504 en la app). Por eso `up` invoca con una imagen chica hasta recibir 200 antes de terminar.

Probar (después del "listo para usar"):

```bash
bash infra/sagemaker/invoke.sh foto.jpg "a person dressed as a 1930s circus clown" salida.jpg
```

## Contrato de inferencia

Request `application/json`:

```json
{
  "image": "<jpeg/png base64>",
  "references": ["<base64>"],
  "prompt": "texto",
  "width": 768,
  "height": 960,
  "steps": 4,
  "seed": 123
}
```

- `references` es opcional. Máximo 3 imágenes en total y 5 MB de base64 por imagen.
- `width` y `height`: múltiplos de 16 entre 512 y 1024 (default 768x960). `steps`: 1 a 8 (default 4). `seed` opcional.
- Se usa `guidance_scale=1.0` (klein distilled, el pipeline lo ignora).

Response: `{ "image": "<jpeg base64 q90>", "seed": 123, "ms": 1234 }`.

## Versiones fijadas

`code/requirements.txt` fija `diffusers==0.41.0` (trae `Flux2KleinPipeline`), `transformers==5.19.0` (diffusers 0.41 exige `huggingface-hub>=1.32,<2`, lo que descarta transformers 4.x), `accelerate`, `huggingface_hub` y `safetensors`.
