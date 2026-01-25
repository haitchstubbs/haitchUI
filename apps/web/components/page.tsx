"use client";
import { useIsMobile } from "../hooks/use-mobile";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/breadcrumb";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "../lib/util";
import { IconLayoutSidebar } from "@tabler/icons-react";
import { Button } from "./ui/button";
import { AppCommandMenu } from "./app-command";
import Image from "next/image";
import { Logo } from "./logo/haitch-ui-logo";

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
		? "@haitch-ui"
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
					"bg-sidebar flex h-16 shrink-0 items-center justify-between gap-2 antialiased sticky top-0 z-10 border-b border-border backdrop-blur-md",
				)}
			>
				<div className="flex items-center gap-2 pr-4">
					<div className="flex items-center justify-center w-(--sidebar-width) h-14 ">
						<div className="rounded-full w-full p-1">
							<Logo />
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
				{children}
			</div>
		</div>
	);
}
