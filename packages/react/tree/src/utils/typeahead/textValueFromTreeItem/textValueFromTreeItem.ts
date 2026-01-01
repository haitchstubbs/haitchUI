"use client";
import { normalizeTypeaheadText } from "../normalizeTypeaheadText/normalizeTypeaheadText.js";

export function textValueFromTreeItem(el: HTMLElement): string {
	const explicit =
		el.getAttribute("data-text-value") ??
		el.querySelector<HTMLElement>("[data-text-value]")?.getAttribute("data-text-value") ??
		el.textContent ??
		"";

	return normalizeTypeaheadText(explicit);
}
