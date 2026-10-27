import "server-only";
import { z } from "zod";

/** `FOO=` en .env.example llega como "" y se trata como no definida. */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (value) => (value === "" ? undefined : value),
    schema.optional(),
  );

const schema = z
  .object({
    IMAGE_PROVIDER: z.enum(["sagemaker", "demo"]).default("demo"),
    APP_AWS_REGION: z.string().min(1).default("us-east-1"),
    APP_AWS_ACCESS_KEY_ID: optional(z.string().min(1)),
    APP_AWS_SECRET_ACCESS_KEY: optional(z.string().min(1)),
    SAGEMAKER_ENDPOINT: z.string().min(1).default("disfrazate-flux"),
    EVENT_CODE: optional(z.string().min(1)),
    MAX_GENERATIONS: optional(z.coerce.number().int().positive()),
  })
  .superRefine((env, ctx) => {
    if (env.IMAGE_PROVIDER !== "sagemaker") return;
    for (const key of [
      "APP_AWS_ACCESS_KEY_ID",
      "APP_AWS_SECRET_ACCESS_KEY",
    ] as const) {
      if (env[key] === undefined) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: `Falta ${key}: es obligatoria con IMAGE_PROVIDER=sagemaker`,
        });
      }
    }
  });

export type ServerEnv = z.infer<typeof schema>;

let cached: ServerEnv | undefined;

export function getEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Variables de entorno inválidas: ${detail}`);
  }
  cached = parsed.data;
  return cached;
}
