import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getSupabase = vi.hoisted(() => vi.fn());
vi.mock("./supabase.server", () => ({ getSupabase }));

import { participantPaths, saveGeneration } from "./participant-photos.server";

describe("participantPaths", () => {
  const bytes = new Uint8Array([1, 2, 3]);
  const hash = createHash("sha256").update(bytes).digest("hex");

  it("should build paths from the sha256 of the photo bytes", () => {
    expect(participantPaths(bytes, "oficina", "cine", 42)).toEqual({
      photoHash: hash,
      originalPath: `${hash}/original.jpg`,
      imagePath: `${hash}/oficina-cine-42.jpg`,
    });
  });

  it("should share the folder when the photo is the same", () => {
    const a = participantPaths(bytes, "a", "x", 1);
    const b = participantPaths(new Uint8Array([1, 2, 3]), "b", "y", 2);
    expect(a.originalPath).toBe(b.originalPath);
    expect(a.imagePath).not.toBe(b.imagePath);
  });

  it("should change the folder when the photo changes", () => {
    const other = participantPaths(new Uint8Array([9]), "a", "x", 1);
    expect(other.photoHash).not.toBe(hash);
  });
});

describe("saveGeneration", () => {
  beforeEach(() => getSupabase.mockReset());

  const input = {
    photoJpegB64: "/9j/AAAA",
    imageJpegB64: "/9j/BBBB",
    costumeSlug: "fantasma",
    sceneId: "oficina",
    styleId: "cine",
    seed: 1,
  };

  it("should do nothing when Supabase is not configured", async () => {
    getSupabase.mockReturnValue(null);
    await expect(saveGeneration(input)).resolves.toBeUndefined();
    expect(getSupabase).toHaveBeenCalledTimes(1);
  });

  it("should not throw when Supabase fails", async () => {
    getSupabase.mockReturnValue({
      storage: {
        from: () => ({ upload: () => Promise.reject(new Error("boom")) }),
      },
    });
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(saveGeneration(input)).resolves.toBeUndefined();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
