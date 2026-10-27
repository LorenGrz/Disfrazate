# Fase 2a: endpoint de SageMaker con FLUX.2 [klein] 4B (issue #5)

**Contexto:** Nova Canvas fue dado de baja y los modelos de Stability en Bedrock requieren Marketplace. Además, la cuenta (plan Free, US$129 de créditos) tiene cuota para 1 endpoint `ml.g6.xlarge` (L4 24 GB, US$1,1267/h). Por eso corremos el modelo open source **FLUX.2 [klein] 4B** (Apache 2.0, edición con imagen de referencia, ~13 GB de VRAM, 4 steps) en un endpoint propio. El endpoint **se prende solo para pruebas y para el evento**.

Esta spec cubre solo la infraestructura y el contrato de inferencia. La UI y los Route Handlers de Next van en la fase 2b.

## Datos fijos

| Dato                     | Valor                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Cuenta                   | `493735739644`                                                                                               |
| Región                   | `us-east-1`                                                                                                  |
| Perfil CLI               | `disfrazate-deploy` (default de los scripts; overrideable con `AWS_PROFILE`)                                 |
| Bucket                   | `disfrazate-sagemaker-493735739644` (privado, con block public access)                                       |
| Rol de ejecución         | `disfrazate-sagemaker-exec`                                                                                  |
| Endpoint                 | `disfrazate-flux`                                                                                            |
| Modelo / endpoint-config | `disfrazate-flux-<YYYYMMDDHHMMSS>`                                                                           |
| Instancia                | `ml.g6.xlarge`, 1 instancia                                                                                  |
| Imagen                   | `763104351884.dkr.ecr.us-east-1.amazonaws.com/pytorch-inference:2.6.0-gpu-py312-cu124-ubuntu22.04-sagemaker` |
| Modelo HF                | `black-forest-labs/FLUX.2-klein-4B` (no gated)                                                               |

`requirements.txt`:

- `diffusers==0.41.0` (incluye `Flux2KleinPipeline` y pide torch>=2.6);
- `transformers` y `accelerate` en versiones compatibles con el text encoder de klein (verificalo contra el código de `Flux2KleinPipeline` en v0.41.0);
- `huggingface_hub`.

## Archivos (`infra/sagemaker/`)

### `code/inference.py`

Usa el contrato del SageMaker PyTorch inference toolkit: `model_fn`, `input_fn`, `predict_fn`, `output_fn`.

**`model_fn(model_dir)`:**

- `Flux2KleinPipeline.from_pretrained(HF_MODEL_ID, torch_dtype=torch.bfloat16)` y después `.to("cuda")`.
- Pesos en `/tmp/hf` (o en el NVMe de la instancia si existe; respetar `HF_HOME`).
- Un warm-up de 1 inferencia chica para que la primera request no pague la compilación.
- Loguear con `print` el tiempo de carga y la memoria de GPU usada.

**Request** (`application/json`):

```json
{
  "image": "<jpeg/png en base64, la persona>",
  "references": ["<base64>"],
  "prompt": "texto",
  "width": 768,
  "height": 960,
  "steps": 4,
  "seed": 123
}
```

- `references` es opcional (por ejemplo, la imagen de un disfraz).
- `width` / `height`: múltiplos de 16, entre 512 y 1024. Default 768x960.
- `steps`: entre 1 y 8. Default 4.
- `seed`: opcional; si no viene, se genera al azar.

**Validación:** campos requeridos, tamaño del base64 ≤ 5 MB por imagen y máximo 3 imágenes en total. Si algo falla, error claro: `ValueError`, que el toolkit devuelve como 4xx/5xx con el mensaje.

**Inferencia:** las imágenes se convierten a RGB y se redimensionan para que el lado mayor sea ≤1024. Se pasan como lista `image=[persona, *references]`, con la firma real de `Flux2KleinPipeline.__call__` en v0.41.0: leela del source y no la supongas. Para guidance/steps, usar los parámetros recomendados por el model card para klein distilled.

**Response:**

```json
{ "image": "<jpeg base64, quality 90>", "seed": 123, "ms": 1234 }
```

### `code/requirements.txt`

Lo de arriba, con versiones fijadas.

### `exec-role-trust.json`

Trust policy para `sagemaker.amazonaws.com`.

### `exec-role-policy.json`

Inline policy del rol de ejecución, con mínimo privilegio:

