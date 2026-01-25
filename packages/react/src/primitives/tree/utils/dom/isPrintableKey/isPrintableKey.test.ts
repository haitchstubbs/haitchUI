// isPrintableKey.test.ts
import { describe, it, expect } from "vitest";
import { isPrintableKey } from "./isPrintableKey.js"; // adjust path if needed

describe("isPrintableKey", () => {
	it("returns true for a single-character key with no modifier keys", () => {
		expect(isPrintableKey({ key: "a" })).toBe(true);
		expect(isPrintableKey({ key: "Z" })).toBe(true);
		expect(isPrintableKey({ key: "1" })).toBe(true);
		expect(isPrintableKey({ key: " " })).toBe(true); // space is printable
		expect(isPrintableKey({ key: "." })).toBe(true);
	});

	it("returns false for keys longer than one character", () => {
		expect(isPrintableKey({ key: "Enter" })).toBe(false);
		expect(isPrintableKey({ key: "Backspace" })).toBe(false);
		expect(isPrintableKey({ key: "ArrowUp" })).toBe(false);
		expect(isPrintableKey({ key: "Tab" })).toBe(false);
	});

	it("returns false when altKey is pressed", () => {
		expect(isPrintableKey({ key: "a", altKey: true })).toBe(false);
	});

	it("returns false when ctrlKey is pressed", () => {
		expect(isPrintableKey({ key: "a", ctrlKey: true })).toBe(false);
	});

	it("returns false when metaKey is pressed", () => {
		expect(isPrintableKey({ key: "a", metaKey: true })).toBe(false);
	});

	it("returns false when multiple modifier keys are pressed", () => {
		expect(isPrintableKey({ key: "a", ctrlKey: true, metaKey: true })).toBe(false);
		expect(isPrintableKey({ key: "a", altKey: true, ctrlKey: true })).toBe(false);
	});

	it("treats missing modifier flags as false", () => {
		// Explicitly documents that undefined modifier flags are equivalent to false
		expect(isPrintableKey({ key: "x", altKey: undefined, ctrlKey: undefined, metaKey: undefined })).toBe(true);
	});

	it("returns false for empty key string", () => {
		expect(isPrintableKey({ key: "" })).toBe(false);
	});

	it("returns false for multi-code-unit keys (e.g. emoji)", () => {
		// Emoji are multiple UTF-16 code units → length > 1
		expect(isPrintableKey({ key: "😀" })).toBe(false);
	});
});
