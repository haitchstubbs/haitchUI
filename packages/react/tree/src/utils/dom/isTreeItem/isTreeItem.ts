"use client";
export function isTreeItem(el: Element | null): el is HTMLElement {
	return Boolean(el && el instanceof HTMLElement && el.getAttribute("role") === "treeitem" && el.getAttribute("data-treeitem") === "true");
}
