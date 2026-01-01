import { describe, it, expect } from "vitest";
import { closestTreeItem } from "./closestTreeItem.js";

describe("closestTreeItem", () => {
	it("returns the closest treeitem element", () => {
		const parent = document.createElement("div");
		const treeItem = document.createElement("div");
		treeItem.setAttribute("role", "treeitem");
		treeItem.setAttribute("data-treeitem", "true");
		parent.appendChild(treeItem);
		const child = document.createElement("span");
		treeItem.appendChild(child);

		const result = closestTreeItem(child);
		expect(result).toBe(treeItem);
	});

	it("returns null if no treeitem ancestor is found", () => {
		const el = document.createElement("div");
		const result = closestTreeItem(el);
		expect(result).toBeNull();
	});

	it("returns null for null input", () => {
		const result = closestTreeItem(null);
		expect(result).toBeNull();
	});

	it("returns null if the start element is not an HTMLElement", () => {
		const textNode = document.createTextNode("Not an element");
		const result = closestTreeItem(textNode as unknown as Element | null);
		expect(result).toBeNull();
	});

	it("returns the start element if it is a treeitem", () => {
		const treeItem = document.createElement("div");
		treeItem.setAttribute("role", "treeitem");
		treeItem.setAttribute("data-treeitem", "true");
		const result = closestTreeItem(treeItem);
		expect(result).toBe(treeItem);
	});
});
