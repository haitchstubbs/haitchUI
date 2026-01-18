"use client";

import * as React from "react";
import { Slot } from "@/slot/src";
import { useComboboxContext } from "./context";
import type { IconProps } from "./types";

export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(function Icon({ asChild, ...props }, forwardedRef) {
	useComboboxContext("Combobox.Icon");
	const Comp: any = asChild ? Slot : "span";
	return <Comp ref={forwardedRef} aria-hidden="true" {...props} />;
});

