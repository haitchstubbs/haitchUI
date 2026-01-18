import { defineConfig, type ViteUserConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export const vitestBaseConfig = {
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["@haitch-ui/tests/vitest-setup"], // ✅ exported subpath (no .ts)
    globals: true,
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
  },
} satisfies ViteUserConfig;

export default defineConfig(vitestBaseConfig);
