#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

type Options = {
    primitive: string; // e.g. "popover" or "react-popover" (we normalize)
    scope: string; // "@haitch-ui"
    workspaceRoot: string; // repo root
    packagesDir: string; // "packages/react"
    client: boolean;
    deps: string[]; // e.g. ["react-slot","react-compose-refs"]
    peerReact: string; // ">=18"
    addToDocs: boolean;
    docsFilter: string; // pnpm filter for docs app, e.g. "@haitch-ui/docs" or "docs"
    dryRun: boolean;
};

function parseArgs(argv: string[]): Options {
    const args = argv.slice(2);

    const get = (flag: string): string | undefined => {
        const idx = args.indexOf(flag);
        if (idx === -1) return undefined;
        const val = args[idx + 1];
        if (!val || val.startsWith("--")) return undefined;
        return val;
    };

    const has = (flag: string): boolean => args.includes(flag);

    const primitive = get("--name") ?? get("--primitive") ?? args[0];
    if (!primitive) {
        throw new Error(`Missing primitive name.\n\nUsage:\n  pnpm tsx tools/scaffold-primitive.ts popover --deps react-slot,react-compose-refs\n`);
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return {
        primitive,
        scope: get("--scope") ?? "@haitch",
        workspaceRoot: get("--root") ?? path.resolve(__dirname, ".."),
        packagesDir: get("--packagesDir") ?? "packages/react",
        client: !has("--server"),
        deps: (get("--deps") ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        peerReact: get("--peerReact") ?? ">=18",
        addToDocs: has("--add-to-docs"),
        docsFilter: get("--docs-filter") ?? "docs",
        dryRun: has("--dry-run"),
    };
}

function normalizePrimitiveName(input: string): string {
    // Allow "react-popover" or "@haitch-ui/react-popover" or "popover" -> "popover"
    const s = input.trim();
    const withoutScope = s.includes("/") ? (s.split("/").slice(-1)[0] ?? s) : s;
    const withoutPrefix = withoutScope.startsWith("react-") ? withoutScope.slice("react-".length) : withoutScope;
    if (!/^[a-z0-9-]+$/.test(withoutPrefix)) {
        throw new Error(`Invalid primitive "${input}". Use lowercase letters, numbers, and dashes only.`);
    }
    return withoutPrefix;
}

function pkgName(scope: string, primitive: string): string {
    return `${scope}/react-${primitive}`;
}

function wsDepName(scope: string, dep: string): string {
    // dep accepts "react-slot" or "@haitch-ui/react-slot" or "slot"
    const d = dep.trim();
    if (d.startsWith(`${scope}/`)) return d;
    if (d.startsWith("react-")) return `${scope}/${d}`;
    return `${scope}/react-${d}`;
}

async function pathExists(p: string): Promise<boolean> {
    try {
        await fs.access(p);
        return true;
    } catch {
        return false;
    }
}

async function writeFileEnsuringDir(filePath: string, content: string, dryRun: boolean) {
    if (dryRun) return;
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, "utf8");
}

async function runCommand(cwd: string, cmd: string, args: string[], dryRun: boolean): Promise<void> {
    if (dryRun) return;

    await new Promise<void>((resolve, reject) => {
        const child = spawn(cmd, args, { cwd, stdio: "inherit", shell: false });
        child.on("error", reject);
        child.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`${cmd} ${args.join(" ")} exited with ${code}`));
        });
    });
}

function formatJson(obj: unknown): string {
    return JSON.stringify(obj, null, 2) + "\n";
}

