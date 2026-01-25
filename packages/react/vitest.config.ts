import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, mergeConfig } from "vitest/config";
import { vitestBaseConfig } from "@haitch-ui/tests/vitest-config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const monorepoRoot = path.resolve(__dirname, "..", "..");

export default mergeConfig(
	vitestBaseConfig,
	defineConfig({
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "src"),
				react: path.resolve(monorepoRoot, "node_modules/react"),
				"react-dom": path.resolve(monorepoRoot, "node_modules/react-dom"),
			},
			dedupe: ["react", "react-dom"],
		},
		test: {
			include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
		},
	})
);
