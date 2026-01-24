"use client";

import * as React from "react";
import { Slot } from "@/slot/src";
import { useAccordionItemCtx, useAccordionRootCtx } from "../accordion-context";
import type { HeaderProps } from "../accordion-types";

function dataState(open: boolean) {
	return open ? "open" : "closed";
}
function dataAttrDisabled(disabled: boolean) {
	return disabled ? "" : undefined;
}

export const Header = React.forwardRef<HTMLElement, HeaderProps>(function Header(
	{ asChild = false, ...props },
	ref
) {
	const root = useAccordionRootCtx();
	const item = useAccordionItemCtx();

	const Comp: any = asChild ? Slot : "h3";

	return (
		<Comp
			ref={ref as any}
			data-slot="accordion-header"
			data-state={dataState(item.open)}
			data-disabled={dataAttrDisabled(item.disabled)}
			data-orientation={root.orientation}
			{...props}
		/>
	);
});
