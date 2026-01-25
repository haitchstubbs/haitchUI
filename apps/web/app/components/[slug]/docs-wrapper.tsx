"use client";
import { cn } from "@/lib/util";
import { useDocsWrapperContext } from "./docs-context";
import { Toc } from "./toc";
import { useSidebar } from "@/components/ui/sidebar";

export function DocsWrapper({ basePath, children }: { basePath: string; children: React.ReactNode }) {
	const { hidden: tocHidden } = useDocsWrapperContext();
	const { open: sidebarOpen, isMobile } = useSidebar();
	const showToc = !tocHidden || (!isMobile && !sidebarOpen);
	const shouldOffsetSidebar = sidebarOpen && !isMobile;
	return (
		<div className={cn("relative w-full")}>
			<div
				className={cn(
					"mx-auto flex w-full justify-center py-10 transition-[padding] duration-200 ease-out",
					"px-4 sm:px-6 lg:px-10",
					shouldOffsetSidebar && "lg:pl-[calc(var(--sidebar-width)+2.5rem)]",
				)}
			>
				<main
					id="docs-content"
					className={cn(
						"relative w-full min-w-0",
						showToc ? "max-w-5xl min-[1248px]:pr-[calc(var(--sidebar-width)+2rem)]" : "max-w-4xl",
					)}
				>
					{children}
				</main>
			</div>
			{showToc ? <Toc basePath={basePath} /> : null}
		</div>
	);
}
