"use client";

import * as React from "react";
// Replace it with your primitives export, e.g.:
import {
	TooltipProvider as TooltipProviderPrimitive,
	Tooltip as TooltipRootPrimitive,
	TooltipTrigger as TooltipTriggerPrimitive,
	TooltipContent as TooltipContentPrimitive,
	TooltipArrow as TooltipArrowPrimitive,
	type TooltipProviderProps as TooltipProviderPrimitiveProps,
	type TooltipProps as TooltipRootPrimitiveProps,
	type TooltipTriggerProps as TooltipTriggerPrimitiveProps,
	type TooltipContentProps as TooltipContentPrimitiveProps,
} from "@haitch/react-tooltip"; // <-- adjust path

import { cn } from "../../lib/util";

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
	return (node: T) => {
		for (const ref of refs) {
			if (!ref) continue;
			if (typeof ref === "function") ref(node);
			else (ref as any).current = node;
		}
	};
}

function TooltipProvider({ delayDuration = 0, ...props }: TooltipProviderPrimitiveProps) {
	return <TooltipProviderPrimitive data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />;
}

function Tooltip({ ...props }: TooltipRootPrimitiveProps) {
	return (
		<TooltipProvider>
			<TooltipRootPrimitive data-slot="tooltip" {...props} />
		</TooltipProvider>
	);
}

function TooltipTrigger({ ...props }: TooltipTriggerPrimitiveProps) {
	return <TooltipTriggerPrimitive data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({ className, sideOffset = 6, collisionPadding = 8, children, portalled = true, ...props }: TooltipContentPrimitiveProps) {
	return (
		<TooltipContentPrimitive
			sideOffset={sideOffset}
			collisionPadding={collisionPadding}
			portalled={portalled}
			className={cn(
				"relative",
				"z-50 w-fit px-3 py-1.5 text-xs",
				"bg-foreground text-background shadow-sm",
				"rounded-radius-md",
				className
			)}
			{...props}
		>
			{children}
		</TooltipContentPrimitive>
	);
}

function TooltipArrow() {
	return (
		<TooltipArrowPrimitive className={"fill-popover-foreground"} />
	);
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TooltipArrow };
