import "server-only";
import { NextResponse } from "next/server";
import type { ApiError, ApiErrorKind } from "./api-schemas";

export function errorResponse(
  status: number,
  kind: ApiErrorKind,
  message: string,
): NextResponse<ApiError> {
  return NextResponse.json({ error: { kind, message } }, { status });
}

/** JSON del body, o undefined si no se puede parsear. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return (await request.json()) as unknown;
  } catch {
    return undefined;
  }
}
