"use client";

import { useLayoutEffect, useReducer, useRef } from "react";
import { requestImage, requestScenes } from "./api-client";
import { CostumePicker, type CostumeOption } from "./CostumePicker";
import { GeneratingLog } from "./GeneratingLog";
import { PhotoStep } from "./PhotoStep";
import { initialState, reducer, type SceneRef } from "./probador-state";
import { ResultCard } from "./ResultCard";

type ProbadorProps = {
  /** Slug que viene de ?disfraz=, ya validado en el server. */
  initialSlug?: string;
  costumes: readonly CostumeOption[];
};

export function Probador({ initialSlug, costumes }: ProbadorProps) {
  const [state, dispatch] = useReducer(reducer, initialSlug, initialState);
  const { view, run } = state;
  const abortRef = useRef<AbortController | null>(null);

  // Con cacheComponents Next oculta la ruta con <Activity> en vez de
  // desmontarla: el useReducer sobrevive a la navegación. Al ocultarse se
  // ejecuta este cleanup (sincronización con el ciclo de vida de Activity):
  // cancela lo que esté en vuelo y vuelve al estado inicial.
  useLayoutEffect(
    () => () => {
      abortRef.current?.abort();
      abortRef.current = null;
      dispatch({ type: "reset", slug: initialSlug });
    },
    [initialSlug],
  );

  function currentSignal(): AbortSignal {
    if (abortRef.current === null || abortRef.current.signal.aborted) {
      abortRef.current = new AbortController();
    }
    return abortRef.current.signal;
  }

  function nameOf(slug: string): string {
    return costumes.find((costume) => costume.slug === slug)?.name ?? slug;
  }

  function photoOf(slug: string): string | null {
    return costumes.find((costume) => costume.slug === slug)?.photo ?? null;
  }

  async function generateCard(
    forRun: number,
    index: number,
    slug: string,
    photo: string,
    scene: SceneRef,
  ) {
    const outcome = await requestImage({
      photo,
      costumeSlug: slug,
      scene,
      signal: currentSignal(),
    });
    dispatch({
      type: "card",
      run: forRun,
      index,
      status: outcome.ok
        ? { kind: "ready", image: outcome.value }
        : { kind: "error", message: outcome.message },
    });
  }

  async function generateAll(forRun: number, slug: string, photo: string) {
    const outcome = await requestScenes(slug, 4, [], currentSignal());
    if (!outcome.ok) {
      dispatch({ type: "fatal", run: forRun, message: outcome.message });
      return;
    }
    dispatch({ type: "scenes", run: forRun, scenes: outcome.value });
    // Las 4 en paralelo: cada tarjeta se actualiza apenas llega su respuesta.
    await Promise.all(
      outcome.value.map((scene, index) =>
        generateCard(forRun, index, slug, photo, scene),
      ),
    );
  }

  function handleStart() {
    if (view.step === "foto" && view.photo !== null && view.consent) {
      dispatch({ type: "start" });
      void generateAll(run + 1, view.slug, view.photo);
    } else if (view.step === "error") {
      dispatch({ type: "start" });
      void generateAll(run + 1, view.slug, view.photo);
    }
  }

  function handleRetry(index: number) {
    if (view.step !== "resultado") return;
    const card = view.cards[index];
    if (!card) return;
    dispatch({ type: "card", run, index, status: { kind: "pending" } });
    void generateCard(run, index, view.slug, view.photo, card.scene);
  }

  async function handleOtherScene(index: number) {
    if (view.step !== "resultado") return;
    const { slug, photo, cards } = view;
    const current = run;
    dispatch({
      type: "card",
      run: current,
      index,
      status: { kind: "pending" },
    });
    const outcome = await requestScenes(
      slug,
      1,
      cards.map((card) => card.scene.id),
      currentSignal(),
    );
    const scene = outcome.ok ? outcome.value[0] : undefined;
    if (!outcome.ok || !scene) {
      dispatch({
        type: "card",
        run: current,
        index,
        status: {
          kind: "error",
          message: outcome.ok ? "No llegó la escena" : outcome.message,
        },
      });
      return;
    }
    dispatch({ type: "swap", run: current, index, scene });
    await generateCard(current, index, slug, photo, scene);
  }

  let announcement = "";
  switch (view.step) {
    case "elegir":
      announcement = "Elegí un disfraz";
      break;
    case "foto":
      announcement = `Subí tu foto para el disfraz de ${nameOf(view.slug)}`;
      break;
    case "generando":
      announcement = "Armando tus disfraces";
      break;
    case "resultado":
      announcement = "Tus disfraces están listos";
      break;
    case "error":
      announcement = "Hubo un error";
      break;
  }

  return (
    <div className="flex flex-col gap-10">
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {view.step === "elegir" ? (
        <section className="flex flex-col gap-8">
          <h2 className="display text-h3">¿De qué te disfrazás?</h2>
          <CostumePicker
            key={run}
            costumes={costumes}
            onPick={(slug) => dispatch({ type: "pick", slug })}
          />
        </section>
      ) : null}

      {view.step === "foto" ? (
        <PhotoStep
          costumeName={nameOf(view.slug)}
          costumePhoto={photoOf(view.slug)}
          photo={view.photo}
          consent={view.consent}
          photoError={view.photoError}
          onPhoto={(photo) => dispatch({ type: "photo", photo })}
          onPhotoError={(message) => dispatch({ type: "photoError", message })}
          onClearPhoto={() => dispatch({ type: "clearPhoto" })}
          onConsent={(value) => dispatch({ type: "consent", value })}
          onSubmit={handleStart}
          onBack={() => dispatch({ type: "reset" })}
        />
      ) : null}

      {view.step === "generando" || view.step === "resultado" ? (
        <section className="flex flex-col gap-8">
          <h2 className="display text-h3">
            {view.step === "generando"
              ? `Armando tu disfraz de ${nameOf(view.slug)}`
              : `Tu disfraz de ${nameOf(view.slug)}`}
          </h2>
          {view.step === "generando" ? <GeneratingLog /> : null}
          {view.cards ? (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {view.cards.map((card, index) => (
                <ResultCard
                  key={index}
                  card={card}
                  index={index}
                  costumeSlug={view.slug}
                  onRetry={() => handleRetry(index)}
                  onOtherScene={() => void handleOtherScene(index)}
                />
              ))}
            </ul>
          ) : null}
          {view.step === "resultado" ? (
            <button
              type="button"
              onClick={() => dispatch({ type: "reset" })}
              className="btn press self-start"
            >
              Probar otro disfraz
            </button>
          ) : null}
        </section>
      ) : null}

      {view.step === "error" ? (
        <section className="flex flex-col items-start gap-6">
          <h2 className="display text-h3">Se trabó el probador</h2>
          <p role="alert" className="max-w-xl">
            {view.message}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleStart}
              className="btn btn-accent press"
            >
              Probar de nuevo
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "reset" })}
              className="btn press"
            >
              Elegir otro disfraz
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
