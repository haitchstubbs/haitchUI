"use client";

import * as React from "react";
import type { NextFontWithVariable } from "next/dist/compiled/@next/font";
import { cn, ThemeRoot } from "@haitch-ui/ui";
import { OverlayDOMProvider, type OverlayDOM } from "@haitch-ui/react-overlay";
import { SidebarProvider } from "../components/ui/sidebar";
import { fontVariables } from "../components/fonts";

import { Toaster } from "../components/ui/toaster";

export function Providers({
	children,
	initialExpandedValues,
	expandedCookieName,
}: {
	children: React.ReactNode;
	initialExpandedValues?: string[];
	expandedCookieName?: string;
}) {


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
			theme={
				//"dark"
				//"dark"
				//"stone-light"
				//"stone-dark"
				//"neutral-light"
				//"neutral-dark"
				//"synthwave84"
				//"dracula"
				//"nord"
				//"one-dark-pro"
				"gruvbox-material-dark"
				//"tokyo-night-storm"
				//"brutalist-black"
				//"duckdb-brutalist-dark"
				//"motherduck-brutalist-dark"
				//"cyberpunk-light"
				//"cyberpunk-dark"
			}
			className={cn(" ui-root root h-screen w-screen text-foreground bg-background antialiased", fontVariables)}
		>
			<OverlayDOMProvider dom={dom}>
			
				<SidebarProvider>
					<div ref={portalRef} />
					{/* Provide expandedValues via context or props (see next section) */}
					{children}
				</SidebarProvider>
				<Toaster position="bottom-right" />
			</OverlayDOMProvider>
		</ThemeRoot>
	);
}
