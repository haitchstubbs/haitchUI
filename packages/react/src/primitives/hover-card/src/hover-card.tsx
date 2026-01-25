"use client";

import * as React from "react";
import {
	FloatingPortal,
	FloatingFocusManager,
	autoUpdate,
	flip,
	offset,
	shift,
	safePolygon,
	useDismiss,
	useFloating,
	useFocus,
	useHover,
	useInteractions,
	useRole,
	useTransitionStyles,
	type Alignment,
	type Middleware,
	type Side,
	type Placement,
} from "@floating-ui/react";
import { Slot } from "@/primitives/slot";
import { composeRefs } from "@/utils/compose-refs";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

type Align = "start" | "end" | "middle";
type ResolvedAlign = "start" | "end" | "center";

export type HoverCardProps = React.PropsWithChildren<{
	// open
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;

	// placement
	side?: Side;
	align?: Align;
	sideOffset?: number;

	/**
	 * Optional override for spacing, useful for shadcn wrappers.
	 * If provided, wins over `sideOffset`.
	 */
	sideOffsetOverride?: number;

	/**
	 * Extra Floating UI middleware (appended after the defaults).
	 */
	middleware?: Middleware[];

	/**
	 * "fixed" usually feels best for hovercards (scroll/transform safe).
	 */
	strategy?: "fixed" | "absolute";
}>;

export type HoverCardTriggerProps = React.ComponentPropsWithoutRef<"button"> & {
	asChild?: boolean;
};

export type HoverCardContentProps = React.ComponentPropsWithoutRef<"div"> & {
	// kept for shadcn compatibility; Root controls placement
	side?: Side;
	align?: Align;
	sideOffset?: number;
};

/* -------------------------------------------------------------------------------------------------
 * Small utils
 * -----------------------------------------------------------------------------------------------*/

function normalizeAlign(align: Align | undefined): ResolvedAlign {
	if (align === "middle") return "center";
	// if omitted, treat as "center" (no suffix)
	if (!align) return "center";
	return align;
}

function toPlacement(side: Side, align: Align | undefined): Placement {
	const a = normalizeAlign(align);
	// center == no alignment suffix
	if (a === "center") return side as Placement;
	return `${side}-${a}` as Placement;
}

function parsePlacement(placement: Placement): { side: Side; align: ResolvedAlign } {
	const [s, a] = placement.split("-") as [Side, "start" | "end" | undefined];
	return { side: s, align: a ?? "center" };
}
function resolveMiddleware(
	sideOffsetProp: number | undefined,
	sideOffsetOverride: number | undefined,
	middleware: Middleware[] | undefined
): Middleware[] {
	const m: Middleware[] = [];
	const resolvedOffset = sideOffsetOverride ?? sideOffsetProp ?? 4;
	m.push(offset(resolvedOffset));
	m.push(flip());
	m.push(shift({ padding: 8 }));
	if (middleware?.length) m.push(...middleware);
	return m;
}

function useControllableBoolean(opts: { value?: boolean; defaultValue?: boolean; onChange?: (v: boolean) => void }) {
	const [uncontrolled, setUncontrolled] = React.useState<boolean>(opts.defaultValue ?? false);
	const controlled = typeof opts.value === "boolean";
	const value = controlled ? (opts.value as boolean) : uncontrolled;

	const setValue = React.useCallback(
		(next: boolean) => {
			if (!controlled) setUncontrolled(next);
			opts.onChange?.(next);
		},
		[controlled, opts.onChange]
	);

	return { value, setValue };
}

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

type HoverCardContextValue = {
	open: boolean;
	setOpen: (open: boolean) => void;

	refs: ReturnType<typeof useFloating>["refs"];
	floatingStyles: React.CSSProperties;
	floatingContext: ReturnType<typeof useFloating>["context"];

	getReferenceProps: ReturnType<typeof useInteractions>["getReferenceProps"];
	getFloatingProps: ReturnType<typeof useInteractions>["getFloatingProps"];

	isMounted: boolean;
	transitionStyles: React.CSSProperties;

	side: Side;
	align: ResolvedAlign;

	portalRoot: HTMLElement | null;

	// for shadcn "origin-(--radix-...)" usage
	cssVars: React.CSSProperties;
};

const HoverCardContext = React.createContext<HoverCardContextValue | null>(null);

function useHoverCard() {
	const ctx = React.useContext(HoverCardContext);
	if (!ctx) throw new Error("HoverCard components must be used within <HoverCard.Root>.");
	return ctx;
}

/* -------------------------------------------------------------------------------------------------
 * Root
 * -----------------------------------------------------------------------------------------------*/

