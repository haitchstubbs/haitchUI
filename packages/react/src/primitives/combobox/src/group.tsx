"use client";

import * as React from "react";
import { Slot } from "@/primitives/slot/src";
import { useComboboxContext } from "./context";
import type { GroupProps } from "./types";

export const Group = React.forwardRef<HTMLDivElement, GroupProps>(function Group({ asChild, ...props }, forwardedRef) {
	useComboboxContext("Combobox.Group");
	const Comp: any = asChild ? Slot : "div";
	return <Comp ref={forwardedRef} role="group" {...props} />;
});

