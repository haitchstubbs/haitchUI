"use client";
export function nextIndex(current: number, dir: 1 | -1, len: number): number {
	if (len <= 0) return -1;
	return (current + dir + len) % len;
}