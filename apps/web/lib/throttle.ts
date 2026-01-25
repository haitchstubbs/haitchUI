export function throttle<T extends (...args: any[]) => void>(fn: T) {
	let raf = 0;
	let lastArgs: any[] | null = null;

	const run = () => {
		raf = 0;
		if (!lastArgs) return;
		fn(...lastArgs);
		lastArgs = null;
	};

	return (...args: any[]) => {
		lastArgs = args;
		if (raf) return;
		raf = window.requestAnimationFrame(run);
	};
}