import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { highlight } from "@haitch-ui/react-code-block/server";

function isAllowedUiFile(filePath: string) {
	if (filePath.includes("..")) return false;
	return (
		filePath.startsWith("apps/web/components/ui/") &&
		(filePath.endsWith(".ts") || filePath.endsWith(".tsx"))
	);
}

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

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const filePath = searchParams.get("path") ?? "";
	const theme = (searchParams.get("theme") ?? "github-dark").trim() || "github-dark";
	const numbered = (searchParams.get("numbered") ?? "1") !== "0";

	if (!isAllowedUiFile(filePath)) {
		return NextResponse.json({ error: "Invalid path" }, { status: 400 });
	}

	const repoRoot = await findRepoRoot(process.cwd());
	const abs = path.join(repoRoot, filePath);

	const code = await fs.readFile(abs, "utf8");
	const lang = filePath.endsWith(".tsx") ? "tsx" : "ts";

	const highlightedHtml = await highlight(code, lang, numbered, { theme });

	return NextResponse.json({ path: filePath, lang, code, highlightedHtml });
}
