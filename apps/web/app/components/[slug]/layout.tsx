'use client';
import { OverlayDOMProvider } from "@haitch-ui/react/overlay";
import { cn } from "@/lib/util";
import { DocsProvider } from "./docs-context";

export default function ComponentPageLayout({ children }: { children: React.ReactNode }) {
	return (
		<OverlayDOMProvider>
			<DocsProvider>
				<div className={cn("w-full")}>{children}</div>
			</DocsProvider>
		</OverlayDOMProvider>
	);
}
