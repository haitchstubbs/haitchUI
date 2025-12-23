"use client";

import * as React from "react";
import {
	FloatingFocusManager,
	FloatingPortal,
	autoUpdate,
	flip,
	offset,
	shift,
	useClick,
	useDismiss,
	useFloating,
	useInteractions,
	useRole,
	useTransitionStyles,
	type Placement,
	type Strategy,
	type Middleware,
} from "@floating-ui/react";

import type { RectLike, VirtualElement } from "@haitch/core";
import { useOverlayDOMManager, type OverlayDOM } from "@haitch/core/client";
import { Slot } from "../lib/slot";
import { composeRefs } from "../lib/compose-refs";
import { cn } from "../lib/cn";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

function placementFromSideAlign(side: Side, align: Align): Placement {
	if (align === "center") return side;
	return `${side}-${align}` as Placement;
}

function sideFromPlacement(p: Placement): Side {
	return p.split("-")[0] as Side;
}

function alignFromPlacement(p: Placement): Align {
	const parts = p.split("-");
	return (parts[1] as Align) ?? "center";
}

type PopoverContextValue = {
	open: boolean;
	setOpen: (open: boolean) => void;

	// positioning
	placement: Placement;
	refs: ReturnType<typeof useFloating>["refs"];
	floatingStyles: React.CSSProperties;
	getReferenceProps: ReturnType<typeof useInteractions>["getReferenceProps"];
	getFloatingProps: ReturnType<typeof useInteractions>["getFloatingProps"];

	portalRoot: HTMLElement | null;

	modal: boolean;
	closeOnOutsidePress: boolean;
	closeOnEscape: boolean;

	// shadow-dom-safe outside press
	isOutside: (event: Event) => boolean;

	// transition (Radix-like presence)
	isMounted: boolean;
	transitionStyles: React.CSSProperties;

	// per-content overrides
	setContentOverrides: (overrides: {
		side?: Side;
		align?: Align;
		sideOffset?: number;
	}) => void;
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
	const ctx = React.useContext(PopoverContext);
	if (!ctx) throw new Error("Popover components must be used within <Popover>.");
	return ctx;
}

type PopoverProps = {
	dom?: OverlayDOM;

	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;

	// shadcn-like API
	side?: Side;
	align?: Align;
	sideOffset?: number;

	strategy?: Strategy;
	middleware?: Middleware[];

	closeOnEscape?: boolean;
	closeOnOutsidePress?: boolean;
	modal?: boolean;

	// Virtual reference support (canvas/webgl)
	virtualRect?: RectLike;
	virtualContextElement?: Element | null;
};

function useControllableOpen(opts: Pick<PopoverProps, "open" | "defaultOpen" | "onOpenChange">) {
	const [uncontrolled, setUncontrolled] = React.useState<boolean>(opts.defaultOpen ?? false);
	const controlled = typeof opts.open === "boolean";
	const open = controlled ? (opts.open as boolean) : uncontrolled;

	const setOpen = React.useCallback(
		(next: boolean) => {
			if (!controlled) setUncontrolled(next);
			opts.onOpenChange?.(next);
		},
		[controlled, opts]
	);

	return { open, setOpen };
}

