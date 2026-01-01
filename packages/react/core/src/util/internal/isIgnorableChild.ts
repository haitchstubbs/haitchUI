import { isWhitespaceText } from "./isWhitespaceText";

export function isIgnorableChild(node: unknown): boolean {
	// Ignore whitespace-only text nodes (common with formatted JSX)
	// NOTE: We intentionally do NOT ignore numbers/other strings.
	return isWhitespaceText(node);
}