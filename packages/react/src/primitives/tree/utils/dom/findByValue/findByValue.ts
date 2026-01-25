"use client";
export function findByValue(root: HTMLElement | null, value: string): HTMLElement | null {
	if (!root) return null;
	return root.querySelector<HTMLElement>(`[role="treeitem"][data-treeitem="true"][data-value="${CSS.escape(value)}"]`);
}
