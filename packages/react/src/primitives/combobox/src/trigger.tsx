"use client";

import * as React from "react";
import { Slot } from "@/primitives/slot";
import { composeEventHandlers } from "./events";
import { useComboboxContext } from "./context";
import type { TriggerProps } from "./types";

export const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(function Trigger(
	{ asChild, onClick, ...props },
	forwardedRef
) {
	const ctx = useComboboxContext("Combobox.Trigger");
	const Comp: any = asChild ? Slot : "button";

	return (
		<Comp
			ref={forwardedRef}
			type="button"
			aria-haspopup="listbox"
			aria-expanded={ctx.open}
			disabled={ctx.disabled || props.disabled}
			{...props}
			onClick={composeEventHandlers(onClick as any, (e: React.MouseEvent) => {
				if (ctx.disabled) return;
				ctx.setOpen(!ctx.open, { reason: "toggle", nativeEvent: e.nativeEvent });
			})}
		/>
	);
});
