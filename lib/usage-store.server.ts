import "server-only";
import { getEnv } from "./env.server";

export interface UsageStore {
  getSceneUsage(): Promise<Record<string, number>>;
  incrementScenes(ids: readonly string[]): Promise<void>;
  /** Reserva una generación; false si se alcanzó MAX_GENERATIONS. */
  tryConsumeGeneration(): Promise<boolean>;
  /** null si no hay tope. */
  generationsLeft(): Promise<number | null>;
}

type MemoryState = { scenes: Map<string, number>; generations: number };

function createMemoryUsageStore(state: MemoryState): UsageStore {
  return {
    getSceneUsage() {
      return Promise.resolve(Object.fromEntries(state.scenes));
    },
    incrementScenes(ids) {
      for (const id of ids) {
        state.scenes.set(id, (state.scenes.get(id) ?? 0) + 1);
      }
      return Promise.resolve();
    },
    tryConsumeGeneration() {
      const max = getEnv().MAX_GENERATIONS;
      if (max !== undefined && state.generations >= max) {
        return Promise.resolve(false);
      }
      state.generations += 1;
      return Promise.resolve(true);
    },
    generationsLeft() {
      const max = getEnv().MAX_GENERATIONS;
      if (max === undefined) return Promise.resolve(null);
      return Promise.resolve(Math.max(0, max - state.generations));
    },
  };
}

// En memoria del proceso (fase 2). Se cuelga de globalThis para sobrevivir al
// hot reload en dev. En fase 3 se reemplaza por una implementación en Supabase.
const globalKey = Symbol.for("disfrazate.usage");
type GlobalWithUsage = typeof globalThis & { [globalKey]?: MemoryState };

export function getUsageStore(): UsageStore {
  const holder = globalThis as GlobalWithUsage;
  holder[globalKey] ??= { scenes: new Map(), generations: 0 };
  return createMemoryUsageStore(holder[globalKey]);
}