function Root(props: HoverCardProps) {
	const { value: open, setValue: setOpen } = useControllableBoolean({
		value: props.open,
		defaultValue: props.defaultOpen,
		onChange: props.onOpenChange,
	});

	const placement = React.useMemo<Placement>(() => {
		const side = props.side ?? "top";
		const align = props.align ?? "start";
		return toPlacement(side, align);
	}, [props.side, props.align]);

	const middleware = React.useMemo(
		() => resolveMiddleware(props.sideOffset, props.sideOffsetOverride, props.middleware),
		[props.sideOffset, props.sideOffsetOverride, props.middleware]
	);

	// No OverlayDOMProvider requirement: default to document.body
	const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(null);

	React.useEffect(() => {
		if (typeof document === "undefined") return;
		const el = document.querySelector(".ui-root");
		setPortalRoot(el instanceof HTMLElement ? el : document.body);
	}, []);

	const floating = useFloating({
		open,
		onOpenChange: setOpen,
		placement,
		strategy: props.strategy ?? "fixed",
		middleware,
		whileElementsMounted: autoUpdate,

		// keep positioning and animation transforms separate
		transform: false,
	});

	const hover = useHover(floating.context, {
		delay: { open: 100, close: 100 },
		move: false,
		// prevents “gap close” when moving between trigger/content
		handleClose: safePolygon({ buffer: 2 }),
	});

	// allow keyboard users to access hovercard
	const focus = useFocus(floating.context);

	const dismiss = useDismiss(floating.context, {
		escapeKey: true,
		outsidePress: true,
	});

	const role = useRole(floating.context, { role: "dialog" });

	const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

	const { isMounted, styles: transitionStyles } = useTransitionStyles(floating.context, {
		duration: { open: 120, close: 100 },
		initial: { opacity: 0, transform: "scale(0.95)" },
		open: { opacity: 1, transform: "scale(1)" },
		close: { opacity: 0, transform: "scale(0.95)" },
	});

	const [cssVars, setCssVars] = React.useState<React.CSSProperties>({});

	// Radix-ish transform origin for shadcn animation utilities
	React.useEffect(() => {
		const side = (floating.placement?.split("-")[0] as Side) ?? "top";
		const origin = side === "top" ? "bottom" : side === "bottom" ? "top" : side === "left" ? "right" : "left";

		setCssVars({
			["--radix-hover-card-content-transform-origin" as unknown as string]: origin,
		});
	}, [floating.placement]);

	const { side, align } = parsePlacement(floating.placement ?? ("top" as Placement));

	const value = React.useMemo<HoverCardContextValue>(
		() => ({
			open,
			setOpen,

			refs: floating.refs,
			floatingStyles: floating.floatingStyles,
			floatingContext: floating.context,

			getReferenceProps,
			getFloatingProps,

			isMounted,
			transitionStyles,

			side,
			align,

			portalRoot,
			cssVars,
		}),
		[
			open,
			setOpen,
			floating.refs,
			floating.floatingStyles,
			floating.context,
			getReferenceProps,
			getFloatingProps,
			isMounted,
			transitionStyles,
			side,
			align,
			portalRoot,
			cssVars,
		]
	);

	return <HoverCardContext.Provider value={value}>{props.children}</HoverCardContext.Provider>;
}

/* -------------------------------------------------------------------------------------------------
 * Trigger
 * -----------------------------------------------------------------------------------------------*/

const Trigger = React.forwardRef<HTMLButtonElement, HoverCardTriggerProps>(function Trigger({ asChild, ...props }, forwardedRef) {
	const ctx = useHoverCard();
	const Comp = asChild ? Slot : "button";

	const ref = composeRefs(forwardedRef, ctx.refs.setReference as unknown as React.Ref<HTMLButtonElement>);

	// Do not pass data-* into getReferenceProps (typing)
	const triggerProps = ctx.getReferenceProps({ ...props });

	return asChild ? (
		<Comp {...(triggerProps as any)} ref={ref} data-state={ctx.open ? "open" : "closed"} />
	) : (
		<button {...triggerProps} ref={ref} data-state={ctx.open ? "open" : "closed"} />
	);
});
Trigger.displayName = "HoverCardTrigger";

/* -------------------------------------------------------------------------------------------------
 * Content
 * -----------------------------------------------------------------------------------------------*/

const Content = React.forwardRef<HTMLDivElement, HoverCardContentProps>(function Content({ style, ...props }, forwardedRef) {
	const ctx = useHoverCard();
	if (!ctx.isMounted) return null;

	const ref = composeRefs(forwardedRef, ctx.refs.setFloating as unknown as React.Ref<HTMLDivElement>);

	// Do not pass data-* or ref into getFloatingProps (typing)
	const floatingProps = ctx.getFloatingProps({
		...props,
		style: {
			...ctx.floatingStyles,
			...ctx.transitionStyles,
			...ctx.cssVars,
			...style,
		},
	});

	return (
		<FloatingPortal root={ctx.portalRoot}>
			<FloatingFocusManager context={ctx.floatingContext} modal={false}>
				<div {...floatingProps} ref={ref} data-state={ctx.open ? "open" : "closed"} data-side={ctx.side} data-align={ctx.align} />
			</FloatingFocusManager>
		</FloatingPortal>
	);
});
Content.displayName = "HoverCardContent";

/* -------------------------------------------------------------------------------------------------
 * Exports (primitive + namespace)
 * -----------------------------------------------------------------------------------------------*/

export { Root, Trigger, Content };

const HoverCard = { Root, Trigger, Content } as const;
export { HoverCard };
