"use client";
import { useIsMobile } from "../hooks/use-mobile";
import { Separator } from "@haitch-ui/ui";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/breadcrumb";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "../lib/util";
import { IconLayoutSidebar } from "@tabler/icons-react";
import { Button } from "./ui/button";
import { AppCommandMenu } from "./app-command";
import Image from "next/image";

function getBreadcrumbData(pathname: string) {
	const { isMobile, open } = useSidebar();
	// get the current path name

	const isHomePage = pathname === "/";
	// URL should be "/" or "/{section}" or "/{section}/{subsection}"
	// If we aren't on the home page, extract the section and subsection from the pathname
	const pathSegments = pathname.split("/").filter(Boolean);
	const section = pathSegments[0];
	const subsection = pathSegments[1];

	const pageTitle = isHomePage
		? "@haitch-ui/ui"
		: // Capitalize
			section && section.charAt(0).toUpperCase() + section.slice(1);
	const pageSubtitle = isHomePage
		? null
		: // subsection may be hyphenated, convert to title case
			subsection && subsection.includes("-")
			? subsection
					.split("-")
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(" ")
			: subsection
				? subsection.charAt(0).toUpperCase() + subsection.slice(1)
				: null;

	// Boolean to assert when to use breadcrumb
	const useBreadcrumb = !isMobile && !isHomePage && pageTitle && pageSubtitle;

	return { isMobile, open, section, pageTitle, pageSubtitle, useBreadcrumb };
}
export function Page({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const { isMobile, open, section, pageTitle, pageSubtitle, useBreadcrumb } = getBreadcrumbData(pathname);
	return (
		<div className="flex h-full flex-col overflow-auto min-w-0">
			<header
				className={cn(
					"bg-sidebar flex h-16 shrink-0 items-center justify-between gap-2 antialiased sticky top-0 z-10 border-b border-border backdrop-blur-md"
				)}
			>
				<div className="flex items-center gap-2 pr-4">
					{isMobile && (
						<>
							<SidebarTrigger />
							<Image src="/haitch-ui-logo.png" alt="Haitch UI Logo" width={32} height={32} />
						</>
					)}
					<div className="flex items-center justify-center w-[var(--sidebar-width)] h-14 ">
						<div className="rounded-full">
							<a
								href="/"
								aria-label="Go to home"
								className="
      group relative inline-flex items-center gap-2
      h-11 px-4 rounded-full

      /* clear dark glass body */
      bg-[linear-gradient(to_bottom,rgba(255,255,255,0.18),rgba(255,255,255,0.04)_45%,rgba(0,0,0,0.35))]
      backdrop-blur-md backdrop-saturate-125

      /* crisp edge + inner bevel */
      border border-white/20
      shadow-[0_6px_14px_-2px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(0,0,0,0.6)]

      transition-all duration-200 ease-out
      hover:-translate-y-[1px]
      hover:shadow-[0_9px_18px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.42),inset_0_-1px_0_rgba(0,0,0,0.7)]

      focus-visible:outline-none
      focus-visible:ring-2 focus-visible:ring-white/30
      focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
    "
							>
								{/* secondary soft reflection */}
								<span
									aria-hidden
									className="
        pointer-events-none absolute inset-x-2 top-2 h-3
        rounded-full
        bg-white/10
        blur-sm
        opacity-60
      "
								/>

								{/* inner clarity rim */}
								<span
									aria-hidden
									className="
        pointer-events-none absolute inset-[1px] rounded-full
        ring-1 ring-white/12
      "
								/>

								<span className="relative grid place-items-center h-7">
									<h1 className="text-lg font-sans font-semibold leading-none tracking-tighter text-foreground drop-shadow-sm">
										@haitch-ui{" "}
									</h1>
								</span>

								<span className="sr-only">Haitch UI</span>
							</a>
						</div>
					</div>
					{useBreadcrumb && (
						<>
							<Separator orientation="vertical" className="block shrink-0 mr-2 data-[orientation=vertical]:h-4" />
							<Breadcrumb>
								<BreadcrumbList>
									<BreadcrumbItem className="hidden md:block">
										<BreadcrumbLink asChild>
											<Link href={`/${section}`}>{pageTitle}</Link>
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator className="hidden md:block" />
									<BreadcrumbItem>
										<BreadcrumbPage>{pageSubtitle}</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</>
					)}
				</div>
				<div>
					<AppCommandMenu />
				</div>
			</header>

			<div className="relative h-full w-full">
				{!isMobile && (
					<div
						className={cn(
							"fixed top-18 left-0 z-10 flex items-start overflow-visible",
							"transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)]",
							open ? "translate-x-[calc(var(--sidebar-width)+8px)]" : "translate-x-2"
						)}
					>
						<SidebarTrigger />
					</div>
				)}
				{/* Page content */}
				{children}
			</div>
		</div>
	);
}
