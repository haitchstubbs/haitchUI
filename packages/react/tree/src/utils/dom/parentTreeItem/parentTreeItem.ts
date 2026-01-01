"use client";
export function parentTreeItem(el: HTMLElement | null): HTMLElement | null {
	if (!el) return null;
	const parent = el.parentElement?.closest<HTMLElement>('[role="treeitem"][data-treeitem="true"]') ?? null;
	return parent;
}
