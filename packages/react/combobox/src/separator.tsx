"use client";

import * as React from "react";
import { Slot } from "@haitch/react-slot";
import { useComboboxContext } from "./context";
import type { SeparatorProps } from "./types";

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
	{ asChild, orientation = "horizontal", ...props },
	forwardedRef
) {
	useComboboxContext("Combobox.Separator");
	const Comp: any = asChild ? Slot : "div";
	return <Comp ref={forwardedRef} role="separator" aria-orientation={orientation} {...props} />;
});

