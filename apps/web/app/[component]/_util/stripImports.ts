import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";
import type { Allowlist } from "./allowList";

type Injection = Record<string, unknown>;

export type StripResult = {
	/**
	 * Same program, but with allowed imports removed.
	 */
	codeWithoutImports: string;

	/**
	 * Symbols to inject into the VM scope.
	 * Keys are the *local names* in the template (e.g. Button, cn)
	 */
	injection: Injection;
};

type ImportBinding = {
	moduleId: string;
	imported: string; // export name, or "default"
	local: string; // local identifier name
};

function getHumanImport(binding: ImportBinding) {
	const imported = binding.imported === "default" ? "default" : `{ ${binding.imported} }`;
	return `${imported} from "${binding.moduleId}" as ${binding.local}`;
}

export function stripAndPrepareInjection(sourceCode: string, allowlist: Allowlist): StripResult {
	const ast = parse(sourceCode, {
		sourceType: "module",
		plugins: ["jsx", "typescript"],
	});

	const bindings: ImportBinding[] = [];
	const disallowedImports: string[] = [];

	traverse(ast, {
		ImportDeclaration(path) {
			const node = path.node;
			const moduleId = node.source.value;

			// If the whole import is type-only: `import type { X } from "..."` — ignore it
			if (node.importKind === "type") {
				path.remove();
				return;
			}

			for (const spec of node.specifiers) {
				// `import { type X } from "..."` — ignore type-only specifiers
				if ("importKind" in spec && spec.importKind === "type") {
					continue;
				}

				if (t.isImportNamespaceSpecifier(spec)) {
					disallowedImports.push(`Namespace import is not allowed: import * as ${spec.local.name} from "${moduleId}"`);
					continue;
				}

				if (t.isImportDefaultSpecifier(spec)) {
					bindings.push({ moduleId, imported: "default", local: spec.local.name });
					continue;
				}

				if (t.isImportSpecifier(spec)) {
					const imported = t.isIdentifier(spec.imported) ? spec.imported.name : spec.imported.value;

					bindings.push({ moduleId, imported, local: spec.local.name });
					continue;
				}
			}

			path.remove();
		},
	});

	if (disallowedImports.length) {
		throw new Error(["Template contains disallowed import forms:", ...disallowedImports.map((s) => `- ${s}`)].join("\n"));
	}

	// Validate + build injection map
	const injection: Injection = {};
	const missingModules = new Set<string>();
	const missingExports: Array<{ moduleId: string; exported: string; local: string }> = [];

	for (const b of bindings) {
		const allowedModule = (allowlist as Record<string, unknown>)[b.moduleId];
		if (!allowedModule) {
			missingModules.add(b.moduleId);
			continue;
		}

		const value = (allowedModule as Record<string, unknown>)[b.imported];
		if (value === undefined) {
			missingExports.push({ moduleId: b.moduleId, exported: b.imported, local: b.local });
			continue;
		}

		// Inject by local name used in the template
		injection[b.local] = value;
	}

	if (missingModules.size || missingExports.length) {
		const lines: string[] = ["Template imports are not allowed (not in allowlist)."];

		if (missingModules.size) {
			lines.push("\nDisallowed modules:");
			for (const m of [...missingModules]) lines.push(`- "${m}"`);
		}

		if (missingExports.length) {
			lines.push("\nMissing exports in allowlist:");
			for (const e of missingExports) {
				lines.push(`- ${getHumanImport({ moduleId: e.moduleId, imported: e.exported, local: e.local })}`);
			}
		}

		lines.push("\nFix: add the module/exports to template-allowlist.ts (ALLOWLIST).");

		throw new Error(lines.join("\n"));
	}

	const { code } = generate(ast, {
		retainLines: true,
		comments: true,
		compact: false,
	});

	return {
		codeWithoutImports: code,
		injection,
	};
}
