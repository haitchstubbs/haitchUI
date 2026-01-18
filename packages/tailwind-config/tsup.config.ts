import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/config/tailwind.config.ts"
    // add other entrypoints you want to export
  ],
  format: ["esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: "dist",
});
