"use client";

import * as React from "react";
import { Slot } from "@haitch-ui/react-slot";
import { useComboboxContext } from "./context";
import type { ItemIndicatorProps } from "./types";

export const ItemIndicator = React.forwardRef<HTMLSpanElement, ItemIndicatorProps>(function ItemIndicator(
	{ asChild, ...props },
	forwardedRef
) {
	useComboboxContext("Combobox.ItemIndicator");
	const Comp: any = asChild ? Slot : "span";
	return <Comp ref={forwardedRef} {...props} />;
});
