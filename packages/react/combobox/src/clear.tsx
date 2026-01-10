"use client";

import * as React from "react";
import { Slot } from "@haitch-ui/react-slot";
import { composeEventHandlers } from "./events";
import { useComboboxContext } from "./context";
import type { ClearProps } from "./types";

export const Clear = React.forwardRef<HTMLButtonElement, ClearProps>(function Clear(
	{ asChild, onClick, ...props },
	forwardedRef
) {
	const ctx = useComboboxContext("Combobox.Clear");
	const Comp: any = asChild ? Slot : "button";

	return (
		<Comp
			ref={forwardedRef}
			type="button"
			disabled={ctx.disabled || props.disabled}
			{...props}
			onClick={composeEventHandlers(onClick as any, (e: React.MouseEvent) => {
				if (ctx.disabled) return;

				// Prevent: "portal closes then opens again" after clearing.
				// We suppress any open-on-focus behavior for the next focus.
				ctx.suppressOpenOnFocusRef.current = true;

				ctx.setValue(ctx.multiple ? [] : null, { reason: "clear", nativeEvent: e.nativeEvent });
				ctx.setInputValue("", { reason: "clear", nativeEvent: e.nativeEvent });
				ctx.setActiveIndex(-1);
				ctx.setOpen(false, { reason: "close", nativeEvent: e.nativeEvent });

				// Keep focus UX nice
				ctx.inputRef.current?.focus();
			})}
		/>
	);
});
