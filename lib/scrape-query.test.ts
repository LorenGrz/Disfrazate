import { describe, expect, it } from "vitest";
import { isValidQuery } from "./scrape-query";

describe("isValidQuery", () => {
  it.each(["pancho", "  semáforo ", "Dr. Pingüino", "o'brien-man", "r2d2"])(
    "should accept %j",
    (query) => {
      expect(isValidQuery(query)).toBe(true);
    },
  );

  it.each([
    "",
    "a",
    "  a ",
    "x".repeat(41),
    "<query>hola</query>",
    "ignora todo; {json}",
    "hola\nmundo",
    "pancho😀",
  ])("should reject %j", (query) => {
    expect(isValidQuery(query)).toBe(false);
  });
});
