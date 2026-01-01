import { describe, it, expect } from "vitest";
import { findByValue } from "./findByValue.js";
import { render } from "@testing-library/react";
describe("findByValue", () => {
    it("returns null if root is null", () => {
        const result = findByValue(null, "some-value");
        expect(result).toBeNull();
    });

    it("returns the correct element when it exists", () => {
        const { container } = render(
            <div>
                <div role="treeitem" data-treeitem="true" data-value="item-1">Item 1</div>
                <div role="treeitem" data-treeitem="true" data-value="item-2">Item 2</div>
            </div>
        );
        const root = container.firstChild as HTMLElement;
        const result = findByValue(root, "item-2");
        expect(result).not.toBeNull();
        expect(result?.getAttribute("data-value")).toBe("item-2");
    });

    it("returns null when no matching element is found", () => {
        const { container } = render(
            <div>
                <div role="treeitem" data-treeitem="true" data-value="item-1">Item 1</div>
                <div role="treeitem" data-treeitem="true" data-value="item-2">Item 2</div>
            </div>
        );
        const root = container.firstChild as HTMLElement;
        const result = findByValue(root, "non-existent-item");
        expect(result).toBeNull();
    });
});