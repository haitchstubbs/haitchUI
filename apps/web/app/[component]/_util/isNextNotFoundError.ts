export function isNextNotFoundError(err: unknown): boolean {
	return (
		typeof err === "object" &&
		err !== null &&
		"digest" in err &&
		typeof (err as any).digest === "string" &&
		(err as any).digest.includes("NEXT_HTTP_ERROR_FALLBACK;404")
	);
}
