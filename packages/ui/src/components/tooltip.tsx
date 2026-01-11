"use client";
import React from "react";
import * as TooltipPrimitive from "@haitch-ui/react-tooltip";
import { FloatingPortal, useMergeRefs, type Placement } from "@floating-ui/react";

type WithDataState = { "data-state"?: "open" | "closed" };
type ContextType = ReturnType<typeof TooltipPrimitive.useTooltip> | null;

const TooltipContext = React.createContext<ContextType>(null);

export const useTooltipContext = () => {
	const context = React.useContext(TooltipContext);

	if (context == null) {
		throw new Error("Tooltip components must be wrapped in <Tooltip />");
	}

	return context;
};

interface TooltipOptions {
	initialOpen?: boolean;
	placement?: Placement;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function Tooltip({ children, ...options }: { children: React.ReactNode } & TooltipOptions) {
	// This can accept any props as options, e.g. `placement`,
	// or other positioning options.
	const tooltip = TooltipPrimitive.useTooltip(options);
	return <TooltipContext.Provider value={tooltip}>{children}</TooltipContext.Provider>;
}

export const TooltipTrigger = React.forwardRef<HTMLElement, React.HTMLProps<HTMLElement> & { asChild?: boolean }>(function TooltipTrigger(
	{ children, asChild = false, ...props },
	propRef
) {
	const context = useTooltipContext();
	const childrenRef = (children as any).ref;
	const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

	// `asChild` allows the user to pass any element as the anchor
	if (asChild && React.isValidElement(children)) {
		return React.cloneElement(
			children,
			context.getReferenceProps({
				ref,
				...props,
				...(typeof children.props === "object" ? children.props : {}),
				"data-state": context.open ? "open" : "closed",
			} as React.HTMLProps<HTMLElement> & WithDataState)
		);
	}

	return (
		<button
			ref={ref as React.Ref<HTMLButtonElement>}
			// The user can style the trigger based on the state
			data-state={context.open ? "open" : "closed"}
			{...context.getReferenceProps(props)}
		>
			{children}
		</button>
	);
});

export const TooltipContent = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(function TooltipContent(
	{ style, ...props },
	propRef
) {
	const context = useTooltipContext();
	const ref = useMergeRefs([context.refs.setFloating, propRef]);

	if (!context.open) return null;

	return (
		<FloatingPortal>
			<div
				ref={ref as React.Ref<HTMLDivElement>}
				style={{
					...context.floatingStyles,
					...style,
				}}
				{...context.getFloatingProps(props)}
			/>
		</FloatingPortal>
	);
});
