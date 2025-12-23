"use client";

import * as React from "react";
import { FloatingFocusManager, FloatingPortal, type Strategy, type Middleware } from "@floating-ui/react";
import { Popover as PopoverService } from "@haitch/core/client";
import type { RectLike } from "@haitch/core";
import {
	PopoverContext,
	useControllableOpen,
	useOverlayDOMManager,
	usePopoverContext,
	usePopoverFloating,
	type OverlayDOM,
} from "@haitch/core/client";
import { Slot } from "../lib/slot";
import { composeRefs } from "../lib/compose-refs";
import { cn } from "../lib/cn";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

type PopoverProps = React.PropsWithChildren<{
	dom?: OverlayDOM;

	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;

	side?: Side;
	align?: Align;
	sideOffset?: number;

	strategy?: Strategy;
	middleware?: Middleware[];

	closeOnEscape?: boolean;
	closeOnOutsidePress?: boolean;
	modal?: boolean;

	virtualRect?: RectLike;
	virtualContextElement?: Element | null;
}>;

export function Popover(props: PopoverProps) {
	const parent = useOverlayDOMManager();
	const manager = React.useMemo(() => parent.fork(props.dom), [parent, props.dom]);

	const { open, setOpen } = useControllableOpen(props);

	const floating = usePopoverFloating({
		open,
		setOpen,
		dom: manager.dom,
		side: props.side,
		align: props.align,
		sideOffset: props.sideOffset,
		strategy: props.strategy,
		middleware: props.middleware,
		virtualRect: props.virtualRect,
		virtualContextElement: props.virtualContextElement,
		closeOnEscape: props.closeOnEscape ?? true,
		closeOnOutsidePress: props.closeOnOutsidePress ?? true,
	});

	const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(null);

	React.useEffect(() => {
		setPortalRoot(manager.dom.getPortalContainer());
	}, [manager.dom]);

	const value = React.useMemo(
		() => ({
			open,
			setOpen,
			placement: floating.placement,
			refs: floating.floating.refs,
			floatingStyles: floating.floating.floatingStyles,
			getReferenceProps: floating.interactions.getReferenceProps,
			getFloatingProps: floating.interactions.getFloatingProps,
			portalRoot,
			modal: props.modal ?? false,
			closeOnOutsidePress: props.closeOnOutsidePress ?? true,
			closeOnEscape: props.closeOnEscape ?? true,
			isOutside: floating.isOutside,
			isMounted: floating.isMounted,
			transitionStyles: floating.transitionStyles,
			setContentOverrides: floating.setContentOverrides,
			floatingContext: floating.floatingContext,
		}),
		[open, portalRoot, floating, props]
	);

	return <PopoverContext.Provider value={value}>{props.children}</PopoverContext.Provider>;
}

type PopoverTriggerProps = React.HTMLAttributes<HTMLElement> & {
	asChild?: boolean;
};

export const PopoverTrigger = React.forwardRef<HTMLElement, PopoverTriggerProps>(function PopoverTrigger(
	{ asChild, children, ...props },
	forwardedRef
) {
	const ctx = usePopoverContext();
	const mergedRef = composeRefs(forwardedRef, ctx.refs.setReference as any);

	const triggerProps = ctx.getReferenceProps({
		...(props as any),
		ref: mergedRef,
		"data-slot": "popover-trigger",
		"data-state": ctx.open ? "open" : "closed",
	});

	React.useEffect(() => {
		console.log("reference node:", ctx.refs.reference.current);
	}, [ctx.refs.reference]);

	if (asChild) return <Slot {...(triggerProps as any)}>{children}</Slot>;
	return <span {...(triggerProps as any)}>{children}</span>;
});

type PopoverAnchorProps = React.HTMLAttributes<HTMLElement> & {
	asChild?: boolean;
};

/**
 * Optional, shadcn-compatible helper:
 * <PopoverAnchor /> lets you set the positioning anchor without being the click trigger.
 */
export const PopoverAnchor = React.forwardRef<HTMLElement, PopoverAnchorProps>(function PopoverAnchor({ asChild, children, ...props }, forwardedRef) {
	const ctx = usePopoverContext();
	const mergedRef = composeRefs(forwardedRef, ctx.refs.setReference as any);

	const anchorProps = {
		...props,
		ref: mergedRef,
		"data-slot": "popover-anchor",
	};

	if (asChild) return <Slot {...(anchorProps as any)}>{children}</Slot>;
	return <span {...(anchorProps as any)}>{children}</span>;
});

type PopoverContentProps = React.HTMLAttributes<HTMLDivElement> & {
	asChild?: boolean;
	className?: string;

	// shadcn-ish props
	side?: Side;
	align?: Align;
	sideOffset?: number;
};

export const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(function PopoverContent(
	{ asChild, children, style, className, side, align, sideOffset, ...props },
	forwardedRef
) {
	const ctx = usePopoverContext();

	React.useEffect(() => {
		ctx.setContentOverrides({ side, align, sideOffset });
		return () => ctx.setContentOverrides({});
	}, [ctx, side, align, sideOffset]);

	if (!ctx.isMounted) return null;

	const placementSide = PopoverService.sideFromPlacement(ctx.placement);
	const resolvedAlign = align ?? PopoverService.alignFromPlacement(ctx.placement);

	const floatingProps = ctx.getFloatingProps({
		...props,
		ref: composeRefs(forwardedRef, ctx.refs.setFloating as any),
		"data-slot": "popover-content",
		"data-state": ctx.open ? "open" : "closed",
		"data-side": placementSide,
		"data-align": resolvedAlign,
		style: {
			...ctx.floatingStyles,
			...ctx.transitionStyles,
			...style,
			transform: [ctx.floatingStyles.transform, ctx.transitionStyles.transform, style?.transform].filter(Boolean).join(" "),
		},
		className: cn(
			"bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-ui-radius border border-border p-4 shadow-md outline-hidden",
			className
		),
	} as React.HTMLAttributes<HTMLDivElement>);

	const node = asChild ? <Slot {...(floatingProps as any)}>{children}</Slot> : <div {...floatingProps}>{children}</div>;

	const maybeFocusManaged = ctx.modal ? (
		<FloatingFocusManager context={ctx.floatingContext} modal>
			{node}
		</FloatingFocusManager>
	) : (
		node
	);

	return <FloatingPortal root={ctx.portalRoot}>{maybeFocusManaged}</FloatingPortal>;
});
