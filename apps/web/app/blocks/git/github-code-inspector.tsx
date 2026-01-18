"use client";

import Link from "next/link";
import * as React from "react";
import {
	IconBook,
	IconChevronDown,
	IconCopy,
	IconDots,
	IconFile,
	IconFolder,
	IconGitBranch,
	IconGitFork,
	IconSearch,
	IconStar,
} from "@tabler/icons-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Input } from "../../../components/ui/input";
import { Item } from "../../../components/ui/item";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../../../components/ui/resizable";
import {
	Tree,
	TreeItem,
	TreeItemActions,
	TreeItemContent,
	TreeItemIcon,
	TreeItemLink,
	TreeItemRow,
	TreeItemTitle,
	TreeItemToggle,
} from "../../../components/ui/tree";
import {
	CodeBlock,
	CodeBlockCode,
	CodeBlockContent,
	CodeBlockCopy,
	CodeBlockHeader,
	CodeBlockHeaderActions,
	CodeBlockHeaderText,
	CodeBlockTitle,
} from "../../../components/ui/code-block";
import { cn } from "../../../lib/util";
import { Spinner } from "../../../components/ui/spinner";
import { useTheme } from "@haitch-ui/ui";
import { ThemeMap } from "../theme-map";

export type InspectorTreeNode =
	| {
			type: "folder";
			name: string;
			path: string;
			children: InspectorTreeNode[];
	  }
	| {
			type: "file";
			name: string;
			path: string;
	  };

export type InspectorFile = {
	path: string;
	lang: string;
	code: string;
	highlightedHtml?: string;
};

type RepoMeta = {
	owner: string;
	name: string;
	visibility?: "Public" | "Private";
};

function folderValuesForPath(filePath: string) {
	const parts = filePath.split("/").filter(Boolean);
	const folders = parts.slice(0, -1);
	const out: string[] = [];
	let current = "";
	for (const part of folders) {
		current = current ? `${current}/${part}` : part;
		out.push(current);
	}
	return out;
}

function filterTree(nodes: InspectorTreeNode[], q: string): InspectorTreeNode[] {
	const query = q.trim().toLowerCase();
	if (!query) return nodes;

	const walk = (node: InspectorTreeNode): InspectorTreeNode | null => {
		if (node.type === "file") {
			return node.path.toLowerCase().includes(query) ? node : null;
		}

		const nextChildren = node.children.map(walk).filter(Boolean) as InspectorTreeNode[];
		if (nextChildren.length) return { ...node, children: nextChildren };
		return node.name.toLowerCase().includes(query) ? { ...node, children: [] } : null;
	};

	return nodes.map(walk).filter(Boolean) as InspectorTreeNode[];
}

type HighlightApiResponse = {
	path: string;
	lang: string;
	code: string;
	highlightedHtml: string;
};

type UseFileTreeParams = {
	tree: InspectorTreeNode[];
	selectedPath: string;
	initialFile: InspectorFile;
};

