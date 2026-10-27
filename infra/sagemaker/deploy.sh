#!/usr/bin/env bash
# Prende/apaga el endpoint de SageMaker con FLUX.2 [klein] 4B.
# Uso: deploy.sh <up|down|status|logs>
# ATENCIÓN: mientras el endpoint existe cobra por hora (ml.g6.xlarge). Apagalo siempre con `down`.
set -euo pipefail

export CLICOLOR_FORCE=0
export AWS_PAGER=""
export AWS_PROFILE="${AWS_PROFILE:-disfrazate-deploy}"
export AWS_REGION="us-east-1"
export AWS_DEFAULT_REGION="us-east-1"

ACCOUNT_ID="493735739644"
BUCKET="disfrazate-sagemaker-${ACCOUNT_ID}"
ROLE_NAME="disfrazate-sagemaker-exec"
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"
ENDPOINT="disfrazate-flux"
NAME_PREFIX="disfrazate-flux-"
INSTANCE_TYPE="ml.g6.xlarge"
IMAGE="763104351884.dkr.ecr.us-east-1.amazonaws.com/pytorch-inference:2.6.0-gpu-py312-cu124-ubuntu22.04-sagemaker"
HF_MODEL_ID="black-forest-labs/FLUX.2-klein-4B"
LOG_GROUP="/aws/sagemaker/Endpoints/${ENDPOINT}"

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
  echo "Uso: $0 <up|down|status|logs>" >&2
  exit 2
}

need() {
  command -v "$1" >/dev/null 2>&1 || { echo "Falta el comando: $1" >&2; exit 1; }
}

check_account() {
  local actual
  actual="$(aws sts get-caller-identity --query Account --output text)"
  if [[ "$actual" != "$ACCOUNT_ID" ]]; then
    echo "El perfil '${AWS_PROFILE}' apunta a la cuenta ${actual}, se esperaba ${ACCOUNT_ID}. Abortando." >&2
    exit 1
  fi
}

# Imprime el estado del endpoint, o "NONE" si no existe.
endpoint_status() {
  local out
  if out="$(aws sagemaker describe-endpoint --endpoint-name "$ENDPOINT" --query EndpointStatus --output text 2>/dev/null)"; then
    echo "$out"
  else
    echo "NONE"
  fi
}

show_logs() {
  local lines="${1:-100}"
  local since
  since="$(( ($(date +%s) - 86400) * 1000 ))"
  aws logs filter-log-events \
    --log-group-name "$LOG_GROUP" \
    --start-time "$since" \
    --output json 2>/dev/null \
    | jq -r --argjson n "$lines" '[.events[]] | sort_by(.timestamp) | .[-$n:][] | "\((.timestamp / 1000 | floor | todate)) \(.message | rtrimstr("\n"))"' \
    || echo "(sin logs disponibles en ${LOG_GROUP})"
}

ensure_bucket() {
  if ! aws s3api head-bucket --bucket "$BUCKET" >/dev/null 2>&1; then
    echo "Creando bucket ${BUCKET}..."
    aws s3api create-bucket --bucket "$BUCKET" >/dev/null
  fi
  aws s3api put-public-access-block --bucket "$BUCKET" \
    --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
}

ensure_role() {
  local created=0
  if ! aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
    echo "Creando rol ${ROLE_NAME}..."
    aws iam create-role --role-name "$ROLE_NAME" \
      --assume-role-policy-document "file://${DIR}/exec-role-trust.json" >/dev/null
    created=1
  fi
  aws iam put-role-policy --role-name "$ROLE_NAME" --policy-name "${ROLE_NAME}-inline" \
    --policy-document "file://${DIR}/exec-role-policy.json"
  if [[ "$created" -eq 1 ]]; then
    echo "Esperando 10 s la propagación de IAM..."
    sleep 10
  fi
}

package_code() {
  local ts="$1" tmp
  tmp="$(mktemp -d)"
  mkdir -p "${tmp}/code"
  cp "${DIR}/code/inference.py" "${DIR}/code/requirements.txt" "${tmp}/code/"
  tar -C "$tmp" -czf "${tmp}/model.tar.gz" code
  aws s3 cp "${tmp}/model.tar.gz" "s3://${BUCKET}/models/${ts}/model.tar.gz" --only-show-errors
  rm -rf "$tmp"
}

