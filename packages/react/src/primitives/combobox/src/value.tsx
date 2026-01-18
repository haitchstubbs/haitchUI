"use client";

import * as React from "react";
import { Slot } from "@/primitives/slot/src";
import { useComboboxContext } from "./context";
import type { ValueProps } from "./types";

export const Value = React.forwardRef<HTMLSpanElement, ValueProps>(function Value(
	{ asChild, placeholder, children, ...props },
	forwardedRef
) {
	const ctx = useComboboxContext("Combobox.Value");
	const Comp: any = asChild ? Slot : "span";

	const content = children ?? (ctx.inputValue ? ctx.inputValue : placeholder);
	return (
		<Comp ref={forwardedRef} {...props} data-empty={!ctx.inputValue ? "" : undefined}>
			{content}
		</Comp>
	);
});

