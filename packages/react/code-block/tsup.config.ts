import { defineConfig } from "tsup";

export default defineConfig({
	entry: {
		index: "src/index.ts",
		server: "src/server.ts",
	},
	format: ["esm"],
	dts: true,
  treeshake: true,
	sourcemap: true,
	clean: true,
	splitting: false,
	external: ["react", "react-dom"],
	noExternal: ["shiki"]
});