cmd_up() {
  need jq
  need tar
  check_account

  local ts name container
  ts="$(date -u +%Y%m%d%H%M%S)"
  name="${NAME_PREFIX}${ts}"

  ensure_bucket
  ensure_role
  package_code "$ts"

  container="$(jq -n \
    --arg image "$IMAGE" \
    --arg data "s3://${BUCKET}/models/${ts}/model.tar.gz" \
    --arg hf "$HF_MODEL_ID" \
    '{
      Image: $image,
      ModelDataUrl: $data,
      Environment: {
        SAGEMAKER_PROGRAM: "inference.py",
        SAGEMAKER_SUBMIT_DIRECTORY: "/opt/ml/model/code",
        HF_MODEL_ID: $hf,
        HF_HOME: "/tmp/hf",
        SAGEMAKER_MODEL_SERVER_WORKERS: "1",
        TS_DEFAULT_RESPONSE_TIMEOUT: "120",
        SAGEMAKER_MODEL_SERVER_TIMEOUT: "120"
      }
    }')"

  echo "Creando modelo ${name}..."
  aws sagemaker create-model --model-name "$name" \
    --execution-role-arn "$ROLE_ARN" \
    --primary-container "$container" >/dev/null

  echo "Creando endpoint-config ${name}..."
  aws sagemaker create-endpoint-config --endpoint-config-name "$name" \
    --production-variants "$(jq -n --arg model "$name" --arg type "$INSTANCE_TYPE" '[{
      VariantName: "AllTraffic",
      ModelName: $model,
      InstanceType: $type,
      InitialInstanceCount: 1,
      ContainerStartupHealthCheckTimeoutInSeconds: 1800,
      ModelDataDownloadTimeoutInSeconds: 1800
    }]')" >/dev/null

  if [[ "$(endpoint_status)" == "NONE" ]]; then
    echo "Creando endpoint ${ENDPOINT} (empieza a cobrar)..."
    aws sagemaker create-endpoint --endpoint-name "$ENDPOINT" --endpoint-config-name "$name" >/dev/null
  else
    echo "Actualizando endpoint ${ENDPOINT}..."
    aws sagemaker update-endpoint --endpoint-name "$ENDPOINT" --endpoint-config-name "$name" >/dev/null
  fi

  echo "Esperando a InService (puede tardar 10-20 min)..."
  if ! aws sagemaker wait endpoint-in-service --endpoint-name "$ENDPOINT"; then
    echo "El endpoint no llegó a InService. Estado: $(endpoint_status)" >&2
    aws sagemaker describe-endpoint --endpoint-name "$ENDPOINT" --query FailureReason --output text >&2 || true
    echo "--- últimos logs ---" >&2
    show_logs 50 >&2
    echo "Recordá correr 'deploy.sh down' para no seguir pagando." >&2
    exit 1
  fi
  echo "Endpoint ${ENDPOINT} InService. Cobra ~US\$1,13/h: apagalo con 'deploy.sh down' al terminar."
}

cmd_down() {
  need jq
  check_account

  if [[ "$(endpoint_status)" != "NONE" ]]; then
    echo "Borrando endpoint ${ENDPOINT}..."
    aws sagemaker delete-endpoint --endpoint-name "$ENDPOINT"
    aws sagemaker wait endpoint-deleted --endpoint-name "$ENDPOINT"
  fi

  local item
  while IFS= read -r item; do
    [[ -n "$item" ]] || continue
    aws sagemaker delete-endpoint-config --endpoint-config-name "$item"
  done < <(aws sagemaker list-endpoint-configs --name-contains "$NAME_PREFIX" --output json \
    | jq -r --arg p "$NAME_PREFIX" '.EndpointConfigs[].EndpointConfigName | select(startswith($p))')

  while IFS= read -r item; do
    [[ -n "$item" ]] || continue
    aws sagemaker delete-model --model-name "$item"
  done < <(aws sagemaker list-models --name-contains "$NAME_PREFIX" --output json \
    | jq -r --arg p "$NAME_PREFIX" '.Models[].ModelName | select(startswith($p))')

  echo "endpoint apagado, ya no cobra"
}

cmd_status() {
  local st
  st="$(endpoint_status)"
  if [[ "$st" == "NONE" ]]; then
    echo "no existe (no cobra)"
  else
    echo "${ENDPOINT}: ${st}"
  fi
}

cmd_logs() {
  need jq
  show_logs 100
}

need aws
case "${1:-}" in
  up) cmd_up ;;
  down) cmd_down ;;
  status) cmd_status ;;
  logs) cmd_logs ;;
  *) usage ;;
esac
