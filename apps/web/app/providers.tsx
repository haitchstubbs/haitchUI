"use client";

import * as React from "react";
import { OverlayDOMProvider } from "@haitch/core/client";
import type { OverlayDOM } from "@haitch/core/client";

export function Providers({ children }: { children: React.ReactNode }) {
	const portalRef = React.useRef<HTMLDivElement | null>(null);

	const dom = React.useMemo<OverlayDOM>(() => {
		return {
			getPortalContainer: () => {
				// Use the portal node if mounted
				if (portalRef.current) return portalRef.current;

				// Only access document when it exists
				const d = (globalThis as any).document;
				// Always return an HTMLElement (fallback to document.body)
				if (d?.body) return d.body as HTMLElement;
				// As a last resort, throw (should not happen in browser)
				throw new Error("No portal container available");
			},
		};
	}, []);

	return (
		<OverlayDOMProvider dom={dom}>
			{/* Put the portal root BEFORE children so it’s available ASAP */}
			<div ref={portalRef} data-overlay-root />
			{children}
		</OverlayDOMProvider>
	);
}