export function useFileTreeState({ tree, selectedPath, initialFile }: UseFileTreeParams) {
	const { theme } = useTheme();
	const themeToShikiTheme = ThemeMap(theme ?? "system") ?? "github-dark";
	// UI state
	const [filter, setFilter] = React.useState("");
	const filteredTree = React.useMemo(() => filterTree(tree, filter), [tree, filter]);

	const [expandedValues, setExpandedValues] = React.useState<string[]>(() => folderValuesForPath(selectedPath));
	React.useEffect(() => {
		const required = folderValuesForPath(selectedPath);
		setExpandedValues((prev) => Array.from(new Set([...prev, ...required])));
	}, [selectedPath]);

	// file state (this is what the code panel actually renders)
	const [currentFile, setCurrentFile] = React.useState<InspectorFile>(initialFile);
	const [activeValue, setActiveValue] = React.useState<string>(selectedPath);

	// keep state in sync if the page is navigated server-side (permalink, back/forward, etc.)
	React.useEffect(() => {
		setActiveValue(selectedPath);
		setCurrentFile(initialFile);
	}, [selectedPath, initialFile]);

	// loading + error
	const [loading, setLoading] = React.useState(false);
	const [highlightError, setHighlightError] = React.useState<unknown | null>(null);

	React.useEffect(() => {
		if (!activeValue) return;

		// if user re-clicks the currently loaded file, do nothing
		if (activeValue === currentFile.path && currentFile.highlightedHtml) return;

		let cancelled = false;
		const ctrl = new AbortController();

		const run = async () => {
			setLoading(true);
			setHighlightError(null);

			try {
				const res = await fetch(
					`/api/blocks/highlight?path=${encodeURIComponent(activeValue)}&theme=${encodeURIComponent(
						themeToShikiTheme,
					)}&numbered=1`,
					{ signal: ctrl.signal },
				);

				if (!res.ok) throw new Error(`Highlight failed: ${res.status}`);

				const data: HighlightApiResponse = await res.json();
				if (cancelled) return;

				setCurrentFile({
					path: data.path,
					lang: data.lang,
					code: data.code,
					highlightedHtml: data.highlightedHtml,
				});
			} catch (err) {
				if (cancelled) return;
				setHighlightError(err);
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		run();

		return () => {
			cancelled = true;
			ctrl.abort();
		};
	}, [activeValue, theme, currentFile.path, currentFile.highlightedHtml]);

	const codeHref = React.useMemo(
		() => `/blocks?path=${encodeURIComponent(currentFile.path)}`,
		[currentFile.path],
	);

	return {
		loading,
		highlightError,

		filter,
		setFilter,
		filteredTree,

		activeValue,
		setActiveValue,

		expandedValues,
		setExpandedValues,

		currentFile,
		codeHref,
	};
}

export function GitHubCodeInspector({
	repo,
	branch,
	tree,
	selectedPath,
	file,
}: {
	repo: RepoMeta;
	branch: string;
	tree: InspectorTreeNode[];
	selectedPath: string;
	file: InspectorFile;
}) {
	const {
		loading,
		highlightError,
		filter,
		setFilter,
		filteredTree,
		activeValue,
		setActiveValue,
		expandedValues,
		setExpandedValues,
		currentFile,
		codeHref,
	} = useFileTreeState({
		tree,
		selectedPath,
		initialFile: file,
	});

	return (
		<Item
			variant="outline"
			className={cn(
				"flex-col items-stretch gap-0 overflow-hidden p-0",
				"bg-background shadow-sm",
				"min-h-[640px]",
			)}
		>
			{/* Repo header */}
			<div className="bg-sidebar/60 supports-[backdrop-filter]:bg-sidebar/40 border-b border-border backdrop-blur-sm">
				<div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
					<div className="flex min-w-0 items-center gap-2">
						<IconBook className="text-muted-foreground size-5 shrink-0" />
						<div className="min-w-0">
							<div className="flex min-w-0 items-center gap-2">
								<div className="truncate text-sm font-semibold">
									<span className="text-muted-foreground">{repo.owner}</span>
									<span className="text-muted-foreground"> / </span>
									<span>{repo.name}</span>
								</div>
								{repo.visibility && <Badge variant="outline">{repo.visibility}</Badge>}
							</div>
							<div className="text-muted-foreground text-xs">Embedded code inspector (UI components)</div>
						</div>
					</div>

					<div className="flex flex-1 items-center justify-end gap-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="secondary" size="sm" className="gap-2">
									<IconGitBranch className="size-4" />
									<span className="font-mono text-xs">{branch}</span>
									<IconChevronDown className="size-4 opacity-70" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
									<span className="font-mono text-xs">main</span>
								</DropdownMenuItem>
								<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
									<span className="font-mono text-xs">dev</span>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onSelect={(e) => e.preventDefault()}>View all branches</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<div className="relative hidden min-w-0 max-w-xl flex-1 md:block">
							<IconSearch className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
							<Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Find a file…" className="pl-9" />
						</div>

						<div className="hidden items-center gap-2 lg:flex">
							<Button variant="outline" size="sm" className="gap-2" onClick={() => {}}>
								<IconStar className="size-4" />
								Star
								<span className="text-muted-foreground font-mono text-xs">1.2k</span>
							</Button>
							<Button variant="outline" size="sm" className="gap-2" onClick={() => {}}>
								<IconGitFork className="size-4" />
								Fork
								<span className="text-muted-foreground font-mono text-xs">128</span>
							</Button>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2 px-4 pb-3">
					<Button variant="ghost" size="sm" className="rounded-none border-b-2 border-primary px-3 text-foreground hover:bg-transparent">
						Code
					</Button>
					<Button variant="ghost" size="sm" className="rounded-none border-b-2 border-transparent px-3 text-muted-foreground">
						Issues
						<Badge variant="secondary" className="ml-2">
							12
						</Badge>
					</Button>
					<Button variant="ghost" size="sm" className="rounded-none border-b-2 border-transparent px-3 text-muted-foreground">
						Pull requests
						<Badge variant="secondary" className="ml-2">
							4
						</Badge>
					</Button>
					<div className="ml-auto md:hidden">
						<Button variant="outline" size="sm" asChild>
							<Link href={codeHref}>Open</Link>
						</Button>
					</div>
				</div>
			</div>

			{/* Main split */}
			<ResizablePanelGroup defaultLayout={{
				"panel-1": 28,
				"panel-2": 72
			}} orientation="horizontal" className="min-h-[560px] min-w-0 ">
				<ResizablePanel id="panel-1" defaultSize="25%" minSize="15%" maxSize="85%" className="border-r">
					<div className="flex h-full min-w-0 flex-col bg-sidebar/20">
						<div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
							<div className="text-foreground text-sm font-medium">Files</div>
							<div className="flex items-center gap-1">
								<Button variant="ghost" size="icon-sm" aria-label="More">
									<IconDots className="size-4" />
								</Button>
							</div>
						</div>

						<div className="border-b border-border px-3 py-2 md:hidden">
							<div className="relative">
								<IconSearch className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
								<Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Find a file…" className="pl-9" />
							</div>
						</div>

						<ScrollArea className="min-h-0 flex-1">
							<div className="p-2">
								<Tree
									aria-label="Repository files"
									tabBehavior="roam"
									activeValue={activeValue}
									onActiveValueChange={setActiveValue}
									expandedValues={expandedValues}
									onExpandedValuesChange={setExpandedValues}
								>
									{filteredTree.map((node) => (
										<TreeNode
											key={node.path}
											node={node}
											// selection should follow currentFile, not the original selectedPath prop
											selectedPath={currentFile.path}
											// IMPORTANT: prevent navigation for in-panel switching
											onSelectFile={(p) => setActiveValue(p)}
										/>
									))}
								</Tree>
							</div>
						</ScrollArea>
					</div>
				</ResizablePanel>

				<ResizablePanel id="panel-2" defaultSize="75%" minSize="15%" maxSize="85%" className="flex flex-col">
					<div className="flex h-full min-w-0 flex-col">
						<div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
							<div className="text-muted-foreground text-xs">
								Viewing <span className="text-foreground font-mono">{currentFile.path}</span>
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={async () => {
										await navigator.clipboard.writeText(currentFile.path);
									}}
									className="gap-2"
								>
									<IconCopy className="size-4" />
									Copy path
								</Button>
								<Button variant="outline" size="sm" asChild>
									<Link href={codeHref}>Permalink</Link>
								</Button>
							</div>
						</div>

						<div className="flex-1 min-h-0 min-w-0 p-3 relative">
							<>
							{loading && (
								<div className="absolute inset-0 z-10 grid place-items-center bg-background/60 backdrop-blur-sm">
									<Spinner />
								</div>
							)}
							</>

							<>
							{highlightError && (
								<div className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
									<div className="font-medium">Failed to highlight</div>
									<div className="text-muted-foreground mt-1">
										{highlightError instanceof Error ? highlightError.message : "Unknown error"}
									</div>
								</div>
							)}
							</>

							<>
							{currentFile.highlightedHtml ? (
								<CodeBlock
								code={currentFile.code}
								highlightedHtml={currentFile.highlightedHtml}
								lang={currentFile.lang}
								defaultExpanded
								className="flex h-full min-h-0 min-w-0 flex-col rounded-md border border-border overflow-hidden"
							>
								<CodeBlockHeader className="bg-sidebar/40">
									<CodeBlockHeaderText>
										<CodeBlockTitle className="font-mono text-xs">{currentFile.path}</CodeBlockTitle>
									</CodeBlockHeaderText>
									<CodeBlockHeaderActions>
										<Button asChild variant="ghost" size="icon-sm" aria-label="Copy file contents">
											<CodeBlockCopy>
												<IconCopy className="size-4" />
										</CodeBlockCopy>
									</Button>
									</CodeBlockHeaderActions>
								</CodeBlockHeader>

								<CodeBlockContent className="relative min-h-0 flex-1">
									<CodeBlockCode scrollable maxCollapsedHeightClassName="max-h-none" />
								</CodeBlockContent>
							</CodeBlock>
							) : (
								<Spinner />
							)}
							</>
						</div>
					</div>
				</ResizablePanel>
			</ResizablePanelGroup>
		</Item>
	);
}

function TreeNode({
	node,
	selectedPath,
	onSelectFile,
}: {
	node: InspectorTreeNode;
	selectedPath: string;
	onSelectFile: (path: string) => void;
}) {
	if (node.type === "file") {
		const href = `/blocks?path=${encodeURIComponent(node.path)}`;
		const isSelected = node.path === selectedPath;

		return (
			<TreeItem value={node.path}>
				<TreeItemRow className={cn(isSelected && "bg-accent text-accent-foreground")}>
					<TreeItemToggle className="duration-150 ease-out" />
					<TreeItemIcon>
						<IconFile className="size-4" />
					</TreeItemIcon>

					<TreeItemTitle>
						<TreeItemLink
							asChild
							className={cn(isSelected && "text-accent-foreground")}
							onClick={(e) => {
								// keep permalink behavior on meta-click / new tab etc.
								// but normal click switches in-place
								if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
								e.preventDefault();
								onSelectFile(node.path);
							}}
						>
							<Link href={href}>{node.name}</Link>
						</TreeItemLink>
					</TreeItemTitle>
				</TreeItemRow>
			</TreeItem>
		);
	}

	return (
		<TreeItem value={node.path}>
			<TreeItemRow>
				<TreeItemToggle className="duration-150 ease-out" />
				<TreeItemIcon>
					<IconFolder className="size-4" />
				</TreeItemIcon>
				<TreeItemTitle>{node.name}</TreeItemTitle>
				<TreeItemActions>
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label="Folder actions"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
						}}
					>
						<IconDots className="size-4" />
					</Button>
				</TreeItemActions>
			</TreeItemRow>

			<TreeItemContent forceMount className="overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ease-out">
				{node.children.map((child) => (
					<TreeNode key={child.path} node={child} selectedPath={selectedPath} onSelectFile={onSelectFile} />
				))}
			</TreeItemContent>
		</TreeItem>
	);
}
