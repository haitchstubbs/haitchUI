"use client";

import { useRef, useState, useLayoutEffect, type RefObject } from "react";

import { DOM } from "@haitch-ui/react/overlay";

/**
 * A `Rect` is the same shape as `RectLike`.
 * Exporting it makes it easy for consumers to type their state.
 */
export type Rect = {
	x: number;
	y: number;
	width: number;
	height: number;
};

type VirtualElement = {
	getBoundingClientRect: () => DOMRect;
	contextElement?: Element | null;
};

/**
 * useRect() returns the bounding rect of an element and a ref to attach.
 *
 * Inspired by Radix’s implementation:contentReference[oaicite:1]{index=1}, it uses ResizeObserver
 * and window events to keep the rect updated.
 */
export function useRect<T extends HTMLElement = HTMLElement>(): [Rect | undefined, RefObject<T | null>] {
	const ref = useRef<T>(null);
	const [rect, setRect] = useState<Rect | undefined>(undefined);

	useLayoutEffect(() => {
		const node = ref.current;
		if (!node) return;

		function updateRect() {
			const r = node?.getBoundingClientRect();
			if (r) {
				setRect({ x: r.x, y: r.y, width: r.width, height: r.height });
			} else {
				setRect({
					x: 0,
					y: 0,
					width: 0,
					height: 0,
				});
			}
		}

		updateRect();

		const resizeObserver = new ResizeObserver(updateRect);
		resizeObserver.observe(node);

		window.addEventListener("scroll", updateRect, true);
		window.addEventListener("resize", updateRect);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener("scroll", updateRect, true);
			window.removeEventListener("resize", updateRect);
		};
	}, []);

	return [rect, ref];
}

/**
 * useVirtualElement() wraps a RectLike into a VirtualElement via @haitch-ui/core.
 * When rect is undefined it returns undefined.
 */
export function useVirtualElement(rect: Rect | undefined, contextElement?: Element | null): VirtualElement | undefined {
	// Use the core DOM manager to create a virtual element
	if (!rect) return undefined;
	const manager = DOM.default();
	return manager.dom.createVirtualElement(rect, { contextElement });
}
