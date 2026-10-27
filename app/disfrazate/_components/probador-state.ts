export type SceneRef = {
  id: string;
  label: string;
  styleId: string;
  styleLabel: string;
};

export type CardStatus =
  | { kind: "pending" }
  | { kind: "ready"; image: string }
  | { kind: "error"; message: string };

export type Card = { scene: SceneRef; status: CardStatus };

export type View =
  | { step: "elegir" }
  | {
      step: "foto";
      slug: string;
      photo: string | null;
      consent: boolean;
      photoError: string | null;
    }
  | { step: "generando"; slug: string; photo: string; cards: Card[] | null }
  | { step: "resultado"; slug: string; photo: string; cards: Card[] }
  | { step: "error"; slug: string; photo: string; message: string };

/** `run` descarta respuestas tardías de una corrida anterior. */
export type State = { run: number; view: View };

export type Action =
  | { type: "pick"; slug: string }
  | { type: "photo"; photo: string }
  | { type: "photoError"; message: string }
  | { type: "clearPhoto" }
  | { type: "consent"; value: boolean }
  | { type: "start" }
  | { type: "scenes"; run: number; scenes: SceneRef[] }
  | { type: "fatal"; run: number; message: string }
  | { type: "card"; run: number; index: number; status: CardStatus }
  | { type: "swap"; run: number; index: number; scene: SceneRef }
  | { type: "reset" };

export function initialState(slug: string | undefined): State {
  return {
    run: 0,
    view:
      slug === undefined
        ? { step: "elegir" }
        : { step: "foto", slug, photo: null, consent: false, photoError: null },
  };
}

function withCard(cards: Card[], index: number, status: CardStatus): Card[] {
  return cards.map((card, i) => (i === index ? { ...card, status } : card));
}

export function reducer(state: State, action: Action): State {
  const { view } = state;
  switch (action.type) {
    case "pick":
      return {
        ...state,
        view: {
          step: "foto",
          slug: action.slug,
          photo: null,
          consent: false,
          photoError: null,
        },
      };
    case "photo":
      return view.step === "foto"
        ? { ...state, view: { ...view, photo: action.photo, photoError: null } }
        : state;
    case "photoError":
      return view.step === "foto"
        ? { ...state, view: { ...view, photoError: action.message } }
        : state;
    case "clearPhoto":
      return view.step === "foto"
        ? { ...state, view: { ...view, photo: null, consent: false } }
        : state;
    case "consent":
      return view.step === "foto"
        ? { ...state, view: { ...view, consent: action.value } }
        : state;
    case "start":
      if (view.step === "foto" && view.photo !== null && view.consent) {
        return {
          run: state.run + 1,
          view: {
            step: "generando",
            slug: view.slug,
            photo: view.photo,
            cards: null,
          },
        };
      }
      if (view.step === "error") {
        return {
          run: state.run + 1,
          view: {
            step: "generando",
            slug: view.slug,
            photo: view.photo,
            cards: null,
          },
        };
      }
      return state;
    case "scenes":
      if (action.run !== state.run || view.step !== "generando") return state;
      return {
        ...state,
        view: {
          ...view,
          cards: action.scenes.map((scene) => ({
            scene,
            status: { kind: "pending" },
          })),
        },
      };
    case "fatal":
      if (action.run !== state.run) return state;
      if (view.step !== "generando") return state;
      return {
        ...state,
        view: {
          step: "error",
          slug: view.slug,
          photo: view.photo,
          message: action.message,
        },
      };
    case "card": {
      if (action.run !== state.run) return state;
      if (view.step !== "generando" && view.step !== "resultado") return state;
      if (view.cards === null) return state;
      const cards = withCard(view.cards, action.index, action.status);
      const settled = cards.every((card) => card.status.kind !== "pending");
      if (view.step === "generando" && settled) {
        return { ...state, view: { ...view, step: "resultado", cards } };
      }
      return { ...state, view: { ...view, cards } };
    }
    case "swap": {
      if (action.run !== state.run || view.step !== "resultado") return state;
      const cards = view.cards.map((card, i) =>
        i === action.index
          ? { scene: action.scene, status: { kind: "pending" as const } }
          : card,
      );
      return { ...state, view: { ...view, cards } };
    }
    case "reset":
      return { run: state.run + 1, view: { step: "elegir" } };
  }
}
