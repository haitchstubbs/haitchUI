"use client";

import * as React from "react";
import { Slot } from "@/primitives/slot";
import { AccordionItemContext, useAccordionItemContext, useAccordionRootContext, type AccordionItemCtx } from "../accordion-context";
import type { ItemProps } from "../accordion-types";

function dataState(open: boolean) {
	return open ? "open" : "closed";
}
function dataAttrDisabled(disabled: boolean) {
	return disabled ? "" : undefined;
}

const Item = React.forwardRef<HTMLElement, ItemProps>(function Item(
	{ asChild = false, value, disabled: disabledProp = false, ...props },
	ref
) {
	const root = useAccordionRootContext('Accordion.Item');

	const disabled = root.disabled || disabledProp;
	const open = root.isItemOpen(value);

	const triggerId = root.getTriggerId(value);
	const contentId = root.getContentId(value);

	const ctx: AccordionItemCtx = React.useMemo(
		() => ({ value, open, disabled, triggerId, contentId }),
		[value, open, disabled, triggerId, contentId]
	);

	const Comp: any = asChild ? Slot : "div";

	return (
		<AccordionItemContext.Provider value={ctx}>
			<Comp
				ref={ref as any}
				data-slot="accordion-item"
				data-state={dataState(open)}
				data-disabled={dataAttrDisabled(disabled)}
				data-orientation={root.orientation}
				{...props}
			/>
		</AccordionItemContext.Provider>
	);
});

Item.displayName = "Accordion.Item";

export { Item };