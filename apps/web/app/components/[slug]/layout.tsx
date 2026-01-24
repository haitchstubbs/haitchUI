'use client';
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/util";
import { DocsProvider } from "./docs-context";

export default function ComponentPageLayout({ children }: { children: React.ReactNode }) {
	return (
        <DocsProvider>
            <div className={cn('w-full')}>{children}</div>
        </DocsProvider>
    );
}
