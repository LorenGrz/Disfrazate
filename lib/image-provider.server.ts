import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  InvokeEndpointCommand,
  SageMakerRuntimeClient,
} from "@aws-sdk/client-sagemaker-runtime";
import { z } from "zod";
import { getEnv } from "./env.server";
import { err, ok, type Result } from "./result";

export type GenerateInput = {
  photoJpegB64: string;
  prompt: string;
  seed?: number;
};

export type GenerateOutput = { jpegB64: string; seed: number; ms: number };

export type ProviderError =
  | { kind: "offline" }
  | { kind: "timeout" }
  | { kind: "rejected"; message: string };

export type ImageProvider = {
  generate(
    input: GenerateInput,
  ): Promise<Result<GenerateOutput, ProviderError>>;
};

const MAX_SEED = 2 ** 32 - 1;
// maxDuration de la ruta es 60 s; cortamos antes para poder responder 504.
const REQUEST_TIMEOUT_MS = 55_000;

const endpointResponse = z.object({
  image: z.string().min(1),
  seed: z.int(),
  ms: z.number(),
});

function randomSeed(): number {
  return Math.floor(Math.random() * (MAX_SEED + 1));
}

function errorName(error: unknown): string {
  return error instanceof Error ? error.name : "";
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "";
}

function originalStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const status: unknown = Reflect.get(error, "OriginalStatusCode");
  return typeof status === "number" ? status : undefined;
}

/** Traduce un error del SDK a ProviderError; los inesperados se relanzan. */
export function mapSageMakerError(error: unknown): ProviderError {
  const name = errorName(error);
  const message = errorMessage(error);
  if (
    name === "TimeoutError" ||
    name === "AbortError" ||
    name === "RequestTimeout"
  ) {
    return { kind: "timeout" };
  }
  if (
    name === "ModelNotReadyException" ||
    name === "ServiceUnavailable" ||
    (name === "ValidationException" &&
      message.includes("Could not find endpoint"))
  ) {
    return { kind: "offline" };
  }
  if (name === "ModelError") {
    const status = originalStatus(error);
    if (status !== undefined && status >= 400 && status < 500) {
      return { kind: "rejected", message };
    }
  }
  throw error;
}

export function createSageMakerProvider(): ImageProvider {
  const env = getEnv();
  const client = new SageMakerRuntimeClient({
    region: env.APP_AWS_REGION,
    credentials: {
      accessKeyId: env.APP_AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: env.APP_AWS_SECRET_ACCESS_KEY ?? "",
    },
  });
  return {
    async generate({ photoJpegB64, prompt, seed }) {
      const command = new InvokeEndpointCommand({
        EndpointName: env.SAGEMAKER_ENDPOINT,
        ContentType: "application/json",
        Accept: "application/json",
        // Contrato de infra/sagemaker/code/inference.py
        Body: JSON.stringify({
          image: photoJpegB64,
          prompt,
          width: 768,
          height: 960,
          steps: 4,
          seed: seed ?? randomSeed(),
        }),
      });
      try {
        const response = await client.send(command, {
          abortSignal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        const text = new TextDecoder().decode(response.Body);
        const parsed = endpointResponse.safeParse(JSON.parse(text));
        if (!parsed.success) {
          return err({
            kind: "rejected",
            message: "El probador devolvió una respuesta inesperada",
          });
        }
        return ok({
          jpegB64: parsed.data.image,
          seed: parsed.data.seed,
          ms: parsed.data.ms,
        });
      } catch (error) {
        return err(mapSageMakerError(error));
      }
    },
  };
}

const DEMO_FILES = ["clown.jpg", "la1935.jpg", "pierrot.jpg", "queensland.jpg"];
const DEMO_DELAY_MS = 800;

export function createDemoProvider(): ImageProvider {
  return {
    async generate({ seed }) {
      const startedAt = Date.now();
      const usedSeed = seed ?? randomSeed();
      const file = DEMO_FILES[usedSeed % DEMO_FILES.length] ?? "clown.jpg";
      const [bytes] = await Promise.all([
        readFile(path.join(process.cwd(), "public", "demo", file)),
        new Promise<void>((resolve) => setTimeout(resolve, DEMO_DELAY_MS)),
      ]);
      return ok({
        jpegB64: bytes.toString("base64"),
        seed: usedSeed,
        ms: Date.now() - startedAt,
      });
    },
  };
}

export function getImageProvider(): ImageProvider {
  return getEnv().IMAGE_PROVIDER === "sagemaker"
    ? createSageMakerProvider()
    : createDemoProvider();
}
