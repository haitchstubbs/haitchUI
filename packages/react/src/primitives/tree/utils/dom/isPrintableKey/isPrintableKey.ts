"use client";
export function isPrintableKey(e: { key: string; altKey?: boolean; ctrlKey?: boolean; metaKey?: boolean }): boolean {
	return e.key.length === 1 && !e.altKey && !e.ctrlKey && !e.metaKey;
}