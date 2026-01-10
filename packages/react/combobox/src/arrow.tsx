"use client";

import * as React from "react";
import { FloatingArrow } from "@floating-ui/react";
import { useComboboxContext } from "./context";
import type { ArrowProps } from "./types";

export const Arrow = React.forwardRef<SVGSVGElement, ArrowProps>(function Arrow(props, forwardedRef) {
	const ctx = useComboboxContext("Combobox.Arrow");
	return <FloatingArrow ref={forwardedRef} context={ctx.floatingContext} {...props} />;
});
