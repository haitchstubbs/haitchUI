"use client";

import * as React from "react";
import { Slot } from "@/primitives/slot";
import { composeEventHandlers } from "./events";
import { useComboboxContext } from "./context";
import type { BackdropProps } from "./types";

export const Backdrop = React.forwardRef<HTMLDivElement, BackdropProps>(function Backdrop(
	{ asChild, forceMount, onPointerDown, ...props },
	forwardedRef
) {
	const ctx = useComboboxContext("Combobox.Backdrop");
	const Comp: any = asChild ? Slot : "div";

	const mounted = forceMount ? true : ctx.isMounted;
	if (!mounted || !ctx.modal) return null;

	return (
		<Comp
			ref={forwardedRef}
			aria-hidden="true"
			{...props}
			onPointerDown={composeEventHandlers(onPointerDown as any, (e: React.PointerEvent) => {
				if (!ctx.open) return;
				ctx.setOpen(false, { reason: "outside-press", nativeEvent: e.nativeEvent });
			})}
			data-open={ctx.open ? "" : undefined}
			data-closed={!ctx.open ? "" : undefined}
		/>
	);
});