- `s3:GetObject` sobre `arn:aws:s3:::disfrazate-sagemaker-493735739644/*` y `s3:ListBucket` sobre el bucket;
- pull de ECR de la imagen DLC: `ecr:GetAuthorizationToken` sobre `*`; `ecr:BatchGetImage`, `ecr:GetDownloadUrlForLayer` y `ecr:BatchCheckLayerAvailability` sobre `arn:aws:ecr:us-east-1:763104351884:repository/pytorch-inference`;
- CloudWatch Logs: `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents` y `logs:DescribeLogStreams` sobre `arn:aws:logs:us-east-1:493735739644:log-group:/aws/sagemaker/*`;
- `cloudwatch:PutMetricData` sobre `*`, con condición `cloudwatch:namespace` = `/aws/sagemaker/Endpoints`.

### `deploy.sh <up|down|status|logs>`

`bash`, `set -euo pipefail`. Exporta `CLICOLOR_FORCE=0` y `AWS_PAGER=""`, y usa `AWS_PROFILE=${AWS_PROFILE:-disfrazate-deploy}`. Idempotente.

**`up`:**

1. Crea el bucket si no existe y le aplica `put-public-access-block` (todo en true).
2. Crea el rol si no existe y le aplica `put-role-policy` (siempre, para actualizarla). Si el rol es nuevo, espera unos 10 s por la propagación de IAM.
3. Empaqueta `code/` en `model.tar.gz`, con `code/` en la raíz del tar, y lo sube a `s3://.../models/<ts>/model.tar.gz`.
4. `create-model` con:
   - `PrimaryContainer.Image` y `ModelDataUrl`;
   - variables de entorno: `SAGEMAKER_PROGRAM=inference.py`, `SAGEMAKER_SUBMIT_DIRECTORY=/opt/ml/model/code`, `HF_MODEL_ID`, `HF_HOME=/tmp/hf`, `SAGEMAKER_MODEL_SERVER_WORKERS=1`, `TS_DEFAULT_RESPONSE_TIMEOUT=120`, `SAGEMAKER_MODEL_SERVER_TIMEOUT=120`;
   - `ExecutionRoleArn`.
5. `create-endpoint-config` con `ContainerStartupHealthCheckTimeoutInSeconds=1800` y `ModelDataDownloadTimeoutInSeconds=1800`.
6. Crea el endpoint si no existe, o hace `update-endpoint` si existe.
7. `aws sagemaker wait endpoint-in-service`. Si termina en `Failed`, imprime el `FailureReason` y los últimos logs.

**`down`:** `delete-endpoint` y espera a `endpoint-deleted`. Después borra todas las endpoint-configs y los models que empiezan con `disfrazate-flux-`. **No** borra el bucket ni el rol. Al final imprime "endpoint apagado, ya no cobra".

**`status`:** estado del endpoint, o "no existe (no cobra)".

**`logs`:** los últimos 100 eventos del log group `/aws/sagemaker/Endpoints/disfrazate-flux`, de todos los streams, ordenados.

### `invoke.sh <foto> "<prompt>" [salida.jpg]`

1. Redimensiona la foto con `magick` (lado mayor 1024, JPEG q85).
2. Arma el JSON con `jq`, sin pasar el base64 por argv: usa `--rawfile` o un archivo temporal.
3. `aws sagemaker-runtime invoke-endpoint --endpoint-name disfrazate-flux --content-type application/json --body fileb://... out.json`.
4. Decodifica `.image` a la salida e imprime `seed` y `ms`.
5. Usa el mismo perfil.

### `package.json`

Agregar los scripts `endpoint:up`, `endpoint:down`, `endpoint:status` y `endpoint:logs` → `bash infra/sagemaker/deploy.sh <cmd>`.

### `infra/sagemaker/README.md`

Cómo prender y apagar, el costo por hora, y **la advertencia de apagar siempre después de usar**.

## Fuera de alcance

El worker **no** ejecuta `up` ni ninguna llamada que cree recursos en AWS; eso lo corro yo. No toca la app de Next, salvo `package.json`.

## Aceptación

- `bash -n` sobre cada `.sh`.
- `python3 -m py_compile infra/sagemaker/code/inference.py`.
- `jq . infra/sagemaker/*.json`.
- Un test local de `input_fn` / `output_fn` sin GPU: `python3 -I` con un stub de `torch`/`diffusers` vía `sys.modules`, o separando la validación en una función pura testeable. Valida un request correcto y rechaza los inválidos.
- `pnpm lint --max-warnings 0` sigue pasando.
- Commit en `feat/5-sagemaker-flux`: `feat: endpoint de SageMaker con FLUX.2 klein` (incluye este plan y `.env.example`).