export function Popover(props: React.PropsWithChildren<PopoverProps>) {
	const parentManager = useOverlayDOMManager();
	const manager = React.useMemo(() => parentManager.fork(props.dom), [parentManager, props.dom]);
	const dom = manager.dom;

	const { open, setOpen } = useControllableOpen(props);

	const [contentOverrides, setContentOverrides] = React.useState<{
		side?: Side;
		align?: Align;
		sideOffset?: number;
	}>({});

	const placement = React.useMemo<Placement>(() => {
		const side = contentOverrides.side ?? props.side ?? "bottom";
		const align = contentOverrides.align ?? props.align ?? "center";
		return placementFromSideAlign(side, align);
	}, [contentOverrides.side, contentOverrides.align, props.side, props.align]);

	const middleware = React.useMemo(() => {
		const m: Middleware[] = [];
		const resolvedOffset = contentOverrides.sideOffset ?? props.sideOffset ?? 4;
		m.push(offset(resolvedOffset)); // shadcn default-ish
		m.push(flip());
		m.push(shift({ padding: 8 }));
		if (props.middleware?.length) m.push(...props.middleware);
		return m;
	}, [contentOverrides.sideOffset, props.sideOffset, props.middleware]);

	const floating = useFloating({
		open,
		onOpenChange: setOpen,
		placement,
		strategy: props.strategy ?? "absolute",
		middleware,
		whileElementsMounted: autoUpdate,
	});

	// Virtual reference support (canvas/webgl)
	React.useEffect(() => {
		if (!props.virtualRect) return;
		const ve: VirtualElement = dom.createVirtualElement(props.virtualRect, {
			contextElement: props.virtualContextElement,
		});
		floating.refs.setReference(ve as any);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.virtualRect, props.virtualContextElement, dom]);

	const closeOnEscape = props.closeOnEscape ?? true;
	const closeOnOutsidePress = props.closeOnOutsidePress ?? true;
	const modal = props.modal ?? false;

	const isOutside = React.useCallback(
		(event: Event) => dom.isEventOutside(event, [floating.refs.reference.current as any, floating.refs.floating.current as any]),
		[dom, floating.refs]
	);

	const click = useClick(floating.context, { enabled: true });
	const dismiss = useDismiss(floating.context, {
		enabled: true,
		escapeKey: closeOnEscape,
		outsidePressEvent: "pointerdown",
		outsidePress: (event) => {
			if (!closeOnOutsidePress) return false;

			const refEl = floating.refs.reference.current as HTMLElement | null;
			const floatEl = floating.refs.floating.current as HTMLElement | null;

			const target = event.target as Node | null;

			// Plain containment guard first (works for normal DOM)
			if (target && refEl?.contains(target)) return false;
			if (target && floatEl?.contains(target)) return false;

			// Shadow/portal safe fallback
			return dom.isEventOutside(event, [refEl as any, floatEl as any]);
		},
	});

	const role = useRole(floating.context, { role: "dialog" });

	const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

	const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(null);

	React.useEffect(() => {
		if (typeof document === "undefined") return;
		setPortalRoot(dom.getPortalContainer());
	}, [dom]);

	// Radix-like presence so "closed" can animate out.
	// (You can also rely purely on Tailwind data-[state=...] classes; this ensures it stays mounted briefly.)
	const { isMounted, styles: transitionStyles } = useTransitionStyles(floating.context, {
		duration: { open: 120, close: 100 },
		initial: { opacity: 0, transform: "scale(0.95)" },
		open: { opacity: 1, transform: "scale(1)" },
		close: { opacity: 0, transform: "scale(0.95)" },
	});

	const value = React.useMemo<PopoverContextValue>(
		() => ({
			open,
			setOpen,
			placement,
			refs: floating.refs,
			floatingStyles: floating.floatingStyles,
			getReferenceProps,
			getFloatingProps,
			portalRoot,
			modal,
			closeOnOutsidePress,
			closeOnEscape,
			isOutside,
			isMounted,
			transitionStyles,
			setContentOverrides,
		}),
		[
			open,
			setOpen,
			placement,
			floating.refs,
			floating.floatingStyles,
			getReferenceProps,
			getFloatingProps,
			portalRoot,
			modal,
			closeOnOutsidePress,
			closeOnEscape,
			isOutside,
			isMounted,
			transitionStyles,
			setContentOverrides,
		]
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

	const placementSide = sideFromPlacement(ctx.placement);
	const resolvedAlign = align ?? alignFromPlacement(ctx.placement);

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
			transform: [
				ctx.floatingStyles.transform,
				ctx.transitionStyles.transform,
				style?.transform,
			]
				.filter(Boolean)
				.join(" "),
		},
		className: cn(
			"bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-ui-radius border border-border p-4 shadow-md outline-hidden",
			className
		),
	} as React.HTMLAttributes<HTMLDivElement>);

	const node = asChild ? <Slot {...(floatingProps as any)}>{children}</Slot> : <div {...floatingProps}>{children}</div>;

	const maybeFocusManaged = ctx.modal ? (
		<FloatingFocusManager context={ctx.refs.floating as any} modal={true}>
			{node}
		</FloatingFocusManager>
	) : (
		node
	);

	return <FloatingPortal root={ctx.portalRoot}>{maybeFocusManaged}</FloatingPortal>;
});
