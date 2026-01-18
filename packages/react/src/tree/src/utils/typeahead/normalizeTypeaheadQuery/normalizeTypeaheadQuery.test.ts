// normalizeTypeaheadQuery.test.ts
import { describe, it, expect } from "vitest";
import { normalizeTypeaheadQuery } from "./normalizeTypeaheadQuery.js"; // adjust path if needed

describe("normalizeTypeaheadQuery", () => {
	it("trims leading and trailing whitespace", () => {
		expect(normalizeTypeaheadQuery("  hello  ")).toBe("hello");
		expect(normalizeTypeaheadQuery("\n\t hello \t")).toBe("hello");
	});

	it("converts text to lowercase", () => {
		expect(normalizeTypeaheadQuery("HELLO")).toBe("hello");
		expect(normalizeTypeaheadQuery("HeLLo")).toBe("hello");
	});

	it("trims and lowercases in one pass", () => {
		expect(normalizeTypeaheadQuery("  HeLLo  ")).toBe("hello");
	});

	it("preserves internal whitespace", () => {
		expect(normalizeTypeaheadQuery("  hello   world  ")).toBe("hello   world");
	});

	it("returns empty string when input is empty", () => {
		expect(normalizeTypeaheadQuery("")).toBe("");
	});

	it("returns empty string when input is only whitespace", () => {
		expect(normalizeTypeaheadQuery("   ")).toBe("");
		expect(normalizeTypeaheadQuery("\n\t")).toBe("");
	});

	it("handles non-alphabetic characters correctly", () => {
		expect(normalizeTypeaheadQuery("  123-ABC  ")).toBe("123-abc");
		expect(normalizeTypeaheadQuery("  Foo_Bar!  ")).toBe("foo_bar!");
	});

	it("handles unicode text without throwing", () => {
		expect(normalizeTypeaheadQuery("  Café  ")).toBe("café");
		expect(normalizeTypeaheadQuery("  Σίσυφος  ")).toBe("σίσυφος");
	});
});
