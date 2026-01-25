"use client";

import { useMemo } from "react";
import { DOM } from "@haitch-ui/react/overlay";

export type Rect = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export type VirtualElement = {
	getBoundingClientRect: () => DOMRect;
	contextElement?: Element | null;
};

/**
 * Wraps a RectLike `{x,y,width,height}` into a VirtualElement.
 *
 * Returns `undefined` when no rect is provided.
 */
export function useVirtualElement(rect: Rect | undefined, contextElement?: Element | null): VirtualElement | undefined {
	// Only re-create the virtual element when the rect or context element changes
	return useMemo(() => {
		if (!rect) return undefined;
		// The core UI manager’s createVirtualElement returns an object with
		// getBoundingClientRect and contextElement:contentReference[oaicite:2]{index=2}.
		return DOM.default().dom.createVirtualElement(rect, { contextElement });
	}, [rect?.x, rect?.y, rect?.width, rect?.height, contextElement]);
}
