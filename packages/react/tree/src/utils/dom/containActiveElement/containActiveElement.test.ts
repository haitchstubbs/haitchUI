import { containsActiveElement } from "./containActiveElement.js";
import { describe, it, expect } from "vitest";

describe("containsActiveElement", () => {
	it("returns false when element is null", () => {
		expect(containsActiveElement(null)).toBe(false);
	});

	it("returns false when active element is not contained", () => {
		const el = document.createElement("div");
		document.body.appendChild(el);
		const otherEl = document.createElement("input");
		document.body.appendChild(otherEl);
		otherEl.focus();
		expect(containsActiveElement(el)).toBe(false);
		document.body.removeChild(el);
		document.body.removeChild(otherEl);
	});

	it("returns true when active element is contained", () => {
		const el = document.createElement("div");
		const input = document.createElement("input");
		el.appendChild(input);
		document.body.appendChild(el);
		input.focus();
		expect(containsActiveElement(el)).toBe(true);
		document.body.removeChild(el);
	});

	it("returns false when there is no active element", () => {
		const el = document.createElement("div");
		document.body.appendChild(el);
		(document.activeElement as HTMLElement)?.blur();
		expect(containsActiveElement(el)).toBe(false);
		document.body.removeChild(el);
	});
});
