import { describe, expect, it } from "vitest";
import { eventToken } from "./event-gate.server";

describe("eventToken", () => {
  it("should be stable for the same code and never contain it", () => {
    expect(eventToken("secreto")).toBe(eventToken("secreto"));
    expect(eventToken("secreto")).not.toContain("secreto");
  });

  it("should differ when the code differs", () => {
    expect(eventToken("a")).not.toBe(eventToken("b"));
  });
});
