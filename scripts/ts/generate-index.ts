import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "../../packages/react/src/primitives");
const OUT_FILE = path.join(ROOT, "index.tsx");

function pascalCaseFromPath(relPath: string) {
  // "alert-dialog" -> "AlertDialog", "forms/input" -> "FormsInput"
  return relPath
    .split(/[\/\\]/g)
    .filter(Boolean)
    .map((segment) =>
      segment
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join("")
    )
    .join("");
}

function walkForIndexDirs(dir: string, results: string[] = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      walkForIndexDirs(full, results);
      continue;
    }

    if (entry.isFile() && ( entry.name === "index.ts" || entry.name === "index.tsx")) {
      const containingDir = path.dirname(full);
      if (path.resolve(full) === path.resolve(OUT_FILE)) continue;
      results.push(containingDir);
    }
  }

  return results;
}

const indexDirs = walkForIndexDirs(ROOT);

// Convert dirs -> "./relative/path"
const relDirs = Array.from(
  new Set(
    indexDirs
      .map((d) => path.relative(ROOT, d))
      .filter((r) => r && r !== ".")
  )
).sort((a, b) => a.localeCompare(b));

const lines = relDirs.map((rel) => {
  const importPath = "./" + rel.split(path.sep).join("/");
  const ns = pascalCaseFromPath(rel);
  return `export * as ${ns} from "${importPath}";`;
});

fs.writeFileSync(OUT_FILE, lines.join("\n") + "\n", "utf8");
console.log(`Generated: ${OUT_FILE}`);
console.log(`Namespaces: ${lines.length}`);
