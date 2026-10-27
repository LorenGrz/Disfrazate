"""SageMaker inference handler para FLUX.2 [klein] 4B (Flux2KleinPipeline).

Contrato del PyTorch inference toolkit: model_fn, input_fn, predict_fn, output_fn.
La validación del request vive en `parse_request` (pura, sin torch/PIL) para poder
testearla sin GPU. torch, diffusers y PIL se importan de forma perezosa.
"""

from __future__ import annotations

import base64
import binascii
import io
import json
import os
import random
import time
from typing import Any

HF_MODEL_ID = os.environ.get("HF_MODEL_ID", "black-forest-labs/FLUX.2-klein-4B")

MAX_IMAGE_B64_BYTES = 5 * 1024 * 1024  # por imagen, sobre el base64
MAX_IMAGES = 3  # persona + referencias
MAX_SIDE = 1024
DEFAULT_WIDTH = 768
DEFAULT_HEIGHT = 960
MIN_DIM = 512
MAX_DIM = 1024
DEFAULT_STEPS = 4
MIN_STEPS = 1
MAX_STEPS = 8
MAX_SEED = 2**32 - 1
# klein "distilled": el model card usa guidance_scale=1.0 y 4 steps (el pipeline ignora CFG).
GUIDANCE_SCALE = 1.0
JPEG_QUALITY = 90

_MAGIC = (b"\xff\xd8\xff", b"\x89PNG\r\n\x1a\n")


def _decode_image_b64(value: Any, name: str) -> bytes:
    if not isinstance(value, str) or not value:
        raise ValueError(f"'{name}' debe ser un string base64 no vacío")
    if len(value) > MAX_IMAGE_B64_BYTES:
        raise ValueError(f"'{name}' supera el máximo de {MAX_IMAGE_B64_BYTES // (1024 * 1024)} MB en base64")
    try:
        raw = base64.b64decode(value, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise ValueError(f"'{name}' no es base64 válido") from exc
    if not raw.startswith(_MAGIC):
        raise ValueError(f"'{name}' debe ser JPEG o PNG")
    return raw


def _int_field(body: dict[str, Any], key: str, default: int, lo: int, hi: int, multiple: int = 1) -> int:
    value = body.get(key, default)
    if isinstance(value, bool) or not isinstance(value, int):
        raise ValueError(f"'{key}' debe ser un entero")
    if value < lo or value > hi:
        raise ValueError(f"'{key}' debe estar entre {lo} y {hi}")
    if value % multiple != 0:
        raise ValueError(f"'{key}' debe ser múltiplo de {multiple}")
    return value


def parse_request(body: Any) -> dict[str, Any]:
    """Valida el JSON del request y devuelve campos normalizados (imágenes como bytes)."""
    if not isinstance(body, dict):
        raise ValueError("el body debe ser un objeto JSON")

    if "image" not in body:
        raise ValueError("falta el campo requerido 'image'")
    prompt = body.get("prompt")
    if not isinstance(prompt, str) or not prompt.strip():
        raise ValueError("falta el campo requerido 'prompt' (string no vacío)")

    references = body.get("references", [])
    if references is None:
        references = []
    if not isinstance(references, list):
        raise ValueError("'references' debe ser una lista de strings base64")
    if 1 + len(references) > MAX_IMAGES:
        raise ValueError(f"máximo {MAX_IMAGES} imágenes en total (image + references)")

    images = [_decode_image_b64(body["image"], "image")]
    images += [_decode_image_b64(ref, f"references[{i}]") for i, ref in enumerate(references)]

    seed = body.get("seed")
    if seed is None:
        seed = random.randrange(MAX_SEED + 1)
    elif isinstance(seed, bool) or not isinstance(seed, int) or seed < 0 or seed > MAX_SEED:
        raise ValueError(f"'seed' debe ser un entero entre 0 y {MAX_SEED}")

    return {
        "images": images,
        "prompt": prompt.strip(),
        "width": _int_field(body, "width", DEFAULT_WIDTH, MIN_DIM, MAX_DIM, 16),
        "height": _int_field(body, "height", DEFAULT_HEIGHT, MIN_DIM, MAX_DIM, 16),
        "steps": _int_field(body, "steps", DEFAULT_STEPS, MIN_STEPS, MAX_STEPS),
        "seed": seed,
    }


def _to_rgb(raw: bytes) -> Any:
    from PIL import Image, ImageOps

    img = Image.open(io.BytesIO(raw))
    img = ImageOps.exif_transpose(img).convert("RGB")
    longest = max(img.size)
    if longest > MAX_SIDE:
        scale = MAX_SIDE / longest
        img = img.resize(
            (max(1, round(img.width * scale)), max(1, round(img.height * scale))),
            Image.Resampling.LANCZOS,
        )
    return img


def model_fn(model_dir: str) -> Any:
    import torch
    from diffusers import Flux2KleinPipeline

    os.environ.setdefault("HF_HOME", "/tmp/hf")
    t0 = time.time()
    pipe = Flux2KleinPipeline.from_pretrained(HF_MODEL_ID, torch_dtype=torch.bfloat16)
    pipe.to("cuda")
    load_s = time.time() - t0
    mem_gb = torch.cuda.memory_allocated() / 1024**3
    print(f"[model_fn] cargado {HF_MODEL_ID} en {load_s:.1f}s, GPU usada: {mem_gb:.2f} GB", flush=True)

    # Warm-up chico (edición con 1 imagen) para que la primera request real no pague el arranque.
    from PIL import Image

    t1 = time.time()
    pipe(
        image=[Image.new("RGB", (256, 256), (128, 128, 128))],
        prompt="warm-up",
        height=256,
        width=256,
        guidance_scale=GUIDANCE_SCALE,
        num_inference_steps=1,
        generator=torch.Generator("cuda").manual_seed(0),
    )
    print(f"[model_fn] warm-up en {time.time() - t1:.1f}s", flush=True)
    return pipe


def input_fn(request_body: Any, content_type: str = "application/json") -> dict[str, Any]:
    if content_type is None or content_type.split(";")[0].strip().lower() != "application/json":
        raise ValueError(f"content-type no soportado: {content_type}; usar application/json")
    try:
        if isinstance(request_body, (bytes, bytearray)):
            request_body = request_body.decode("utf-8")
        body = json.loads(request_body)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValueError("el body no es JSON válido") from exc
    return parse_request(body)


def predict_fn(data: dict[str, Any], model: Any) -> dict[str, Any]:
    import torch

    t0 = time.time()
    images = [_to_rgb(raw) for raw in data["images"]]
    generator = torch.Generator("cuda").manual_seed(data["seed"])
    result = model(
        image=images,
        prompt=data["prompt"],
        height=data["height"],
        width=data["width"],
        guidance_scale=GUIDANCE_SCALE,
        num_inference_steps=data["steps"],
        generator=generator,
    )
    return {"image": result.images[0], "seed": data["seed"], "ms": int((time.time() - t0) * 1000)}


def output_fn(prediction: dict[str, Any], accept: str = "application/json") -> tuple[str, str]:
    buf = io.BytesIO()
    prediction["image"].convert("RGB").save(buf, format="JPEG", quality=JPEG_QUALITY)
    payload = {
        "image": base64.b64encode(buf.getvalue()).decode("ascii"),
        "seed": prediction["seed"],
        "ms": prediction["ms"],
    }
    return json.dumps(payload), "application/json"
