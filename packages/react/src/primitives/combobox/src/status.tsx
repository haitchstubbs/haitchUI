"use client";

import * as React from "react";
import { Slot } from "@/primitives/slot";
import { useComboboxContext } from "./context";
import type { StatusProps } from "./types";

export const Status = React.forwardRef<HTMLDivElement, StatusProps>(function Status({ asChild, ...props }, forwardedRef) {
	const ctx = useComboboxContext("Combobox.Status");
	const Comp: any = asChild ? Slot : "div";
	return (
		<Comp
			ref={forwardedRef}
			aria-live="polite"
			aria-atomic="true"
			{...props}
			data-open={ctx.open ? "" : undefined}
			data-empty={ctx.isEmpty ? "" : undefined}
		/>
	);
});
