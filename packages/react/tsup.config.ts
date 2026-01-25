import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "tsup";

const entries: Record<string, string> = { index: "src/index.ts" };
const srcRoot = path.resolve("src");

function addEntriesFromDir(rootDir: string) {
  for (const dirent of readdirSync(rootDir, { withFileTypes: true })) {
    if (!dirent.isDirectory()) continue;
    const dirPath = path.join(rootDir, dirent.name);
    const indexRootTs = path.join(dirPath, "index.ts");
    const indexRootTsx = path.join(dirPath, "index.tsx");
    const indexSrcTs = path.join(dirPath, "src", "index.ts");
    const indexSrcTsx = path.join(dirPath, "src", "index.tsx");
    const serverRootTs = path.join(dirPath, "server.ts");
    const serverRootTsx = path.join(dirPath, "server.tsx");
    const serverSrcTs = path.join(dirPath, "src", "server.ts");
    const serverSrcTsx = path.join(dirPath, "src", "server.tsx");

    if (existsSync(indexRootTs)) entries[dirent.name] = indexRootTs;
    else if (existsSync(indexRootTsx)) entries[dirent.name] = indexRootTsx;
    else if (existsSync(indexSrcTs)) entries[dirent.name] = indexSrcTs;
    else if (existsSync(indexSrcTsx)) entries[dirent.name] = indexSrcTsx;

    if (existsSync(serverRootTs)) entries[`${dirent.name}/server`] = serverRootTs;
    else if (existsSync(serverRootTsx)) entries[`${dirent.name}/server`] = serverRootTsx;
    else if (existsSync(serverSrcTs)) entries[`${dirent.name}/server`] = serverSrcTs;
    else if (existsSync(serverSrcTsx)) entries[`${dirent.name}/server`] = serverSrcTsx;
  }
}

addEntriesFromDir(srcRoot);
addEntriesFromDir(path.join(srcRoot, "primitives"));

export default defineConfig({
  entry: entries,
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  external: [
    "react",
    "react-dom",
    "@tanstack/react-table",
    "@tanstack/react-virtual",
    "shiki",
    /^@haitch-ui\/react(\/.*)?$/,
  ],
});
