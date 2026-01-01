"use client";
import { isDisabled } from "../isDisabled/isDisabled.js";

export function getTreeItemEls(root: HTMLElement | null, opts?: { includeDisabled?: boolean }): HTMLElement[] {
	if (!root) return [];
	const includeDisabled = Boolean(opts?.includeDisabled);

	const all = Array.from(root.querySelectorAll<HTMLElement>('[role="treeitem"][data-treeitem="true"]'));

	return all.filter((el) => {
		if (!includeDisabled && isDisabled(el)) return false;
		return true;
	});
}
