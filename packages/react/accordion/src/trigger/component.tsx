"use client";

import * as React from "react";
import { Slot } from "@haitch/react-slot";
import { useAccordionItemCtx, useAccordionRootCtx } from "../context";
import type { TriggerProps } from "../types";

function dataState(open: boolean) {
	return open ? "open" : "closed";
}
function dataAttrDisabled(disabled: boolean) {
	return disabled ? "" : undefined;
}

export const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(function Trigger(
	{ asChild = false, onClick, ...props },
	ref
) {
	const root = useAccordionRootCtx();
	const item = useAccordionItemCtx();

	const Comp: any = asChild ? Slot : "button";

	return (
		<Comp
			ref={ref}
			id={item.triggerId}
			type={asChild ? undefined : "button"}
			data-slot="accordion-trigger"
			data-state={dataState(item.open)}
			data-disabled={dataAttrDisabled(item.disabled)}
			data-orientation={root.orientation}
			aria-controls={item.contentId}
			aria-expanded={item.open}
			disabled={!asChild ? item.disabled : undefined}
			onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
				if (item.disabled) return;
				root.toggleItem(item.value);
				onClick?.(e);
			}}
			{...props}
		/>
	);
});
