import { describe, it, expect } from "vitest";
import { getVisibleTreeItemEls } from "./getVisibleTreeItemEls.js";

describe("getVisibleTreeItemEls", () => {
	it("returns an empty array if root is null", () => {
		const result = getVisibleTreeItemEls(null);
		expect(result).toEqual([]);
	});

	it("returns only visible treeitem elements when some are in hidden groups", () => {
		const root = document.createElement("div");
		const treeItem1 = document.createElement("div");
		treeItem1.setAttribute("role", "treeitem");
		treeItem1.setAttribute("data-treeitem", "true");
		root.appendChild(treeItem1);
		const hiddenGroup = document.createElement("div");
		hiddenGroup.setAttribute("role", "group");
		hiddenGroup.setAttribute("hidden", "");
		const treeItem2 = document.createElement("div");
		treeItem2.setAttribute("role", "treeitem");
		treeItem2.setAttribute("data-treeitem", "true");
		hiddenGroup.appendChild(treeItem2);
		root.appendChild(hiddenGroup);
		const result = getVisibleTreeItemEls(root);
		expect(result).toEqual([treeItem1]);
	});

	it("includes disabled treeitem elements when includeDisabled is true", () => {
		const root = document.createElement("div");
		const treeItem1 = document.createElement("div");
		treeItem1.setAttribute("role", "treeitem");
		treeItem1.setAttribute("data-treeitem", "true");
		root.appendChild(treeItem1);
		const treeItem2 = document.createElement("div");
		treeItem2.setAttribute("role", "treeitem");
		treeItem2.setAttribute("data-treeitem", "true");
		treeItem2.setAttribute("aria-disabled", "true");
		root.appendChild(treeItem2);
		const result = getVisibleTreeItemEls(root, { includeDisabled: true });
		expect(result).toEqual([treeItem1, treeItem2]);
	});

	it("excludes disabled treeitem elements when includeDisabled is false", () => {
		const root = document.createElement("div");
		const treeItem1 = document.createElement("div");
		treeItem1.setAttribute("role", "treeitem");
		treeItem1.setAttribute("data-treeitem", "true");
		root.appendChild(treeItem1);
		const treeItem2 = document.createElement("div");
		treeItem2.setAttribute("role", "treeitem");
		treeItem2.setAttribute("data-treeitem", "true");
		treeItem2.setAttribute("aria-disabled", "true");
		root.appendChild(treeItem2);
		const result = getVisibleTreeItemEls(root, { includeDisabled: false });
		expect(result).toEqual([treeItem1]);
	});

	it("defaults to excluding disabled treeitem elements when includeDisabled is not provided", () => {
		const root = document.createElement("div");
		const treeItem1 = document.createElement("div");
		treeItem1.setAttribute("role", "treeitem");
		treeItem1.setAttribute("data-treeitem", "true");
		root.appendChild(treeItem1);
		const treeItem2 = document.createElement("div");
		treeItem2.setAttribute("role", "treeitem");
		treeItem2.setAttribute("data-treeitem", "true");
		treeItem2.setAttribute("aria-disabled", "true");
		root.appendChild(treeItem2);
		const result = getVisibleTreeItemEls(root);
		expect(result).toEqual([treeItem1]);
	});

	it("returns an empty array if there are no visible treeitem elements", () => {
		const root = document.createElement("div");
		const hiddenGroup = document.createElement("div");
		hiddenGroup.setAttribute("role", "group");
		hiddenGroup.setAttribute("hidden", "");
		const treeItem = document.createElement("div");
		treeItem.setAttribute("role", "treeitem");
		treeItem.setAttribute("data-treeitem", "true");
		hiddenGroup.appendChild(treeItem);
		root.appendChild(hiddenGroup);
		const result = getVisibleTreeItemEls(root);
		expect(result).toEqual([]);
	});
	it("correctly identifies visible treeitem elements with data-disabled attribute", () => {
		const root = document.createElement("div");
		const treeItem1 = document.createElement("div");
		treeItem1.setAttribute("role", "treeitem");
		treeItem1.setAttribute("data-treeitem", "true");
		root.appendChild(treeItem1);
		const treeItem2 = document.createElement("div");
		treeItem2.setAttribute("role", "treeitem");
		treeItem2.setAttribute("data-treeitem", "true");
		treeItem2.setAttribute("data-disabled", "");
		root.appendChild(treeItem2);
		const result = getVisibleTreeItemEls(root, { includeDisabled: true });
		expect(result).toEqual([treeItem1, treeItem2]);
	});
});
