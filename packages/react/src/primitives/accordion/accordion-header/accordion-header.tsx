"use client";

import * as React from "react";
import { Slot } from "@/primitives/slot";
import { useAccordionItemContext, useAccordionRootContext } from "../accordion-context";
import type { HeaderProps } from "../accordion-types";

function dataState(open: boolean) {
	return open ? "open" : "closed";
}
function dataAttrDisabled(disabled: boolean) {
	return disabled ? "" : undefined;
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(function Header(
	{ asChild = false, ...props },
	ref
) {
	const root = useAccordionRootContext('Accordion.Header');
	const item = useAccordionItemContext('Accordion.Header');

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

Header.displayName = "Accordion.Header";

export { Header };