import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getEnv } from "./env.server";

export const EVENT_COOKIE = "dz_event";

function sha256(text: string): Buffer {
  return createHash("sha256").update(text).digest();
}

function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(sha256(a), sha256(b));
}

/** HMAC con una clave derivada del code: el code nunca viaja ni se guarda en claro. */
export function eventToken(code: string): string {
  const key = createHmac("sha256", code)
    .update("disfrazate:event-key")
    .digest();
  return createHmac("sha256", key).update("dz_event:v1").digest("hex");
}

/** Comparación en tiempo constante contra EVENT_CODE. false si no está configurado. */
export function isValidEventCode(input: string): boolean {
  const code = getEnv().EVENT_CODE;
  if (code === undefined) return false;
  return safeEqual(input, code);
}

export function expectedEventToken(): string | undefined {
  const code = getEnv().EVENT_CODE;
  return code === undefined ? undefined : eventToken(code);
}

export async function hasEventAccess(): Promise<boolean> {
  const expected = expectedEventToken();
  if (expected === undefined) return false;
  const value = (await cookies()).get(EVENT_COOKIE)?.value;
  return value !== undefined && safeEqual(value, expected);
}
