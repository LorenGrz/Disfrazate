import {
  sceneCategories,
  scenes,
  styles,
  type Scene,
  type Style,
} from "./scenes";

export type PickedScene = { scene: Scene; style: Style };

function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = copy[i];
    const b = copy[j];
    if (a === undefined || b === undefined) continue;
    copy[i] = b;
    copy[j] = a;
  }
  return copy;
}

/**
 * Elige `n` escenas de `n` categorías distintas. En cada categoría toma la de
 * menor uso (desempate con `rng`) y le asigna un estilo al azar. `exclude`
 * (ids de escena) sirve para "otra escena": esas escenas no se vuelven a elegir.
 * Pura: todo el azar viene de `rng`.
 */
export function pickScenes(
  usage: Record<string, number>,
  rng: () => number,
  n = 4,
  exclude: readonly string[] = [],
): PickedScene[] {
  const count = Math.min(n, sceneCategories.length);
  const picked: PickedScene[] = [];
  for (const category of shuffle(sceneCategories, rng)) {
    if (picked.length === count) break;
    const candidates = scenes.filter(
      (scene) => scene.category === category && !exclude.includes(scene.id),
    );
    if (candidates.length === 0) continue;
    const least = Math.min(...candidates.map((scene) => usage[scene.id] ?? 0));
    const tied = candidates.filter((scene) => (usage[scene.id] ?? 0) === least);
    const scene = shuffle(tied, rng)[0];
    const style = styles[Math.floor(rng() * styles.length)];
    if (scene === undefined || style === undefined) continue;
    picked.push({ scene, style });
  }
  return picked;
}
