import { describe, expect, it } from "vitest";
import { initialState, reducer, type State } from "./probador-state";

const resultState: State = {
  run: 3,
  view: {
    step: "resultado",
    slug: "vampiro",
    photo: "data:image/jpeg;base64,AAAA",
    cards: [
      {
        scene: { id: "a", label: "A", styleId: "flash", styleLabel: "Flash" },
        status: { kind: "ready", image: "data:image/jpeg;base64,BBBB" },
      },
    ],
  },
};

describe("probador reducer reset", () => {
  it("should go back to elegir when resetting without a preselection", () => {
    const next = reducer(resultState, { type: "reset" });
    expect(next.view).toEqual({ step: "elegir" });
  });

  it("should go back to foto with the URL costume when resetting with a preselection", () => {
    const next = reducer(resultState, { type: "reset", slug: "pancho" });
    expect(next.view).toEqual({
      step: "foto",
      slug: "pancho",
      photo: null,
      consent: false,
      photoError: null,
    });
  });

  it("should ignore late responses from the previous run when resetting", () => {
    const next = reducer(resultState, { type: "reset" });
    const late = reducer(next, {
      type: "card",
      run: resultState.run,
      index: 0,
      status: { kind: "pending" },
    });
    expect(late).toBe(next);
    expect(next.run).toBeGreaterThan(resultState.run);
  });

  it("should match the initial state shape when resetting a fresh state", () => {
    const next = reducer(initialState(undefined), { type: "reset" });
    expect(next.view).toEqual(initialState(undefined).view);
  });
});
