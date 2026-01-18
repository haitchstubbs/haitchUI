"use client";
import { getTreeItemEls } from "../getTreeItemEls/getTreeItemEls.js";
import { isInHiddenGroup } from "../isInHiddenGroup/isInHiddenGroup.js";

export function getVisibleTreeItemEls(root: HTMLElement | null, opts?: { includeDisabled?: boolean }): HTMLElement[] {
	if (!root) return [];
	const items = getTreeItemEls(root, opts);
	return items.filter((el) => !isInHiddenGroup(el));
}