async function main() {
    const opts = parseArgs(process.argv);
    const primitive = normalizePrimitiveName(opts.primitive);

    const packageName = pkgName(opts.scope, primitive);
    const packageDir = path.join(opts.workspaceRoot, opts.packagesDir, primitive);

    const srcDir = path.join(packageDir, "src");
    const indexPath = path.join(srcDir, "index.ts");
    const primitiveFilePath = path.join(srcDir, `${primitive}.ts`);
    const pkgJsonPath = path.join(packageDir, "package.json");
    const tsupPath = path.join(packageDir, "tsup.config.ts");
    const tsconfigPath = path.join(packageDir, "tsconfig.json");
    const readmePath = path.join(packageDir, "README.md");

    if (await pathExists(packageDir)) {
        throw new Error(`Package directory already exists: ${packageDir}`);
    }

    const deps = opts.deps.map((d) => wsDepName(opts.scope, d));
    const dependencies: Record<string, string> = {};
    for (const d of deps) dependencies[d] = "workspace:*";

    const packageJson = {
        name: packageName,
        version: "0.0.0",
        private: false,
        type: "module",
        sideEffects: false,
        files: ["dist"],
        exports: {
            ".": {
                types: "./dist/index.d.ts",
                default: "./dist/index.js",
            },
        },
        main: "./dist/index.js",
        types: "./dist/index.d.ts",
        peerDependencies: {
            react: opts.peerReact,
            ...(primitive === "popover" || primitive === "tooltip" ? { "react-dom": opts.peerReact } : {}),
        },
        dependencies: Object.keys(dependencies).length ? dependencies : undefined,
        scripts: {
            build: "tsup",
            dev: "tsup --watch",
            "check-types": "tsc -p tsconfig.json --noEmit",
            lint: "eslint .",
            test: "vitest run",
        },
    };

    // Clean undefined fields (so package.json stays neat)
    const packageJsonClean = JSON.parse(JSON.stringify(packageJson));

    const tsupConfig = `import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  external: ["react", "react-dom"]
});
`;

    // NOTE: This assumes you have a root tsconfig.base.json.
    // If yours is elsewhere, pass --root and/or change this template.
    const tsconfig = {
        extends: "@haitch-ui/typescript-config/base.json",
        compilerOptions: {
            rootDir: "src",
            outDir: "dist",
            jsx: "react-jsx",
        },
        include: ["src"],
    };

    const useClient = opts.client ? `"use client";\n\n` : "";
    const indexTs = `${useClient}export * from "./${primitive}.js";
`;

    const primitiveTs = `${useClient}export type ${toPascal(primitive)}Props = {
  /** Example prop; replace me */
  children?: React.ReactNode;
};

import * as React from "react";

export function ${toPascal(primitive)}(props: ${toPascal(primitive)}Props) {
  return <>{props.children}</>;
}
`;

    const readme = `# ${packageName}

Scaffolded primitive package.

## Install
\`\`\`sh
pnpm add ${packageName}
\`\`\`
`;

    // Dry-run output summary
    const planned = [pkgJsonPath, tsupPath, tsconfigPath, indexPath, primitiveFilePath, readmePath];

    if (opts.dryRun) {
        console.log("Dry run: would create:");
        for (const p of planned) console.log("  -", path.relative(opts.workspaceRoot, p));
        console.log("\nPackage name:", packageName);
        if (deps.length) console.log("Workspace deps:", deps.join(", "));
        console.log("Client package:", opts.client);
        if (opts.addToDocs) console.log("Would add dependency to docs filter:", opts.docsFilter);
        return;
    }

    // Write files
    await writeFileEnsuringDir(pkgJsonPath, formatJson(packageJsonClean), opts.dryRun);
    await writeFileEnsuringDir(tsupPath, tsupConfig, opts.dryRun);
    await writeFileEnsuringDir(tsconfigPath, formatJson(tsconfig), opts.dryRun);
    await writeFileEnsuringDir(indexPath, indexTs, opts.dryRun);
    await writeFileEnsuringDir(primitiveFilePath, primitiveTs, opts.dryRun);
    await writeFileEnsuringDir(readmePath, readme, opts.dryRun);

    console.log(`✅ Created ${packageName} at ${path.relative(opts.workspaceRoot, packageDir)}`);

    if (opts.addToDocs) {
        // Add as a workspace dependency to docs app
        // Example: pnpm -F docs add @haitch-ui/react-popover@workspace:*
        console.log(`\n📦 Adding to docs (${opts.docsFilter})...`);
        await runCommand(opts.workspaceRoot, "pnpm", ["-F", opts.docsFilter, "add", `${packageName}@workspace:*`], false);
    }

    console.log("\nNext:");
    console.log(`  pnpm -r build --filter ${packageName}`);
    console.log(`  (or) pnpm -r test --filter ${packageName}`);
}

function toPascal(input: string): string {
    return input
        .split("-")
        .filter(Boolean)
        .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
        .join("");
}

main().catch((err) => {
    console.error("❌", err instanceof Error ? err.message : err);
    process.exit(1);
});
