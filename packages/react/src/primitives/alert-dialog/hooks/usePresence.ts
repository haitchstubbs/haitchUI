import { useState, useRef, useCallback, useEffect } from "react";
import type { CSSProperties } from "react";

export function usePresence(open: boolean, durations?: { open?: number; close?: number }) {
	const openMs = durations?.open ?? 120;
	const closeMs = durations?.close ?? 100;

	const [isMounted, setIsMounted] = useState(open);
	const [styles, setStyles] = useState<CSSProperties>(() => ({
		opacity: open ? 1 : 0,
		transform: open ? "scale(1)" : "scale(0.95)",
	}));

	const rafRef = useRef<number | null>(null);
	const tRef = useRef<number | null>(null);

	const clearTimers = useCallback(() => {
		if (rafRef.current != null) {
			cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
		}
		if (tRef.current != null) {
			window.clearTimeout(tRef.current);
			tRef.current = null;
		}
	}, []);

	useEffect(() => {
		clearTimers();

		if (open) {
			setIsMounted(true);
			setStyles({ opacity: 0, transform: "scale(0.95)" });

			rafRef.current = requestAnimationFrame(() => {
				setStyles({
					opacity: 1,
					transform: "scale(1)",
					transition: `opacity ${openMs}ms ease, transform ${openMs}ms ease`,
				});
			});

			return () => clearTimers();
		}

		setStyles({
			opacity: 0,
			transform: "scale(0.95)",
			transition: `opacity ${closeMs}ms ease, transform ${closeMs}ms ease`,
		});

		tRef.current = window.setTimeout(() => setIsMounted(false), closeMs);
		return () => clearTimers();
	}, [open, openMs, closeMs, clearTimers]);

	return { isMounted, styles };
}