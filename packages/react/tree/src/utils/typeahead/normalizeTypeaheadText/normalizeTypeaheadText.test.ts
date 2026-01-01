// normalizeTypeaheadText.test.ts
import { describe, it, expect } from "vitest";
import { normalizeTypeaheadText } from "./normalizeTypeaheadText.js"; // adjust path if needed

describe("normalizeTypeaheadText", () => {
	it("trims leading and trailing whitespace", () => {
		expect(normalizeTypeaheadText("  hello  ")).toBe("hello");
		expect(normalizeTypeaheadText("\n\t hello \t")).toBe("hello");
	});

	it("converts text to lowercase", () => {
		expect(normalizeTypeaheadText("HELLO")).toBe("hello");
		expect(normalizeTypeaheadText("HeLLo")).toBe("hello");
	});

	it("trims and lowercases in one pass", () => {
		expect(normalizeTypeaheadText("  HeLLo  ")).toBe("hello");
	});

	it("preserves internal whitespace", () => {
		expect(normalizeTypeaheadText("  hello   world  ")).toBe("hello   world");
	});

	it("returns empty string when input is empty", () => {
		expect(normalizeTypeaheadText("")).toBe("");
	});

	it("returns empty string when input is only whitespace", () => {
		expect(normalizeTypeaheadText("   ")).toBe("");
		expect(normalizeTypeaheadText("\n\t")).toBe("");
	});

	it("handles non-alphabetic characters without modification (except trim)", () => {
		expect(normalizeTypeaheadText("  123-ABC  ")).toBe("123-abc");
		expect(normalizeTypeaheadText("  Foo_Bar!  ")).toBe("foo_bar!");
	});

	it("does not throw on unicode input", () => {
		expect(normalizeTypeaheadText("  Café  ")).toBe("café");
		expect(normalizeTypeaheadText("  Σίσυφος  ")).toBe("σίσυφος");
	});
});
