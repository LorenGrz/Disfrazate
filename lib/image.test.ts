import { describe, expect, it } from "vitest";
import { fitWithin } from "./image";

describe("fitWithin", () => {
  it("should scale the longest side down to 1024 when the image is larger", () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: 1024, height: 768 });
    expect(fitWithin(3000, 4000)).toEqual({ width: 768, height: 1024 });
  });

  it("should not enlarge when the image already fits", () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it("should never return a zero dimension when the ratio is extreme", () => {
    expect(fitWithin(10000, 1).height).toBe(1);
  });
});
