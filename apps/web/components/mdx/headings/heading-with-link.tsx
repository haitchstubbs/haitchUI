"use client";

import * as React from "react";
import { IconLink } from "@tabler/icons-react";
import { cn } from "../../../lib/util";
import { useHeadingIdCtx } from "./id-context";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

function slugify(input: string) {
	return input
		.toLowerCase()
		.trim()
		.replace(/['"]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

function isElementWithChildren(
	node: React.ReactNode
): node is React.ReactElement<{ children?: React.ReactNode }> {
	return React.isValidElement(node);
}

function getText(node: React.ReactNode): string {
	if (node == null || typeof node === "boolean") return "";
	if (typeof node === "string" || typeof node === "number") return String(node);
	if (Array.isArray(node)) return node.map(getText).join("");
	if (isElementWithChildren(node)) return getText(node.props.children);
	return "";
}

export function HeadingWithLink<T extends HeadingTag>(props: {
	as: T;
	TypographyHeading: React.ComponentType<React.ComponentPropsWithoutRef<T>>;
} & React.ComponentPropsWithoutRef<T>) {
	const { TypographyHeading: Heading, id, className, children, ...rest } = props;
	const { nextId, reserve } = useHeadingIdCtx();

	let finalId: string | undefined;

	if (typeof id === "string" && id.length > 0) {
		finalId = id;
		reserve(id);
	} else {
		const text = getText(children);
		const base = slugify(text);
		finalId = base ? nextId(base) : undefined;
	}

	return (
		<div className="group flex items-start gap-2">
			{finalId ? (
				<a
					href={`#${finalId}`}
					aria-label="Link to heading"
					className={cn(
						"mt-[0.25em] inline-flex size-6 shrink-0 items-center justify-center rounded-md",
						"text-muted-foreground opacity-0 transition-opacity",
						"group-hover:opacity-100 group-focus-within:opacity-100",
						"focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					)}
				>
					<IconLink className="size-4" />
				</a>
			) : (
				<span className="mt-[0.25em] size-6 shrink-0" aria-hidden />
			)}

			<Heading {...(rest as any)} id={finalId} data-mdx-heading="" className={className}>
				{children}
			</Heading>
		</div>
	);
}
