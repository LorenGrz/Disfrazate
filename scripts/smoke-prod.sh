#!/usr/bin/env bash
# Prueba de humo del flujo DISFRAZATE contra producción (o la URL que pases).
# Uso: EVENT_CODE=<código> bash scripts/smoke-prod.sh [base-url]
# Genera 1 imagen real (consume 1 generación y queda guardada en Supabase como cualquier participante).
set -euo pipefail

BASE="${1:-https://disfrazate.vercel.app}"
CODE="${EVENT_CODE:?Falta EVENT_CODE (el código del evento)}"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PHOTO="${SMOKE_PHOTO:-${DIR}/public/catalogo/pancho.jpg}"

for c in curl jq base64; do
  command -v "$c" >/dev/null 2>&1 || { echo "Falta el comando: $c" >&2; exit 1; }
done

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
JAR="${TMP}/cookies"

check() { # check <nombre> <status esperado> <status obtenido>
  if [[ "$3" == "$2" ]]; then echo "ok   $1 ($3)"; else echo "FALLO $1: esperaba $2, vino $3" >&2; exit 1; fi
}

check "home" 200 "$(curl -s -o /dev/null -w '%{http_code}' "${BASE}/")"
check "catálogo" 200 "$(curl -s -o /dev/null -w '%{http_code}' "${BASE}/disfraces")"
check "código del evento" 204 "$(curl -s -c "$JAR" -o /dev/null -w '%{http_code}' -X POST "${BASE}/api/evento" \
  -H 'content-type: application/json' -d "$(jq -n --arg c "$CODE" '{code: $c}')")"

status="$(curl -s -b "$JAR" -o "${TMP}/escenas.json" -w '%{http_code}' -X POST "${BASE}/api/escenas" \
  -H 'content-type: application/json' -d '{"costumeSlug":"vampiro","count":1}')"
check "escenas" 200 "$status"
scene="$(jq -r '.scenes[0].id' "${TMP}/escenas.json")"
style="$(jq -r '.scenes[0].styleId' "${TMP}/escenas.json")"

base64 -w0 "$PHOTO" >"${TMP}/photo.b64"
jq -n --rawfile p "${TMP}/photo.b64" --arg s "$scene" --arg st "$style" \
  '{photo: $p, costumeSlug: "vampiro", sceneId: $s, styleId: $st}' >"${TMP}/body.json"
start=$(date +%s)
status="$(curl -s -b "$JAR" -o "${TMP}/out.json" -w '%{http_code}' --max-time 70 -X POST "${BASE}/api/disfrazar" \
  -H 'content-type: application/json' --data-binary "@${TMP}/body.json")"
if [[ "$status" != 200 ]]; then
  echo "FALLO disfrazar ($status): $(head -c 300 "${TMP}/out.json")" >&2
  exit 1
fi
echo "ok   disfrazar (200, $(( $(date +%s) - start )) s, escena ${scene})"
jq -r '.image' "${TMP}/out.json" | sed 's/^data:image\/jpeg;base64,//' | base64 -d >"${SMOKE_OUT:-/dev/null}"
echo "Todo OK: la app está lista para el evento."
