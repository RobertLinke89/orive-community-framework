import fs from "fs";
import path from "path";
import { defineConfig } from "vitest/config";

// Local audit copy only: stubs for files that were not fetched (absent in the real repo -> no alias).
const stubs = path.resolve(__dirname, ".audit-stubs");
const stubAliases = fs.existsSync(stubs)
  ? [
      { find: "@/lib/chatCreditEngine", replacement: path.join(stubs, "lib/chatCreditEngine.ts") },
      { find: "@/hooks/usePublicOfferings", replacement: path.join(stubs, "hooks/usePublicOfferings.ts") },
    ]
  : [];

export default defineConfig({
  esbuild: { jsx: "automatic", tsconfigRaw: { compilerOptions: { target: "es2020" } } },
  resolve: { alias: [...stubAliases, { find: /^@\/(.*)$/, replacement: path.resolve(__dirname, "src/$1") }] },
  test: { environment: "node", include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"], setupFiles: ["tests/support/env.ts"] },
});
