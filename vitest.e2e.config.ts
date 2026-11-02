import base from "./vitest.config";
import { defineConfig } from "vitest/config";

// Real Stripe TEST-MODE run against LOCAL Postgres. Opt-in only: npx vitest run -c vitest.e2e.config.ts
export default defineConfig({
  ...base,
  test: { ...base.test, include: ["tests/e2e/**/*.e2e.ts"], testTimeout: 180_000, hookTimeout: 180_000, fileParallelism: false },
});
