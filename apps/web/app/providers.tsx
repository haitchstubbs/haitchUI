"use client";

import * as React from "react";
import type { NextFontWithVariable } from "next/dist/compiled/@next/font";
import { cn, ThemeRoot } from "@haitch/ui";
import { OverlayDOMProvider, type OverlayDOM } from "@haitch/react-overlay";

export function Providers({
	fonts,
	children,
	initialExpandedValues,
	expandedCookieName,
}: {
	fonts: NextFontWithVariable[];
	children: React.ReactNode;
	initialExpandedValues: string[];
	expandedCookieName: string;
}) {
	const fontClassNames = fonts.map((font) => font.variable).join(" ");

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
		<ThemeRoot
			//theme={"tokyo-night-storm"}
			theme="motherduck-brutalist-dark"
			className={cn(" ui-root min-h-screen min-w-screen bg-background antialiased", fontClassNames)}
		>
			<OverlayDOMProvider dom={dom}>
				<div ref={portalRef} />
				{/* Provide expandedValues via context or props (see next section) */}
				{children}
			</OverlayDOMProvider>
		</ThemeRoot>
	);
}
