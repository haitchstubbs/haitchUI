import { describe, it, expect } from "vitest";
import { isInHiddenGroup } from "./isInHiddenGroup.js";

describe("isInHiddenGroup", () => {
    it("returns true if the element is inside a hidden group", () => {
        const group = document.createElement("div");
        group.setAttribute("role", "group");
        group.setAttribute("hidden", "");
        const el = document.createElement("div");
        group.appendChild(el);
        document.body.appendChild(group);
        expect(isInHiddenGroup(el)).toBe(true);
        document.body.removeChild(group);
    });

    it("returns true if the element is inside an aria-hidden group", () => {
        const group = document.createElement("div");
        group.setAttribute("role", "group");
        group.setAttribute("aria-hidden", "true");
        const el = document.createElement("div");
        group.appendChild(el);
        document.body.appendChild(group);
        expect(isInHiddenGroup(el)).toBe(true);
        document.body.removeChild(group);
    });

    it("returns false if the element is not inside a hidden group", () => {
        const group = document.createElement("div");
        group.setAttribute("role", "group");
        const el = document.createElement("div");
        group.appendChild(el);
        document.body.appendChild(group);
        expect(isInHiddenGroup(el)).toBe(false);
        document.body.removeChild(group);
    });

    it("returns false if the element is not inside any group", () => {
        const el = document.createElement("div");
        document.body.appendChild(el);
        expect(isInHiddenGroup(el)).toBe(false);
        document.body.removeChild(el);
    });

    it("returns true for nested hidden groups", () => {
        const outerGroup = document.createElement("div");
        outerGroup.setAttribute("role", "group");
        outerGroup.setAttribute("hidden", "");

        const innerGroup = document.createElement("div");
        innerGroup.setAttribute("role", "group");
        outerGroup.appendChild(innerGroup);

        const el = document.createElement("div");
        innerGroup.appendChild(el);
        document.body.appendChild(outerGroup);

        expect(isInHiddenGroup(el)).toBe(true);
        document.body.removeChild(outerGroup);
    });

    it("returns false for nested visible groups", () => {
        const outerGroup = document.createElement("div");
        outerGroup.setAttribute("role", "group");
        const innerGroup = document.createElement("div");
        innerGroup.setAttribute("role", "group");
        outerGroup.appendChild(innerGroup);
        const el = document.createElement("div");
        innerGroup.appendChild(el);
        document.body.appendChild(outerGroup);
        expect(isInHiddenGroup(el)).toBe(false);
        document.body.removeChild(outerGroup);
    });

    it("returns true if the element is inside a hidden group among other groups", () => {
        const visibleGroup = document.createElement("div");
        visibleGroup.setAttribute("role", "group");
        const hiddenGroup = document.createElement("div");
        hiddenGroup.setAttribute("role", "group");
        hiddenGroup.setAttribute("hidden", "");
        const el = document.createElement("div");
        hiddenGroup.appendChild(el);
        document.body.appendChild(visibleGroup);
        document.body.appendChild(hiddenGroup);
        expect(isInHiddenGroup(el)).toBe(true);
        document.body.removeChild(visibleGroup);
        document.body.removeChild(hiddenGroup);
    });

    it("returns false if the element is inside a visible group among other groups", () => {
        const hiddenGroup = document.createElement("div");
        hiddenGroup.setAttribute("role", "group");
        hiddenGroup.setAttribute("hidden", "");
        const visibleGroup = document.createElement("div");
        visibleGroup.setAttribute("role", "group");
        const el = document.createElement("div");
        visibleGroup.appendChild(el);
        document.body.appendChild(hiddenGroup);
        document.body.appendChild(visibleGroup);
        expect(isInHiddenGroup(el)).toBe(false);
        document.body.removeChild(hiddenGroup);
        document.body.removeChild(visibleGroup);
    });
});