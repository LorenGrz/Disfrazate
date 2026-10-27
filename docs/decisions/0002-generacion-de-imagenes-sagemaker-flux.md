# 0002. Generación de imágenes con SageMaker y FLUX.2 klein 4B

## Status

Accepted

## Date

2026-10-27

## Context

DISFRAZATE necesita un modelo que reciba la foto de una persona y la vista con un disfraz en una escena, conservando la cara. El plan madre usaba Gemini; al implementarlo aparecieron bloqueos de costo y de acceso en cada proveedor administrado. El presupuesto es chico y el uso se concentra en las horas del evento.

## Decision

Un endpoint de SageMaker (`disfrazate-flux`, infra en `infra/sagemaker/`) que sirve FLUX.2 [klein] 4B, invocado desde los Route Handlers con `@aws-sdk/client-sagemaker-runtime`. El proveedor está detrás de la interfaz `ImageProvider` (`lib/image-provider.server.ts`), con un `demoProvider` para desarrollar sin AWS. El motivo principal: es la única opción con edición de imagen de calidad que no exige un prepago ni un contrato de Marketplace, y el modelo es chico (4B, 4 pasos).

## Alternatives considered

- **Gemini (API de imágenes)** — exige un prepago de US$30 para habilitar la generación; demasiado para un evento puntual.
- **Amazon Nova Canvas en Bedrock** — dado de baja, ya no está disponible.
- **Stability AI en Bedrock** — requiere suscripción por AWS Marketplace.
- **Proveedor `demo` solamente** — sirve para desarrollar, no para el evento.

## Consequences

- SageMaker cobra por hora mientras el endpoint está prendido: hay que prenderlo antes del evento (`pnpm endpoint:up`) y apagarlo después (`pnpm endpoint:down`). Si está apagado, la API responde 503 ("El probador está apagado").
- La latencia por imagen depende de la GPU del endpoint; la ruta tiene `maxDuration = 60` y corta a los 55 s con un 504.
- Las credenciales van como `APP_AWS_*` (Vercel reserva `AWS_*`).
- Cambiar de proveedor es implementar `ImageProvider` de nuevo; el prompt vive en `lib/prompt.ts`.
