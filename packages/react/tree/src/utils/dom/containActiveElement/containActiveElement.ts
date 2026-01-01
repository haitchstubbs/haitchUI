"use client";
export function containsActiveElement(el: HTMLElement | null): boolean {
	if (!el) return false;
	const active = document.activeElement;
	return Boolean(active && el.contains(active));
}
