// textValueFromTreeItem.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Must match the import string used by the module under test
vi.mock("../normalizeTypeaheadText/normalizeTypeaheadText.js", () => ({
	normalizeTypeaheadText: vi.fn<(s: string) => string>((s) => `NORM(${s})`),
}));

import { textValueFromTreeItem } from "./textValueFromTreeItem.js";
import { normalizeTypeaheadText } from "../normalizeTypeaheadText/normalizeTypeaheadText.js";


function div() {
	return document.createElement("div");
}

describe("textValueFromTreeItem", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
		vi.clearAllMocks();
	});

	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("uses el[data-text-value] when present (highest priority)", () => {
		const el = div();
		el.setAttribute("data-text-value", "Root Value");
		el.textContent = "Ignored Text";

		const out = textValueFromTreeItem(el);

		expect(normalizeTypeaheadText).toHaveBeenCalledTimes(1);
		expect(normalizeTypeaheadText).toHaveBeenCalledWith("Root Value");
		expect(out).toBe("NORM(Root Value)");
	});

	it("uses the first descendant [data-text-value] when the root has none", () => {
		const el = div();

		const child1 = div();
		child1.setAttribute("data-text-value", "Child One");

		const child2 = div();
		child2.setAttribute("data-text-value", "Child Two");

		el.appendChild(child1);
		el.appendChild(child2);

		const out = textValueFromTreeItem(el);

		expect(normalizeTypeaheadText).toHaveBeenCalledTimes(1);
		expect(normalizeTypeaheadText).toHaveBeenCalledWith("Child One"); // querySelector picks first match
		expect(out).toBe("NORM(Child One)");
	});

	it("falls back to el.textContent when no data-text-value exists", () => {
		const el = div();
		el.textContent = " Some Text \n";

		const out = textValueFromTreeItem(el);

		expect(normalizeTypeaheadText).toHaveBeenCalledTimes(1);
		expect(normalizeTypeaheadText).toHaveBeenCalledWith(" Some Text \n");
		expect(out).toBe("NORM( Some Text \n)");
	});

	it("falls back to empty string when textContent is null-ish", () => {
		const el = div();

		// JSDOM usually provides "" not null, but we can force it for the branch.
		Object.defineProperty(el, "textContent", {
			value: null,
			configurable: true,
		});

		const out = textValueFromTreeItem(el);

		expect(normalizeTypeaheadText).toHaveBeenCalledTimes(1);
		expect(normalizeTypeaheadText).toHaveBeenCalledWith("");
		expect(out).toBe("NORM()");
	});

	it("prefers root data-text-value over descendant data-text-value", () => {
		const el = div();
		el.setAttribute("data-text-value", "Root");

		const child = div();
		child.setAttribute("data-text-value", "Child");
		el.appendChild(child);

		const out = textValueFromTreeItem(el);

		expect(normalizeTypeaheadText).toHaveBeenCalledWith("Root");
		expect(out).toBe("NORM(Root)");
	});

	it("uses descendant data-text-value even if descendant is deeply nested", () => {
		const el = div();

		const wrapper = div();
		const inner = div();
		inner.setAttribute("data-text-value", "Deep");

		wrapper.appendChild(inner);
		el.appendChild(wrapper);

		const out = textValueFromTreeItem(el);

		expect(normalizeTypeaheadText).toHaveBeenCalledWith("Deep");
		expect(out).toBe("NORM(Deep)");
	});
});
