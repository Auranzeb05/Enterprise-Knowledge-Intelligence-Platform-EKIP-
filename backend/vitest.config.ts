import {
  defineConfig,
} from "vitest/config";

export default defineConfig({
  test: {
    environment:
      "node",

    globals:
      false,

    setupFiles: [
      "./tests/setup.ts"
    ],

    include: [
      "tests/**/*.test.ts"
    ],

    testTimeout:
      10000,

    hookTimeout:
      10000,

    restoreMocks:
      true,

    clearMocks:
      true,

    mockReset:
      true,
  },
});
