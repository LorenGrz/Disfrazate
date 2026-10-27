import { describe, expect, it } from "vitest";
import { disfrazarBody, escenasBody, MAX_PHOTO_BYTES } from "./api-schemas";

function jpegB64(bytes: number): string {
  const raw = Buffer.alloc(bytes, 1);
  raw[0] = 0xff;
  raw[1] = 0xd8;
  raw[2] = 0xff;
  return raw.toString("base64");
}

describe("escenasBody", () => {
  it("should default to 4 scenes when only the slug is sent", () => {
    const parsed = escenasBody.parse({ costumeSlug: "vampiro" });
    expect(parsed.count).toBe(4);
    expect(parsed.exclude).toEqual([]);
  });

  it("should reject an unknown costume slug", () => {
    expect(escenasBody.safeParse({ costumeSlug: "no-existe" }).success).toBe(
      false,
    );
  });

  it("should reject a count outside 1..4", () => {
    expect(
      escenasBody.safeParse({ costumeSlug: "vampiro", count: 5 }).success,
    ).toBe(false);
  });
});

describe("disfrazarBody", () => {
  const valid = {
    photo: jpegB64(1000),
    costumeSlug: "bruja",
    sceneId: "fila-banco",
    styleId: "fotografo-evento",
  };

  it("should accept a valid body", () => {
    expect(disfrazarBody.safeParse(valid).success).toBe(true);
  });

  it("should reject an unknown costume, scene or style", () => {
    expect(
      disfrazarBody.safeParse({ ...valid, costumeSlug: "x" }).success,
    ).toBe(false);
    expect(disfrazarBody.safeParse({ ...valid, sceneId: "x" }).success).toBe(
      false,
    );
    expect(disfrazarBody.safeParse({ ...valid, styleId: "x" }).success).toBe(
      false,
    );
  });

  it("should reject a photo larger than 1.5 MB when decoded", () => {
    const big = jpegB64(MAX_PHOTO_BYTES + 1000);
    expect(disfrazarBody.safeParse({ ...valid, photo: big }).success).toBe(
      false,
    );
  });

  it("should reject a data URL prefix, non-base64 and non-JPEG photos", () => {
    expect(
      disfrazarBody.safeParse({
        ...valid,
        photo: `data:image/jpeg;base64,${valid.photo}`,
      }).success,
    ).toBe(false);
    expect(
      disfrazarBody.safeParse({ ...valid, photo: "no es base64!" }).success,
    ).toBe(false);
    const png = Buffer.from("\x89PNG\r\n\x1a\nxxxx", "binary").toString(
      "base64",
    );
    expect(disfrazarBody.safeParse({ ...valid, photo: png }).success).toBe(
      false,
    );
  });
});
