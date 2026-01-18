"use client";

import { useSidebar } from "../../components/ui/sidebar";
import { cn } from "../../lib/util";

export default function BlocksPageLayout({ children }: { children: React.ReactNode }) {
	const { open, isMobile } = useSidebar();
    const shouldShrink = !isMobile && open;
	return <div className={cn(
        "h-full overflow-auto",
        shouldShrink ? "w-[calc(100vw-var(--sidebar-width))] ml-(--sidebar-width) " : "w-full ml-0",
        "transition-all duration-200 ease-out"
    )}>{children}</div>;
}
