"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconLayout, IconMinus, IconPlus } from "@tabler/icons-react";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarRail,
	useSidebar,
} from "./ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { SearchForm } from "./search-form";
import type { NavData, NavItem } from "../lib/navigation";
import { Em } from "./ui/typography";

/* -------------------------------------------------------------------------------------------------
 * Helpers
 * -----------------------------------------------------------------------------------------------*/

type NavSection = NavData["docs"][number];

function HeaderBrand() {
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton size="lg" asChild>
					<Link href="#">
						<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-radius-md">
							<IconLayout className="size-4" />
						</div>

						<div className="flex flex-col gap-0.5 leading-none">
							<span className="font-medium">Documentation</span>
							<span>v1.0.0</span>
						</div>
					</Link>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}

function CollapsibleIcons() {
	return (
		<>
			<IconPlus className="ml-auto group-data-[state=open]/collapsible:hidden" />
			<IconMinus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
		</>
	);
}

function isActiveItem(item: NavItem, pathname: string) {
	return !!item.isActive || pathname === item.url;
}

function flattenItems(data: NavData) {
	return [...data.docs.flatMap((g) => g.items), ...data.examples.flatMap((g) => g.items)];
}

/* -------------------------------------------------------------------------------------------------
 * Reusable section renderer
 * -----------------------------------------------------------------------------------------------*/

type SectionRendererProps = {
	title: string;
	sections: NavSection[];
	pathname: string;
	onItemClick: (item: NavItem) => void;
	/** Slightly different markup between docs/examples in your original code */
	variant: "docs" | "examples";
};

function SidebarSection({ title, sections, pathname, onItemClick, variant }: SectionRendererProps) {
	return (
		<SidebarGroup title={title}>
			<SidebarMenu className="min-w-0">
				{sections.map((section, index) => (
					<Collapsible key={section.title} defaultOpen={index === 0} className="group/collapsible min-w-0">
						<SidebarMenuItem className="min-w-0">
							<CollapsibleTrigger asChild>
								<SidebarMenuButton className={variant === "docs" ? "whitespace-nowrap truncate text-ellipsis" : undefined}>
									{section.title}
									<CollapsibleIcons />
								</SidebarMenuButton>
							</CollapsibleTrigger>

							{section.items?.length ? (
								<CollapsibleContent forceMount className="min-w-0">
									<SidebarMenuSub className="min-w-0 w-full">
										{section.items.map((item) => {
											const active = isActiveItem(item, pathname);
											const isComingSoon = item.title.includes(" (Coming Soon)");
											const titleWithoutComingSoon = isComingSoon ? item.title.replace(" (Coming Soon)", "") : item.title;

											const isInProgress = item.title.includes(" (In Progress)");
											const titleWithoutInProgress = isInProgress ? item.title.replace(" (In Progress)", "") : item.title;

											const isUnstable = item.title.includes(" (Unstable)");
											const titleWithoutUnstable = isUnstable ? item.title.replace(" (Unstable)", "") : item.title;
											return (
												<SidebarMenuSubItem key={item.title} className="min-w-0 w-full">
													<SidebarMenuSubButton
														asChild
														isActive={active}
														onClick={() => onItemClick(item)}
														className="min-w-0 w-full"
													>
														<Link href={item.url} className={"flex w-full min-w-0 items-center"}>
															{isComingSoon ? (
																<>
																	<span className="flex-1 min-w-0 truncate">{titleWithoutComingSoon}</span>
																	<span className="ml-2 rounded-full bg-foreground px-1 py-0.5 text-xs  font-medium text-background">
																		Coming Soon
																	</span>
																</>
															) : isInProgress ? (
																<>
																	<span className="flex-1 min-w-0 truncate">{titleWithoutInProgress}</span>
																	<span className="ml-2 rounded-full bg-border px-1 py-0.5 text-xs font-medium text-foreground">
																		In Progress
																	</span>
																</>
															) : isUnstable ? (
																<>
																	<span className="flex-1 min-w-0 truncate">{titleWithoutUnstable}</span>
																	<span className="ml-2 rounded-full bg-destructive px-1 py-0.5 text-xs font-medium text-foreground">
																		Unstable
																	</span>
																</>
															) : (
																<span className="flex-1 min-w-0 truncate">{item.title}</span>
															)}
														</Link>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											);
										})}
									</SidebarMenuSub>
								</CollapsibleContent>
							) : null}
						</SidebarMenuItem>
					</Collapsible>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}

/* -------------------------------------------------------------------------------------------------
 * AppSidebar
 * -----------------------------------------------------------------------------------------------*/

export function AppSidebar({ data, ...props }: React.ComponentProps<typeof Sidebar> & { data: NavData }) {
	const pathname = usePathname();
	const { toggleSidebar, isMobile } = useSidebar();

	// Keep your existing "isActive" behavior (even though pathname already provides this)
	const [items, setItems] = React.useState<NavItem[]>(() => flattenItems(data));

	const handleItemClick = React.useCallback(
		(clicked: NavItem) => {
			setItems((prev) => prev.map((it) => (it === clicked ? { ...it, isActive: true } : { ...it, isActive: false })));

			if (isMobile) toggleSidebar();
		},
		[isMobile, toggleSidebar]
	);

	return (
		<Sidebar {...props} variant="overlay" className="mt-16 border-r border-border">
			<SidebarHeader>
				<HeaderBrand />
				<SearchForm />
			</SidebarHeader>

			<SidebarContent>
				{/* <SidebarSection title="Documentation" sections={data.docs} pathname={pathname} onItemClick={handleItemClick} variant="docs" /> */}
				<SidebarSection title="Examples" sections={data.examples} pathname={pathname} onItemClick={handleItemClick} variant="examples" />
			</SidebarContent>

			<SidebarRail />
		</Sidebar>
	);
}
