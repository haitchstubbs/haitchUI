import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export const vitestBaseConfig = {
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["@haitch-ui/tests/vitest-setup"],
    globals: true,
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
  },
};

export default defineConfig(vitestBaseConfig);
