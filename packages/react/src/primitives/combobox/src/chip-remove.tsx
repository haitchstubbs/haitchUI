"use client";

import * as React from "react";
import { Slot } from "@/primitives/slot";
import { composeEventHandlers } from "./events";
import { useComboboxContext } from "./context";
import { useComboboxChipContext } from "./chip";
import type { ChipRemoveProps } from "./types";

export const ChipRemove = React.forwardRef<HTMLButtonElement, ChipRemoveProps>(function ChipRemove(
	{ asChild, onClick, ...props },
	forwardedRef
) {
	const ctx = useComboboxContext("Combobox.ChipRemove");
	const chip = useComboboxChipContext("Combobox.ChipRemove");
	const Comp: any = asChild ? Slot : "button";

	return (
		<Comp
			ref={forwardedRef}
			type="button"
			disabled={ctx.disabled || (props as any).disabled}
			{...props}
			onClick={composeEventHandlers(onClick as any, (e: React.MouseEvent) => {
				if (ctx.disabled) return;
				ctx.suppressOpenOnFocusRef.current = true;

				if (ctx.multiple) {
					const current = Array.isArray(ctx.value) ? ctx.value : [];
					const next = current.filter((v) => !Object.is(v, chip.value));
					ctx.setValue(next, { reason: "clear", nativeEvent: e.nativeEvent });
				} else {
					ctx.setValue(null, { reason: "clear", nativeEvent: e.nativeEvent });
				}

				ctx.setInputValue("", { reason: "clear", nativeEvent: e.nativeEvent });
				ctx.setActiveIndex(-1);
				ctx.inputRef.current?.focus();
			})}
		/>
	);
});
