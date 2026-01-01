"use client";
import { normalizeTypeaheadQuery } from "../normalizeTypeaheadQuery/normalizeTypeaheadQuery.js";
import { closestTreeItem } from "../../dom/closestTreeItem/closestTreeItem.js";
import { focusEl } from "../../dom/focusEl/focusEl.js";
import { getVisibleTreeItemEls } from "../../dom/getVisibleTreeItemEls/getVisibleTreeItemEls.js";
import { textValueFromTreeItem } from "../textValueFromTreeItem/textValueFromTreeItem.js";

export function focusTypeahead(root: HTMLElement | null, query: string) {
	const items = getVisibleTreeItemEls(root, { includeDisabled: false });
	if (items.length === 0) return;

	const q = normalizeTypeaheadQuery(query);
	if (!q) return;

	// If focus is inside a control within the row, start from the owning treeitem
	const activeTreeItem = closestTreeItem(document.activeElement);
	const startIdx = activeTreeItem ? items.indexOf(activeTreeItem) : -1;
	const ordered = startIdx >= 0 ? [...items.slice(startIdx + 1), ...items.slice(0, startIdx + 1)] : items;

	for (const el of ordered) {
		if (textValueFromTreeItem(el).startsWith(q)) {
			focusEl(el);
			return;
		}
	}
}
