export function shallowEqual(a: object, b: object) {
	if (a === b) return true;
	const ak = Object.keys(a);
	const bk = Object.keys(b);
	if (ak.length !== bk.length) return false;
	for (const k of ak) {
		// @ts-expect-error index
		if (a[k] !== b[k]) return false;
	}
	return true;
}
