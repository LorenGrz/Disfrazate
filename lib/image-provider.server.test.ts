import { describe, expect, it } from "vitest";
import { createDemoProvider, mapSageMakerError } from "./image-provider.server";

function named(name: string, message = ""): Error {
  const error = new Error(message);
  error.name = name;
  return error;
}

describe("demoProvider", () => {
  it("should return an ok result with a JPEG when generating", async () => {
    const result = await createDemoProvider().generate({
      photoJpegB64: "x",
      prompt: "p",
      seed: 1,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.seed).toBe(1);
      expect(result.value.jpegB64.startsWith("/9j/")).toBe(true);
    }
  });
});

describe("mapSageMakerError", () => {
  it("should map a missing endpoint to offline", () => {
    const error = named(
      "ValidationException",
      "Could not find endpoint disfrazate-flux",
    );
    expect(mapSageMakerError(error)).toEqual({ kind: "offline" });
  });

  it("should map abort and timeout errors to timeout", () => {
    expect(mapSageMakerError(named("TimeoutError"))).toEqual({
      kind: "timeout",
    });
    expect(mapSageMakerError(named("AbortError"))).toEqual({ kind: "timeout" });
  });

  it("should map a 4xx model error to rejected", () => {
    const error = Object.assign(named("ModelError", "bad image"), {
      OriginalStatusCode: 400,
    });
    expect(mapSageMakerError(error)).toEqual({
      kind: "rejected",
      message: "bad image",
    });
  });

  it("should rethrow unexpected errors", () => {
    expect(() => mapSageMakerError(named("AccessDeniedException"))).toThrow();
  });
});
