#!/usr/bin/env bash
# Prueba el endpoint: invoke.sh <foto> "<prompt>" [salida.jpg]
set -euo pipefail

export CLICOLOR_FORCE=0
export AWS_PAGER=""
export AWS_PROFILE="${AWS_PROFILE:-disfrazate-deploy}"
export AWS_REGION="us-east-1"
export AWS_DEFAULT_REGION="us-east-1"

ENDPOINT="disfrazate-flux"

if [[ $# -lt 2 || $# -gt 3 ]]; then
  echo "Uso: $0 <foto> \"<prompt>\" [salida.jpg]" >&2
  exit 2
fi

PHOTO="$1"
PROMPT="$2"
OUT="${3:-out.jpg}"

[[ -f "$PHOTO" ]] || { echo "No existe la foto: $PHOTO" >&2; exit 1; }
for c in magick jq aws base64; do
  command -v "$c" >/dev/null 2>&1 || { echo "Falta el comando: $c" >&2; exit 1; }
done

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

magick "$PHOTO" -auto-orient -resize '1024x1024>' -quality 85 "jpg:${TMP}/in.jpg"
base64 -w0 "${TMP}/in.jpg" > "${TMP}/in.b64"

jq -n --rawfile image "${TMP}/in.b64" --arg prompt "$PROMPT" \
  '{image: $image, prompt: $prompt, width: 768, height: 960, steps: 4}' > "${TMP}/req.json"

aws sagemaker-runtime invoke-endpoint \
  --endpoint-name "$ENDPOINT" \
  --content-type application/json \
  --body "fileb://${TMP}/req.json" \
  "${TMP}/out.json" >/dev/null

jq -r '.image' "${TMP}/out.json" | base64 -d > "$OUT"
jq -r '"seed=\(.seed) ms=\(.ms)"' "${TMP}/out.json"
echo "Imagen guardada en ${OUT}"
