"use client";

import * as React from "react";
import { Slot } from "@haitch/react-slot";
import { useComboboxContext } from "./context";
import type { ChipsProps } from "./types";

export const Chips = React.forwardRef<HTMLDivElement, ChipsProps>(function Chips({ asChild, ...props }, forwardedRef) {
	const ctx = useComboboxContext("Combobox.Chips");
	const Comp: any = asChild ? Slot : "div";

	const isEmpty = ctx.multiple ? !Array.isArray(ctx.value) || ctx.value.length === 0 : ctx.value == null;
	const chips = ctx.multiple && Array.isArray(ctx.value) ? ctx.value.map((v, i) => ({ id: `${String(v)}-${i}`, value: v })) : [];

	const children = typeof props.children === "function" ? (props.children as any)(chips) : props.children;

	return (
		<Comp ref={forwardedRef} {...props} data-empty={isEmpty ? "" : undefined}>
			{children}
		</Comp>
	);
});
