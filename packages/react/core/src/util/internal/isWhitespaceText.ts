export function isWhitespaceText(node: unknown): node is string {
	return typeof node === "string" && node.trim() === "";
}