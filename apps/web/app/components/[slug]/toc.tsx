// app/components/[slug]/right-toc.tsx
"use client";

import { IconCircleDot } from "@tabler/icons-react";
import * as React from "react";
import { Separator } from "../../../components/ui/separator";
import { useToc } from "./use-toc";

type TocItem = {
	id: string;
	text: string;
	level: 1 | 2 | 3 | 4 | 5;
};

function slugify(input: string) {
	return input
		.toLowerCase()
		.trim()
		.replace(/['"]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

const IGNORE_PARENTS = ["pre", "code", "[data-code-preview]", ".code-preview"];

export function Toc({
	basePath,
	containerId = "docs-content",
	selector = "h1, h2, h3, h4, h5",
}: {
	basePath: string;
	containerId?: string;
	selector?: string;
}) {
	const { items, activeId, linkFor, isHidden } = useToc({
		basePath,
		containerId,
		selector,
		// matches your current layout tuning
		topOffsetPx: 96,
		skipFirst: true,
		ignoreParents: ["pre", "code", "[data-code-preview]", ".code-preview"],
	});

	const liClasses = (level: number): string => {
		switch (level) {
			case 2:
				return "pl-2";
			case 3:
				return "pl-4";
			case 4:
				return "pl-8";
			case 5:
				return "pl-16";
			default:
				return "";
		}
	};

	const linkClasses = (id: string) => {
		const isActive = id === activeId;
		return [
			"block w-full truncate transition-all hover:text-foreground/110 hover:font-semibold/110",
			"hover:text-foreground",
			isActive ? "text-foreground font-semibold" : "text-muted-foreground",
		].join(" ");
	};

	if (!items.length) return null;

	return (
		<aside className="fixed right-0 flex w-(--sidebar-width) flex-col items-end">
			<nav aria-label="On this page" className="text-sm w-(--sidebar-width) mr-1 sticky top-24 right-9">
				<div className="font-medium text-muted-foreground p-3">On this page:</div>

				<ul className="space-y-1 p-3">
					{items.slice(1).map((item) => (
						<li key={item.id} className={liClasses(item.level)}>
							<a
								href={`${basePath}#${item.id}`}
								className={linkClasses(item.id)}
								aria-current={item.id === activeId ? "location" : undefined}
								title={item.text}
							>
								{item.text}
							</a>
						</li>
					))}
				</ul>
			</nav>
		</aside>
	);
}
