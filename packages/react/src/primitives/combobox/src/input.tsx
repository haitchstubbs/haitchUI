"use client";

import * as React from "react";
import { composeRefs } from "@/primitives/compose-refs/src";
import { Slot } from "@/primitives/slot/src";
import { composeEventHandlers } from "./events";
import { useComboboxContext } from "./context";
import type { InputProps } from "./types";

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
	{ asChild, onChange, onFocus, onKeyDown, ...props },
	forwardedRef
) {
	const ctx = useComboboxContext("Combobox.Input");
	const Comp: any = asChild ? Slot : "input";

	return (
		<Comp
			{...ctx.getReferenceProps({
				...props,
				role: "combobox",
				"aria-controls": ctx.listboxId,
				"aria-expanded": ctx.open,
				"aria-autocomplete": "list",
				onKeyDown: composeEventHandlers(onKeyDown as any, (e: React.KeyboardEvent<HTMLInputElement>) => {
					ctx.onKeyDown(e);
				}),
			})}
			ref={composeRefs(
				forwardedRef,
				(node: any) => {
					// reference element for Floating UI
					ctx.refs.reference(node);
					// inputRef for clear/focus mgmt
					ctx.inputRef.current = node as HTMLInputElement | null;
				},
			)}
			value={ctx.inputValue}
			disabled={ctx.disabled || props.disabled}
			onFocus={composeEventHandlers(onFocus as any, (e: React.FocusEvent<HTMLInputElement>) => {
				if (ctx.disabled) return;
				// Avoid “clear -> focus -> reopen”
				if (ctx.suppressOpenOnFocusRef.current) {
					ctx.suppressOpenOnFocusRef.current = false;
					return;
				}
				// Don’t force open on focus; keep conservative.
				// If you want “open on focus”, flip this on.
			})}
			onChange={composeEventHandlers(onChange as any, (e: React.ChangeEvent<HTMLInputElement>) => {
				if (ctx.disabled) return;
				const next = e.target.value ?? "";
				ctx.setInputValue(next, { reason: "input", nativeEvent: e.nativeEvent });
				if (!ctx.open) ctx.setOpen(true, { reason: "input", nativeEvent: e.nativeEvent });
			})}
		/>
	);
});
