"use client";
import { getTreeItemEls } from "../getTreeItemEls/getTreeItemEls.js";

export function getAllExpandableTreeItemEls(root: HTMLElement): HTMLElement[] {
	const all = getTreeItemEls(root);
	return all.filter((el) => el.getAttribute("aria-expanded") !== null);
}
