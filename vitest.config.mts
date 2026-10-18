import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node", include: ["tests/unit/**/*.test.ts", "app/billing/**/*.test.ts", "src/lib/billing/**/*.test.ts"] },
});
