import { defineConfig } from "tsup";

export default defineConfig([
  // server + shared entry (DTS generated here)
  {
    entry: {
      index: "src/index.ts",
      client: "src/client.ts",
      server: "src/server.ts",
    },
    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    outDir: "dist",
    splitting: false,
    bundle: true,
  },

  // client entry — bundled with banner, but NO DTS here
  {
    entry: ["src/client.ts"],
    format: ["esm"],
    dts: false, // ✅ critical
    sourcemap: true,
    clean: false,
    outDir: "dist",
    splitting: false,
    bundle: true,
    esbuildOptions(options) {
      options.banner = {
        js: `"use client";\n`,
      };
    },
  },
]);
