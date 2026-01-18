"use client";

import * as React from "react";
import { Slot } from "@/slot/src";
import { useComboboxContext } from "./context";
import type { GroupLabelProps } from "./types";

export const GroupLabel = React.forwardRef<HTMLDivElement, GroupLabelProps>(function GroupLabel(
	{ asChild, ...props },
	forwardedRef
) {
	useComboboxContext("Combobox.GroupLabel");
	const Comp: any = asChild ? Slot : "div";
	return <Comp ref={forwardedRef} {...props} />;
});

