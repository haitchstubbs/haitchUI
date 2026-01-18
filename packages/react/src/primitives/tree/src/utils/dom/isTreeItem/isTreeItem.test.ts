import { describe, it, expect } from "vitest";
import { isTreeItem } from "./isTreeItem.js";
describe("isTreeItem", () => {
	it("returns true for valid treeitem element", () => {
		const el = document.createElement("div");
		el.setAttribute("role", "treeitem");
		el.setAttribute("data-treeitem", "true");
		expect(isTreeItem(el)).toBe(true);
	});

	it("returns false for element with incorrect role", () => {
		const el = document.createElement("div");
		el.setAttribute("role", "button");
		el.setAttribute("data-treeitem", "true");
		expect(isTreeItem(el)).toBe(false);
	});

	it("returns false for element missing data-treeitem attribute", () => {
		const el = document.createElement("div");
		el.setAttribute("role", "treeitem");
		expect(isTreeItem(el)).toBe(false);
	});

	it("returns false for null element", () => {
		expect(isTreeItem(null)).toBe(false);
	});

	it("returns false for non-HTMLElement", () => {
		const el = document.createTextNode("Not an element");
		expect(isTreeItem(el as unknown as Element | null)).toBe(false);
	});
});
