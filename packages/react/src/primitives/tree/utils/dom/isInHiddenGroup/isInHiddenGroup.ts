"use client";
export function isInHiddenGroup(el: HTMLElement): boolean {
	// If forceMount is used, collapsed groups should be hidden/aria-hidden.
	// Anything inside those groups should be treated as not visible.
	return Boolean(el.closest<HTMLElement>('[role="group"][hidden], [role="group"][aria-hidden="true"]'));
}
