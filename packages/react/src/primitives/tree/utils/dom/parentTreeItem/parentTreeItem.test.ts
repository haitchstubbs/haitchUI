import { describe, it, expect } from "vitest";
import { parentTreeItem } from "./parentTreeItem.js";

describe("parentTreeItem", () => {
    it("returns null when element is null", () => {
        expect(parentTreeItem(null)).toBeNull();
    });

    it("returns null when there is no parent tree item", () => {
        const el = document.createElement("div");
        expect(parentTreeItem(el)).toBeNull();
    });

    it("returns the closest parent tree item", () => {
        const parent = document.createElement("div");
        parent.setAttribute("role", "treeitem");
        parent.setAttribute("data-treeitem", "true");
        const child = document.createElement("div");
        parent.appendChild(child);
        expect(parentTreeItem(child)).toBe(parent);
    });

    it("returns the closest ancestor tree item, not just the direct parent", () => {
        const grandParent = document.createElement("div");
        grandParent.setAttribute("role", "treeitem");
        grandParent.setAttribute("data-treeitem", "true");
        const parent = document.createElement("div");
        const child = document.createElement("div");
        grandParent.appendChild(parent);
        parent.appendChild(child);
        expect(parentTreeItem(child)).toBe(grandParent);
    });
});