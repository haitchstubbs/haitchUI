"use client";

import * as React from "react";
import { OverlayDOMProvider } from "@haitch/core/client";
import type { OverlayDOM } from "@haitch/core/client";

export function Providers({ children }: { children: React.ReactNode }) {
	const portalRef = React.useRef<HTMLDivElement | null>(null);

	const dom = React.useMemo<OverlayDOM>(() => {
		return {
			getPortalContainer: () => {
				// Portal root once mounted
				if (portalRef.current) return portalRef.current;

				// Safe fallback for initial render
				const d = (globalThis as unknown as { document?: Document }).document;
				if (d?.body) return d.body;

				// In practice this should never be hit for a client component at runtime
				// but avoids lying with `as HTMLElement`.
				throw new Error("[haitch/core] No portal container available (document.body missing).");
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
