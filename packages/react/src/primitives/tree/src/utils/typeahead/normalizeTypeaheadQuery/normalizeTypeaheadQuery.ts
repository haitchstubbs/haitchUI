"use client";
export function normalizeTypeaheadQuery(input: string): string {
	return input.trim().toLowerCase();
}
