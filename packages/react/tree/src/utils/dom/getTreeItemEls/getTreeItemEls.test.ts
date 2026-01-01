import { describe, it, expect } from "vitest";
import { getTreeItemEls } from "./getTreeItemEls.js";

describe("getTreeItemEls", () => {
    it("returns an empty array if root is null", () => {
        const result = getTreeItemEls(null);
        expect(result).toEqual([]);
    });

    it("returns all treeitem elements when includeDisabled is true", () => {
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
        const result = getTreeItemEls(root, { includeDisabled: true });
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
        const result = getTreeItemEls(root, { includeDisabled: false });
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
        const result = getTreeItemEls(root);
        expect(result).toEqual([treeItem1]);
    });

    it("returns an empty array if there are no treeitem elements", () => {
        const root = document.createElement("div");
        const result = getTreeItemEls(root);
        expect(result).toEqual([]);
    });

    it("correctly identifies treeitem elements with data-disabled attribute", () => {
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
        const result = getTreeItemEls(root, { includeDisabled: false });
        expect(result).toEqual([treeItem1]);
    });
});