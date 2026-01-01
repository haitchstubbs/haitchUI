"use client";
export function isDisabled(el: HTMLElement): boolean {
	const ariaDisabled = el.getAttribute("aria-disabled") === "true";
	const dataDisabled = el.hasAttribute("data-disabled");
	return ariaDisabled || dataDisabled;
}
