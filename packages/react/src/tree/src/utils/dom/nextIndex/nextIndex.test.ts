// nextIndex.test.ts
import { describe, it, expect } from "vitest";
import { nextIndex } from "./nextIndex.js"; // adjust path if needed

describe("nextIndex", () => {
	it("returns -1 when len is 0", () => {
		expect(nextIndex(0, 1, 0)).toBe(-1);
		expect(nextIndex(5, -1, 0)).toBe(-1);
	});

	it("returns -1 when len is negative", () => {
		expect(nextIndex(0, 1, -1)).toBe(-1);
		expect(nextIndex(2, -1, -10)).toBe(-1);
	});

	it("increments index when dir is 1", () => {
		expect(nextIndex(0, 1, 5)).toBe(1);
		expect(nextIndex(2, 1, 5)).toBe(3);
	});

	it("decrements index when dir is -1", () => {
		expect(nextIndex(3, -1, 5)).toBe(2);
		expect(nextIndex(1, -1, 5)).toBe(0);
	});

	it("wraps to 0 when incrementing past the end", () => {
		expect(nextIndex(4, 1, 5)).toBe(0);
	});

	it("wraps to len - 1 when decrementing past 0", () => {
		expect(nextIndex(0, -1, 5)).toBe(4);
	});

	it("works correctly when len is 1", () => {
		expect(nextIndex(0, 1, 1)).toBe(0);
		expect(nextIndex(0, -1, 1)).toBe(0);
	});

	it("handles negative current indexes via modulo math", () => {
		// This documents current behavior rather than endorsing it
		expect(nextIndex(-1, 1, 5)).toBe(0);
		expect(nextIndex(-1, -1, 5)).toBe(3);
	});

	it("handles current indexes greater than len", () => {
		expect(nextIndex(6, 1, 5)).toBe(2);
		expect(nextIndex(6, -1, 5)).toBe(0);
	});
});
