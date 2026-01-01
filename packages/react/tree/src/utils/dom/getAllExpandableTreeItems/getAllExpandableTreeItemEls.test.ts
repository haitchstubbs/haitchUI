/**
Test the following code:

import { getTreeItemEls } from "../getTreeItemEls/getTreeItemEls.js";

export function getAllExpandableTreeItemEls(root: HTMLElement): HTMLElement[] {
    const all = getTreeItemEls(root);
    return all.filter((el) => el.getAttribute("aria-expanded") !== null);
}

Available Test Libs:

    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.1",
    "@testing-library/user-event": "^14.6.1",
    "@types/react": "19.2.2",
    "@types/react-dom": "19.2.2",
    "@vitejs/plugin-react": "^5.1.2",
    "axe-core": "^4.11.0",
    "jsdom": "^27.3.0",
    "prettier": "^3.7.4",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "vitest": "^4.0.16",
    "vitest-axe": "^0.1.0"

 */

import { describe, it, expect } from "vitest";
import { getAllExpandableTreeItemEls } from "./getAllExpandableTreeItemEls.js";

describe("getAllExpandableTreeItemEls", () => {
	it("returns empty array when root is null", () => {
		const result = getAllExpandableTreeItemEls(null as unknown as HTMLElement);
		expect(result).toEqual([]);
	});

	it("returns only expandable tree items", () => {
		const root = document.createElement("div");
		root.innerHTML = `
            <div role="treeitem" data-treeitem="true" data-value="1" aria-expanded="true"></div>
            <div role="treeitem" data-treeitem="true" data-value="2"></div>
            <div role="treeitem" data-treeitem="true" data-value="3" aria-expanded="false"></div>
        `;
		const result = getAllExpandableTreeItemEls(root);
		expect(result).toBeDefined();
		expect(result.length).toBe(2);
		expect(result[0]?.getAttribute("data-value")).toBe("1");
		expect(result[1]?.getAttribute("data-value")).toBe("3");
	});

	it("returns empty array when there are no expandable tree items", () => {
		const root = document.createElement("div");
		root.innerHTML = `
            <div role="treeitem" data-treeitem="true" data-value="1"></div>
            <div role="treeitem" data-treeitem="true" data-value="2"></div>
        `;
		const result = getAllExpandableTreeItemEls(root);
		expect(result).toEqual([]);
	});
});
