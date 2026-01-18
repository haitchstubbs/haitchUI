"use client";

import * as React from "react";
import { Slot } from "@/slot/src";
import { AccordionItemContext, useAccordionRootCtx } from "../context";
import type { ItemProps } from "../types";

function dataState(open: boolean) {
	return open ? "open" : "closed";
}
function dataAttrDisabled(disabled: boolean) {
	return disabled ? "" : undefined;
}

export const Item = React.forwardRef<HTMLElement, ItemProps>(function Item(
	{ asChild = false, value, disabled: disabledProp = false, ...props },
	ref
) {
	const root = useAccordionRootCtx();

	const disabled = root.disabled || disabledProp;
	const open = root.isItemOpen(value);

	const triggerId = root.getTriggerId(value);
	const contentId = root.getContentId(value);

	const ctx = React.useMemo(
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
