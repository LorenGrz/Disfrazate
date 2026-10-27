#!/usr/bin/env bash
# Genera las fotos de producto del catálogo con el endpoint (tiene que estar "listo para usar").
# Uso: pnpm -s catalog:prompts | bash infra/sagemaker/gen-catalog.sh [dir-salida] [seed-offset]
# Lee "slug<TAB>promptEn" por línea. Salteá las que ya existen; borrá una foto para regenerarla.
set -euo pipefail

export CLICOLOR_FORCE=0
export AWS_PAGER=""
export AWS_PROFILE="${AWS_PROFILE:-disfrazate-deploy}"
export AWS_REGION="us-east-1"

OUT="${1:-public/catalogo}"
SEED_OFFSET="${2:-0}"
ENDPOINT="disfrazate-flux"

for c in magick jq aws base64 cksum; do
  command -v "$c" >/dev/null 2>&1 || { echo "Falta el comando: $c" >&2; exit 1; }
done

mkdir -p "$OUT"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Referencia neutra: fondo de estudio gris liso.
magick -size 768x960 xc:'#d9d9d6' -quality 85 "jpg:${TMP}/ref.jpg"
base64 -w0 "${TMP}/ref.jpg" >"${TMP}/ref.b64"

while IFS=$'\t' read -r slug prompt_en; do
  [[ -n "$slug" ]] || continue
  dest="${OUT}/${slug}.jpg"
  if [[ -f "$dest" ]]; then
    echo "skip ${slug} (existe)"
    continue
  fi
  seed=$(( $(printf '%s' "$slug" | cksum | cut -d' ' -f1) % 100000 + SEED_OFFSET ))
  prompt="E-commerce product listing photo, photorealistic real-life photograph, not an illustration, not a cartoon, not a 3D render. A real adult model wearing a complete ${prompt_en} Halloween costume, full body from head to shoes, standing facing the camera, neutral relaxed expression, plain light grey seamless studio background, soft even lighting, sharp focus. Do not render any text, letters, logos or watermarks."
  jq -n --rawfile img "${TMP}/ref.b64" --arg p "$prompt" --argjson s "$seed" \
    '{image: $img, prompt: $p, width: 768, height: 960, steps: 4, seed: $s}' >"${TMP}/body.json"
  if aws sagemaker-runtime invoke-endpoint --endpoint-name "$ENDPOINT" \
    --content-type application/json --body "fileb://${TMP}/body.json" \
    --cli-read-timeout 70 "${TMP}/out.json" >/dev/null; then
    jq -r .image "${TMP}/out.json" | base64 -d >"${TMP}/raw.jpg"
    magick "${TMP}/raw.jpg" -strip -quality 82 "jpg:${dest}"
    echo "ok ${slug} (seed ${seed}, $(jq -r .ms "${TMP}/out.json") ms)"
  else
    echo "FALLO ${slug}" >&2
  fi
done
