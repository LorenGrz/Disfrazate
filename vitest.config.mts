import path from "node:path";
import { defineConfig } from "vitest/config";

const root = import.meta.dirname;

export default defineConfig({
  resolve: {
    alias: {
      // Los módulos *.server.ts importan "server-only", que lanza fuera de Next.
      "server-only": path.join(root, "test/server-only-stub.ts"),
      "@": root,
    },
  },
});
