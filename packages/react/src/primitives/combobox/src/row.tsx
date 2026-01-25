"use client";

import * as React from "react";
import { Slot } from "@/primitives/slot";
import { useComboboxContext } from "./context";
import type { RowProps } from "./types";

export const Row = React.forwardRef<HTMLDivElement, RowProps>(function Row({ asChild, ...props }, forwardedRef) {
	useComboboxContext("Combobox.Row");
	const Comp: any = asChild ? Slot : "div";
	return <Comp ref={forwardedRef} {...props} />;
});

