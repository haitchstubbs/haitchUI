// focusTypeahead.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// --- Mocks for dependencies (must match import strings used in focusTypeahead.ts) ---
vi.mock("../normalizeTypeaheadQuery/normalizeTypeaheadQuery.js", () => ({
	normalizeTypeaheadQuery: vi.fn<(q: string) => string>((q) => q.trim().toLowerCase()),
}));

vi.mock("../../dom/closestTreeItem/closestTreeItem.js", () => ({
	closestTreeItem: vi.fn<(el: Element | null) => HTMLElement | null>(() => null),
}));

vi.mock("../../dom/focusEl/focusEl.js", () => ({
	focusEl: vi.fn<(el: HTMLElement) => void>(),
}));

vi.mock("../../dom/getVisibleTreeItemEls/getVisibleTreeItemEls.js", () => ({
	getVisibleTreeItemEls: vi.fn<(root: HTMLElement | null, opts: { includeDisabled: boolean }) => HTMLElement[]>(() => []),
}));

vi.mock("../textValueFromTreeItem/textValueFromTreeItem.js", () => ({
	textValueFromTreeItem: vi.fn<(el: HTMLElement) => string>(() => ""),
}));

// Import AFTER mocks so the module under test sees the mocked deps
import { focusTypeahead } from "./focusTypeahead.js";

// Pull in typed access to the mocks
import { normalizeTypeaheadQuery } from "../normalizeTypeaheadQuery/normalizeTypeaheadQuery.js";
import { closestTreeItem } from "../../dom/closestTreeItem/closestTreeItem.js";
import { focusEl } from "../../dom/focusEl/focusEl.js";
import { getVisibleTreeItemEls } from "../../dom/getVisibleTreeItemEls/getVisibleTreeItemEls.js";
import { textValueFromTreeItem } from "../textValueFromTreeItem/textValueFromTreeItem.js";

function div(label?: string) {
	const d = document.createElement("div");
	if (label) d.textContent = label;
	return d;
}

describe("focusTypeahead", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
		vi.clearAllMocks();
	});

	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("does nothing when there are no visible items", () => {
		vi.mocked(getVisibleTreeItemEls).mockReturnValueOnce([]);

		focusTypeahead(document.createElement("div"), "a");

		expect(getVisibleTreeItemEls).toHaveBeenCalledTimes(1);
		expect(normalizeTypeaheadQuery).toHaveBeenCalledTimes(0); // early return before normalize
		expect(focusEl).not.toHaveBeenCalled();
	});

	it("does nothing when normalized query is empty", () => {
		const root = document.createElement("div");
		const a = div("a");
		vi.mocked(getVisibleTreeItemEls).mockReturnValueOnce([a]);
		vi.mocked(normalizeTypeaheadQuery).mockReturnValueOnce(""); // normalize to empty

		focusTypeahead(root, "   ");

		expect(getVisibleTreeItemEls).toHaveBeenCalledWith(root, { includeDisabled: false });
		expect(normalizeTypeaheadQuery).toHaveBeenCalledWith("   ");
		expect(focusEl).not.toHaveBeenCalled();
	});

	it("does nothing when no item starts with the normalized query", () => {
		const root = document.createElement("div");
		const a = div("Alpha");
		const b = div("Beta");
		vi.mocked(getVisibleTreeItemEls).mockReturnValueOnce([a, b]);
		vi.mocked(normalizeTypeaheadQuery).mockReturnValueOnce("ga");
		vi.mocked(textValueFromTreeItem).mockImplementation((el) => {
			if (el === a) return "alpha";
			if (el === b) return "beta";
			return "";
		});

		focusTypeahead(root, "ga");

		expect(focusEl).not.toHaveBeenCalled();
	});

	it("focuses the first matching item in default order when there is no active treeitem", () => {
		const root = document.createElement("div");
		const a = div("Alpha");
		const b = div("Bravo");
		const c = div("Beta");
		vi.mocked(getVisibleTreeItemEls).mockReturnValueOnce([a, b, c]);
		vi.mocked(normalizeTypeaheadQuery).mockReturnValueOnce("b");
		vi.mocked(closestTreeItem).mockReturnValueOnce(null);
		vi.mocked(textValueFromTreeItem).mockImplementation((el) => {
			if (el === a) return "alpha";
			if (el === b) return "bravo";
			if (el === c) return "beta";
			return "";
		});

		focusTypeahead(root, "B");

		expect(focusEl).toHaveBeenCalledTimes(1);
		expect(focusEl).toHaveBeenCalledWith(b); // first match in original order
	});

	it("rotates search order to start AFTER the active treeitem (wraparound) and focuses the first match", () => {
		const root = document.createElement("div");

		// items in DOM order:
		const a = div("alpha");
		const b = div("bravo");
		const c = div("beta");
		const d = div("bongo");

		const items = [a, b, c, d];
		vi.mocked(getVisibleTreeItemEls).mockReturnValueOnce(items);
		vi.mocked(normalizeTypeaheadQuery).mockReturnValueOnce("b");

		// Make the "active treeitem" be b. That means ordered = [c, d, a, b]
		vi.mocked(closestTreeItem).mockReturnValueOnce(b);

		vi.mocked(textValueFromTreeItem).mockImplementation((el) => {
			if (el === a) return "alpha";
			if (el === b) return "bravo";
			if (el === c) return "beta";
			if (el === d) return "bongo";
			return "";
		});

		// Set an activeElement to make the intent realistic (closestTreeItem is mocked anyway)
		const input = document.createElement("input");
		document.body.appendChild(input);
		input.focus();
		expect(document.activeElement).toBe(input);

		focusTypeahead(root, "b");

		// With ordering [c, d, a, b], first match should be c ("beta")
		expect(focusEl).toHaveBeenCalledTimes(1);
		expect(focusEl).toHaveBeenCalledWith(c);
	});

	it("if active treeitem is not found in items list, it uses the default order", () => {
		const root = document.createElement("div");
		const a = div("alpha");
		const b = div("bravo");
		const c = div("beta");

		const items = [a, b, c];
		vi.mocked(getVisibleTreeItemEls).mockReturnValueOnce(items);
		vi.mocked(normalizeTypeaheadQuery).mockReturnValueOnce("b");

		// closestTreeItem returns an element that is not in items
		const notInList = div("ghost");
		vi.mocked(closestTreeItem).mockReturnValueOnce(notInList);

		vi.mocked(textValueFromTreeItem).mockImplementation((el) => {
			if (el === a) return "alpha";
			if (el === b) return "bravo";
			if (el === c) return "beta";
			return "";
		});

		focusTypeahead(root, "b");

		// default order should pick b first
		expect(focusEl).toHaveBeenCalledTimes(1);
		expect(focusEl).toHaveBeenCalledWith(b);
	});

	it("calls normalizeTypeaheadQuery with the raw query", () => {
		const root = document.createElement("div");
		const a = div("alpha");
		vi.mocked(getVisibleTreeItemEls).mockReturnValueOnce([a]);

		// No match, but we only care that normalizeTypeaheadQuery was called properly
		vi.mocked(normalizeTypeaheadQuery).mockReturnValueOnce("x");
		vi.mocked(textValueFromTreeItem).mockReturnValueOnce("alpha");

		focusTypeahead(root, "  X  ");

		expect(normalizeTypeaheadQuery).toHaveBeenCalledTimes(1);
		expect(normalizeTypeaheadQuery).toHaveBeenCalledWith("  X  ");
	});
});
