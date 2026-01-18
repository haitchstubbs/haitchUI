"use client";

import * as React from "react";
import { Slot } from "@/primitives/slot/src/slot";
import { useAccordionItemCtx, useAccordionRootCtx } from "../context";
import type { ContentProps } from "../types";

function dataState(open: boolean) {
	return open ? "open" : "closed";
}
function dataAttrDisabled(disabled: boolean) {
	return disabled ? "" : undefined;
}

export const Content = React.forwardRef<HTMLDivElement, ContentProps>(function Content(
	{ asChild = false, forceMount = false, style, hidden, ...props },
	ref
) {
	const root = useAccordionRootCtx();
	const item = useAccordionItemCtx();

	const Comp: any = asChild ? Slot : "div";

	// ✅ hooks must not be conditional
	const localRef = React.useRef<HTMLDivElement | null>(null);

	const setRefs = React.useCallback(
		(node: HTMLDivElement | null) => {
			localRef.current = node;
			if (typeof ref === "function") ref(node);
			else if (ref) (ref as any).current = node;
		},
		[ref]
	);

	const [size, setSize] = React.useState<{ w: number; h: number }>({ w: 0, h: 0 });

	const present = forceMount || item.open;

	React.useLayoutEffect(() => {
		if (!present) return;

		const el = localRef.current;
		if (!el) return;

		const measure = () => setSize({ w: el.scrollWidth, h: el.scrollHeight });
		measure();

		const ro = new ResizeObserver(measure);
		ro.observe(el);
		return () => ro.disconnect();
	}, [present]);

	if (!present) return null;

	return (
		<Comp
			ref={setRefs}
			id={item.contentId}
			role="region"
			aria-labelledby={item.triggerId}
			data-slot="accordion-content"
			data-state={dataState(item.open)}
			data-disabled={dataAttrDisabled(item.disabled)}
			data-orientation={root.orientation}
			hidden={hidden ?? !item.open}
			style={{
				...(style as React.CSSProperties),
				["--radix-accordion-content-height" as any]: `${size.h}px`,
				["--radix-accordion-content-width" as any]: `${size.w}px`,
			}}
			{...props}
		/>
	);
});
