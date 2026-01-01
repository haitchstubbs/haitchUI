import { describe, it, expect } from "vitest";
import { isDisabled } from "./isDisabled.js";

describe("isDisabled", () => {
	it("returns true if aria-disabled is true", () => {
		const el = document.createElement("div");
		el.setAttribute("aria-disabled", "true");
		expect(isDisabled(el)).toBe(true);
	});

	it("returns true if data-disabled attribute is present", () => {
		const el = document.createElement("div");
		el.setAttribute("data-disabled", "");
		expect(isDisabled(el)).toBe(true);
	});

	it("returns false if neither aria-disabled nor data-disabled is present", () => {
		const el = document.createElement("div");
		expect(isDisabled(el)).toBe(false);
	});

	it("returns false if aria-disabled is false and data-disabled is not present", () => {
		const el = document.createElement("div");
		el.setAttribute("aria-disabled", "false");
		expect(isDisabled(el)).toBe(false);
	});

	it("returns true if both aria-disabled is true and data-disabled is present", () => {
		const el = document.createElement("div");
		el.setAttribute("aria-disabled", "true");
		el.setAttribute("data-disabled", "");
		expect(isDisabled(el)).toBe(true);
	});

	it("returns false if aria-disabled is not set and data-disabled is not present", () => {
		const el = document.createElement("div");
		expect(isDisabled(el)).toBe(false);
	});

	it("returns false if aria-disabled is set to an invalid value and data-disabled is not present", () => {
		const el = document.createElement("div");
		el.setAttribute("aria-disabled", "invalid");
		expect(isDisabled(el)).toBe(false);
	});
});
