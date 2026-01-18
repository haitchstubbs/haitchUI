import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "tsup";

const entries: Record<string, string> = { index: "src/index.ts" };
const srcRoot = path.resolve("src");

for (const dirent of readdirSync(srcRoot, { withFileTypes: true })) {
  if (!dirent.isDirectory()) continue;
  const base = path.join("src", dirent.name, "src");
  const indexTs = path.join(base, "index.ts");
  const indexTsx = path.join(base, "index.tsx");
  const serverTs = path.join(base, "server.ts");
  const serverTsx = path.join(base, "server.tsx");

  if (existsSync(indexTs)) entries[dirent.name] = indexTs;
  else if (existsSync(indexTsx)) entries[dirent.name] = indexTsx;

  if (existsSync(serverTs)) entries[`${dirent.name}/server`] = serverTs;
  else if (existsSync(serverTsx)) entries[`${dirent.name}/server`] = serverTsx;
}

export default defineConfig({
  entry: entries,
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  external: ["react", "react-dom"],
});
