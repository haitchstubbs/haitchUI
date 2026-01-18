import { defineConfig, mergeConfig } from "vitest/config";
import { vitestBaseConfig } from "@haitch-ui/tests/vitest-config";

export default mergeConfig(
  vitestBaseConfig,
  defineConfig({
    // package-specific config here (if any)
    test: {
      include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    },
  })
);