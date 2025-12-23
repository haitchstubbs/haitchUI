import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@ui": path.resolve(__dirname, "../packages/ui"),
      "@haitch/ui": path.resolve(__dirname, "../ui/src/index.ts"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
  },
});
