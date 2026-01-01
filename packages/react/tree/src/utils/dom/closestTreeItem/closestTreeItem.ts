"use client";
export function closestTreeItem(start: Element | null): HTMLElement | null {
		if (!start) return null;
		const el = start instanceof HTMLElement ? start : null;
		if (!el) return null;
		return el.closest<HTMLElement>('[role="treeitem"][data-treeitem="true"]');
	}
