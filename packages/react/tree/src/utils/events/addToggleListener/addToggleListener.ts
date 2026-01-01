"use client";
export const toggleEventName = "haitch-tree-toggle";

export function addToggleListener(el: HTMLElement, listener: (ev: Event) => void): () => void {
	el.addEventListener(toggleEventName, listener as EventListener);
	return () => el.removeEventListener(toggleEventName, listener as EventListener);
}
