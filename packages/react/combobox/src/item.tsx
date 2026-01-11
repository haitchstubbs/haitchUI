"use client";

import * as React from "react";
import { Slot } from "@haitch-ui/react-slot";
import { composeRefs } from "@haitch-ui/react-compose-refs";
import { composeEventHandlers, normalizeTextValue } from "./events";
import { useComboboxContext, type ItemRecord } from "./context";
import type { ItemProps } from "./types";

export const Item = React.forwardRef<HTMLDivElement, ItemProps>(function Item(
	{ asChild, value, disabled = false, textValue, onMouseMove, onClick, ...props },
	forwardedRef
) {
	const ctx = useComboboxContext("Combobox.Item");
	const Comp: any = asChild ? Slot : "div";

	const ref = React.useRef<HTMLElement | null>(null);

	React.useLayoutEffect(() => {
		const record: ItemRecord = {
			value,
			disabled,
			textValue: normalizeTextValue({ value, textValue }),
			ref,
		};
		const unregister = ctx.registerItem(record);
		ctx.notifyItemsChanged();
		return () => {
			unregister();
			ctx.notifyItemsChanged();
		};
	}, [ctx, value, disabled, textValue]);

	const selected = (() => {
		if (ctx.multiple) return Array.isArray(ctx.value) && ctx.value.some((v) => Object.is(v, value));
		return ctx.value !== null && !Array.isArray(ctx.value) && Object.is(ctx.value, value);
	})();
	const highlighted = (() => {
		const items = ctx.getItems();
		const idx = items.findIndex((x) => x.ref.current === ref.current);
		return idx >= 0 && idx === ctx.activeIndex;
	})();

	return (
		<Comp
			{...props}
			ref={composeRefs(forwardedRef as any, ref as any)}
			role="option"
			aria-selected={selected}
			aria-disabled={disabled || undefined}
			data-selected={selected ? "" : undefined}
			data-highlighted={highlighted ? "" : undefined}
			data-disabled={disabled ? "" : undefined}
			onMouseMove={composeEventHandlers(onMouseMove as any, () => {
				if (disabled) return;
				const items = ctx.getItems();
				const idx = items.findIndex((x) => x.ref.current === ref.current);
				if (idx >= 0) ctx.setActiveIndex(idx);
			})}
			onClick={composeEventHandlers(onClick as any, (e: React.MouseEvent) => {
				if (disabled) return;
				if (ctx.multiple) {
					const current = Array.isArray(ctx.value) ? ctx.value : [];
					const next = current.some((v) => Object.is(v, value)) ? current.filter((v) => !Object.is(v, value)) : [...current, value];
					ctx.setValue(next, { reason: "select", nativeEvent: e.nativeEvent });
					ctx.setInputValue("", { reason: "select", nativeEvent: e.nativeEvent });
					if (!ctx.open) ctx.setOpen(true, { reason: "open", nativeEvent: e.nativeEvent });
				} else {
					ctx.setValue(value, { reason: "select", nativeEvent: e.nativeEvent });
					ctx.setInputValue(normalizeTextValue({ value, textValue }), { reason: "select", nativeEvent: e.nativeEvent });
					ctx.setOpen(false, { reason: "close", nativeEvent: e.nativeEvent });
				}
			})}
		/>
	);
});
