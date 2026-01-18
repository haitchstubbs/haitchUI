import { highlight } from "@haitch-ui/react-code-block/server";
import { promises as fs } from "fs";
import path from "path";

import { GitHubCodeInspector, type InspectorFile, type InspectorTreeNode } from "./github-code-inspector";

type SearchParams = Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;

async function pathExists(p: string) {
	try {
		await fs.access(p);
		return true;
	} catch {
		return false;
	}
}

async function findRepoRoot(startDir: string) {
	let dir = startDir;
	while (true) {
		const hasWorkspace = await pathExists(path.join(dir, "pnpm-workspace.yaml"));
		const hasTurbo = await pathExists(path.join(dir, "turbo.json"));
		const hasGit = await pathExists(path.join(dir, ".git"));
		if (hasWorkspace || hasTurbo || hasGit) return dir;

		const parent = path.dirname(dir);
		if (parent === dir) return startDir;
		dir = parent;
	}
}

function toPosixPath(p: string) {
	return p.split(path.sep).join("/");
}

async function listFilesRecursive(absDir: string): Promise<string[]> {
	const out: string[] = [];
	const entries = await fs.readdir(absDir, { withFileTypes: true });
	for (const entry of entries) {
		const absPath = path.join(absDir, entry.name);
		if (entry.isDirectory()) {
			out.push(...(await listFilesRecursive(absPath)));
			continue;
		}
		out.push(absPath);
	}
	return out;
}

function buildTreeFromPaths(paths: string[]): InspectorTreeNode[] {
	type FolderNode = Extract<InspectorTreeNode, { type: "folder" }> & { children: InspectorTreeNode[] };

	const root: FolderNode = { type: "folder", name: "", path: "", children: [] };
	const folders = new Map<string, FolderNode>([["", root]]);

	const ensureFolder = (folderPath: string, name: string): FolderNode => {
		const existing = folders.get(folderPath);
		if (existing) return existing;

		const parentPath = folderPath.split("/").slice(0, -1).join("/");
		const parent = ensureFolder(parentPath, parentPath.split("/").pop() ?? "");
		const node: FolderNode = { type: "folder", name, path: folderPath, children: [] };
		parent.children.push(node);
		folders.set(folderPath, node);
		return node;
	};

	for (const filePath of paths) {
		const parts = filePath.split("/").filter(Boolean);
		const fileName = parts.at(-1);
		if (!fileName) continue;

		const folderParts = parts.slice(0, -1);
		let folderPath = "";
		for (const part of folderParts) {
			folderPath = folderPath ? `${folderPath}/${part}` : part;
			ensureFolder(folderPath, part);
		}

		const parent = folders.get(folderPath) ?? root;
		parent.children.push({ type: "file", name: fileName, path: filePath });
	}

	const sortTree = (nodes: InspectorTreeNode[]) => {
		nodes.sort((a, b) => {
			if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
			return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
		});
		for (const node of nodes) {
			if (node.type === "folder") sortTree(node.children);
		}
	};
	sortTree(root.children);
	return root.children;
}

function isAllowedUiFile(filePath: string) {
	if (filePath.includes("..")) return false;
	return filePath.startsWith("apps/web/components/ui/") && (filePath.endsWith(".ts") || filePath.endsWith(".tsx"));
}

export default async function BlocksPage({ searchParams }: { searchParams: SearchParams }) {
	const resolvedSearchParams = await Promise.resolve(searchParams);
	const repoRoot = await findRepoRoot(process.cwd());
	const uiDir = path.join(repoRoot, "apps", "web", "components", "ui");

	if (!(await pathExists(uiDir))) {
		throw new Error(`UI directory not found: ${uiDir}`);
	}

	const absFiles = await listFilesRecursive(uiDir);
	const uiFiles = absFiles
		.map((absPath) => toPosixPath(path.relative(repoRoot, absPath)))
		.filter((p) => isAllowedUiFile(p))
		.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

	const fileSet = new Set(uiFiles);
	const requestedPathRaw = resolvedSearchParams.path;
	const requestedPath = typeof requestedPathRaw === "string" ? requestedPathRaw : undefined;

	const defaultPath = uiFiles.find((p) => p.endsWith("/item.tsx")) ?? uiFiles[0] ?? "apps/web/components/ui/item.tsx";
	const selectedPath = requestedPath && fileSet.has(requestedPath) ? requestedPath : defaultPath;

	const absSelected = path.join(repoRoot, selectedPath);
	const code = await fs.readFile(absSelected, "utf8");
	const lang = selectedPath.endsWith(".tsx") ? "tsx" : "ts";

	const tree = buildTreeFromPaths(uiFiles);
	const file: InspectorFile = { path: selectedPath, code, lang };

	return (
		<section className="bg-background w-full p-6 md:p-10">
			<div className="mx-auto w-full max-w-7xl">
				<GitHubCodeInspector
					repo={{ owner: "haitch-ui", name: "haitchUI", visibility: "Public" }}
					branch="main"
					tree={tree}
					selectedPath={selectedPath}
					file={file}
				/>
			</div>
		</section>
	);
}
