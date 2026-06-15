import { defineConfig } from "vitest/config";

// atoms 解析是純函式 → node 環境即可(不需 jsdom)。
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: { provider: "v8", include: ["src/lib/**"] },
  },
});
