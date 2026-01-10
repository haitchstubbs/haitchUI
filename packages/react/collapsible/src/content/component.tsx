"use client";

import * as React from "react";
import { Slot } from "@haitch/react-slot";
import { useCollapsibleCtx } from "../context";
import type { ContentProps } from "../types";

function dataState(open: boolean) {
	return open ? "open" : "closed";
}

/**
 * tw-animate-css compatible variables.
 * tw-animate-css currently expects --{radix || bits || reka || kb}-<component>-<property>
 * e.g. --reka-collapsible-content-height
 */
type Size = { w: number; h: number };
function setCollapsibleVars(style: React.CSSProperties, size: Size) {
	// Height vars used across ecosystems (Radix/BitsUI/Reka/Kobalte)
	(style as any)["--radix-collapsible-content-height"] = `${size.h}px`;
	(style as any)["--bits-collapsible-content-height"] = `${size.h}px`;
	(style as any)["--reka-collapsible-content-height"] = `${size.h}px`;
	(style as any)["--kb-collapsible-content-height"] = `${size.h}px`;

	// Optional: width equivalents (Radix has width; others may or may not use it,
	// but setting them doesn't hurt and improves compatibility)
	(style as any)["--radix-collapsible-content-width"] = `${size.w}px`;
	(style as any)["--bits-collapsible-content-width"] = `${size.w}px`;
	(style as any)["--reka-collapsible-content-width"] = `${size.w}px`;
	(style as any)["--kb-collapsible-content-width"] = `${size.w}px`;
}

/**
 * Radix-compatible CSS variables:
 * --radix-collapsible-content-height
 * --radix-collapsible-content-width
 *
 * Used for size animations. We measure the content's full size and expose as vars.
 */
export const Content = React.forwardRef<HTMLDivElement, ContentProps>(function Content(
	{ asChild = false, forceMount = false, style, hidden, ...props },
	ref
) {
	const c = useCollapsibleCtx();
	const Comp: any = asChild ? Slot : "div";

	const localRef = React.useRef<HTMLDivElement | null>(null);

	const setRefs = React.useCallback(
		(node: HTMLDivElement | null) => {
			localRef.current = node;
			if (typeof ref === "function") ref(node);
			else if (ref) (ref as any).current = node;
		},
		[ref]
	);

	const [size, setSize] = React.useState<Size>({ w: 0, h: 0 });

	const isOpen = c.open;
	const disabled = c.disabled;

	const present = forceMount || isOpen;

	React.useLayoutEffect(() => {
		if (!present) return;

		const el = localRef.current;
		if (!el) return;

		const measure = () => {
			// Use the rendered box size for best compatibility with height animations.
			// If you want "full content size including overflow", switch to scrollHeight/scrollWidth.
			setSize({ w: el.scrollWidth, h: el.scrollHeight });
		};

		// Measure immediately, then on resize.
		measure();

		const ro = new ResizeObserver(() => {
			// rAF prevents ResizeObserver loop warnings in some layouts
			requestAnimationFrame(measure);
		});
		ro.observe(el);

		return () => ro.disconnect();
	}, [present]);

	if (!present) return null;

	const mergedStyle: React.CSSProperties = {
		...(style as React.CSSProperties),
	};

	setCollapsibleVars(mergedStyle, size);
	const resolvedHidden = hidden ?? (!forceMount && !isOpen);
	return (
		<Comp
			ref={setRefs}
			id={c.contentId}
			role="region"
			aria-labelledby={c.triggerId}
			aria-hidden={!isOpen ? true : undefined}
			inert={!isOpen || undefined}
			data-slot="collapsible-content"
			data-state={dataState(isOpen)}
			data-disabled={disabled ? "" : undefined}
			hidden={resolvedHidden}
			style={mergedStyle}
			{...props}
		/>
	);
});
