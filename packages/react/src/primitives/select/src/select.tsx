"use client";

import * as React from "react";
import {
	FloatingPortal,
	FloatingFocusManager,
	autoUpdate,
	flip,
	offset,
	shift,
	size,
	useClick,
	useDismiss,
	useFloating,
	useInteractions,
	useListItem,
	useListNavigation,
	useRole,
	useTransitionStyles,
	useTypeahead,
	type Alignment,
	type Placement as FloatingPlacement,
	type Side,
} from "@floating-ui/react";
import { Slot } from "@/primitives/slot/src";
import { composeRefs } from "@/primitives/compose-refs/src";
import { useOverlayDOMManager } from "@/primitives/overlay/src";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

export type SelectValue = string;
export type SelectPosition = "item-aligned" | "popper";
export type Align = Alignment | "center";

export type RootProps = React.PropsWithChildren<{
	// open
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;

	// value
	value?: SelectValue;
	defaultValue?: SelectValue;
	onValueChange?: (value: SelectValue) => void;

	// placement
	side?: Side;
	align?: Align;
	sideOffset?: number;

	disabled?: boolean;

	// forms
	name?: string;
}>;

export type TriggerProps = React.ComponentPropsWithoutRef<"button"> & {
	asChild?: boolean;
};
export type ValueProps = React.ComponentPropsWithoutRef<"span"> & {
	placeholder?: React.ReactNode;
};

export type PortalProps = React.PropsWithChildren<{
	container?: HTMLElement | null;
}>;

export type ContentProps = React.ComponentPropsWithoutRef<"div"> & {
	position?: SelectPosition;
	align?: Align;
	sideOffset?: number;
};

export type ViewportProps = React.ComponentPropsWithoutRef<"div">;
export type GroupProps = React.ComponentPropsWithoutRef<"div">;
export type LabelProps = React.ComponentPropsWithoutRef<"div">;

export type ItemProps = React.ComponentPropsWithoutRef<"div"> & {
	value: SelectValue;
	disabled?: boolean;
	textValue?: string;
};

export type ItemTextProps = React.ComponentPropsWithoutRef<"span">;

export type ItemIndicatorProps = React.ComponentPropsWithoutRef<"span"> & {
	forceMount?: boolean;
};

export type SeparatorProps = React.ComponentPropsWithoutRef<"div">;
export type ScrollButtonProps = React.ComponentPropsWithoutRef<"div">;
export type IconProps = React.ComponentPropsWithoutRef<"span"> & {
	asChild?: boolean;
};

/* -------------------------------------------------------------------------------------------------
 * Small utils
 * -----------------------------------------------------------------------------------------------*/

function toPlacement(side: Side, align: Align): FloatingPlacement {
	// Floating UI placement strings are like: "bottom-start"
	return align ? (`${side}-${align}` as FloatingPlacement) : (side as FloatingPlacement);
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

function useControllableString(opts: { value?: string; defaultValue?: string; onChange?: (v: string) => void }) {
	const [uncontrolled, setUncontrolled] = React.useState<string | null>(opts.defaultValue ?? null);
	const controlled = typeof opts.value === "string";
	const value = controlled ? (opts.value as string) : uncontrolled;

	const setValue = React.useCallback(
		(next: string) => {
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

type RootCtx = {
	disabled: boolean;

	open: boolean;
	setOpen: (open: boolean) => void;

	value: SelectValue | null;
	setValue: (value: SelectValue) => void;

	// ids
	contentId: string;
	labelId: string;

	// elements
	triggerElRef: React.MutableRefObject<HTMLElement | null>;
	contentElRef: React.MutableRefObject<HTMLDivElement | null>;
	viewportElRef: React.MutableRefObject<HTMLDivElement | null>;

	// portal root (shadow-safe)
	portalRoot: HTMLElement | null;

	// floating-ui
	placement: FloatingPlacement;
	floatingStyles: React.CSSProperties;
	floatingContext: ReturnType<typeof useFloating>["context"];
	refs: ReturnType<typeof useFloating>["refs"];
	getReferenceProps: ReturnType<typeof useInteractions>["getReferenceProps"];
	getFloatingProps: ReturnType<typeof useInteractions>["getFloatingProps"];

	// transitions
	isMounted: boolean;
	transitionStyles: React.CSSProperties;

	// CSS vars (Radix-compatible names used by shadcn styles)
	cssVars: React.CSSProperties;

	// listbox navigation + typeahead
	activeIndex: number | null;
	setActiveIndex: (i: number | null) => void;
	selectedIndex: number | null;

	elementsRef: React.MutableRefObject<Array<HTMLElement | null>>;
	labelsRef: React.MutableRefObject<Array<string | null>>;
	valuesRef: React.MutableRefObject<Array<SelectValue | null>>;
	disabledRef: React.MutableRefObject<Array<boolean>>;
};

const RootContext = React.createContext<RootCtx | null>(null);

function useRoot() {
	const ctx = React.useContext(RootContext);
	if (!ctx) throw new Error("Select primitives must be used within <Select.Root>.");
	return ctx;
}

type ItemCtx = {
	selected: boolean;
	disabled: boolean;
	index: number;
};
const ItemContext = React.createContext<ItemCtx | null>(null);

function useItem() {
	const ctx = React.useContext(ItemContext);
	if (!ctx) throw new Error("Select.Item* components must be used within <Select.Item>.");
	return ctx;
}

/* -------------------------------------------------------------------------------------------------
 * Root
 * -----------------------------------------------------------------------------------------------*/

function Root(props: RootProps) {
	const parentManager = useOverlayDOMManager();
	const dom = parentManager.dom;

	const { value: open, setValue: setOpen } = useControllableBoolean({
		value: props.open,
		defaultValue: props.defaultOpen,
		onChange: props.onOpenChange,
	});

	const { value, setValue } = useControllableString({
		value: props.value,
		defaultValue: props.defaultValue,
		onChange: props.onValueChange,
	});

	const disabled = props.disabled ?? false;

	const contentId = React.useId();
	const labelId = React.useId();

	const triggerElRef = React.useRef<HTMLElement | null>(null);
	const contentElRef = React.useRef<HTMLDivElement | null>(null);
	const viewportElRef = React.useRef<HTMLDivElement | null>(null);

	const elementsRef = React.useRef<Array<HTMLElement | null>>([]);
	const labelsRef = React.useRef<Array<string | null>>([]);
	const valuesRef = React.useRef<Array<SelectValue | null>>([]);
	const disabledRef = React.useRef<Array<boolean>>([]);

	const selectedIndex = React.useMemo(() => {
		if (!value) return null;
		const idx = valuesRef.current.findIndex((v) => v === value);
		return idx >= 0 ? idx : null;
	}, [value]);

	const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

	const placement = React.useMemo<FloatingPlacement>(() => {
		const side: Side = props.side ?? "bottom";
		const align: Align = props.align ?? "start";
		return toPlacement(side, align);
	}, [props.side, props.align]);

	const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(() => {
		if (typeof document === "undefined") return null;
		return dom.getPortalContainer();
	});

	React.useEffect(() => {
		if (typeof document === "undefined") return;
		setPortalRoot(dom.getPortalContainer());
	}, [dom]);

	const [cssVars, setCssVars] = React.useState<React.CSSProperties>({});

	const floating = useFloating<HTMLElement>({
		open,
		onOpenChange: setOpen,
		placement,
		strategy: "fixed",
		whileElementsMounted: autoUpdate,
		middleware: [
			offset(props.sideOffset ?? 4),
			flip(),
			shift({ padding: 8 }),
			size({
				padding: 8,
				apply({ rects, availableHeight, elements }) {
					const triggerW = Math.round(rects.reference.width);
					const triggerH = Math.round(rects.reference.height);

					elements.floating.style.setProperty("--radix-select-trigger-width", `${triggerW}px`);
					elements.floating.style.setProperty("--radix-select-trigger-height", `${triggerH}px`);
					elements.floating.style.setProperty("--radix-select-content-available-height", `${Math.floor(availableHeight)}px`);
				},
			}),
		],
	});

	const click = useClick(floating.context, {
		enabled: !disabled,
		event: "mousedown",
		toggle: true,
	});

	const dismiss = useDismiss(floating.context, {
		enabled: true,
		escapeKey: true,
		outsidePressEvent: "pointerdown",
	});

	const role = useRole(floating.context, { role: "listbox" });

	// Keyboard nav + typeahead come from Floating UI (instead of custom MenuFocus)
	const listNav = useListNavigation(floating.context, {
		listRef: elementsRef,
		activeIndex,
		selectedIndex,
		onNavigate: setActiveIndex,
		loop: true,
		// This makes opening feel “select-like”: it focuses an option when opened
		focusItemOnOpen: true,
		virtual: true,
	});

	const typeahead = useTypeahead(floating.context, {
		listRef: labelsRef,
		activeIndex,
		onMatch: setActiveIndex,
		enabled: open,
	});

	const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role, listNav, typeahead]);

	const { isMounted, styles: transitionStyles } = useTransitionStyles(floating.context, {
		duration: { open: 120, close: 100 },
		initial: { opacity: 0, transform: "scale(0.98)" },
		open: { opacity: 1, transform: "scale(1)" },
		close: { opacity: 0, transform: "scale(0.98)" },
	});

	// Transform origin var for shadcn animations (Radix-ish)
	React.useEffect(() => {
		const side = (placement.split("-")[0] as Side) ?? "bottom";
		const origin = side === "top" ? "bottom" : side === "bottom" ? "top" : side === "left" ? "right" : "left";

		setCssVars((prev) => ({
			...prev,
			["--radix-select-content-transform-origin" as unknown as string]: origin,
		}));
	}, [placement]);

	// When opening, set activeIndex to selectedIndex, else first enabled
	React.useEffect(() => {
		if (!open) return;

		queueMicrotask(() => {
			const sel = selectedIndex;
			if (sel != null && !disabledRef.current[sel]) {
				setActiveIndex(sel);
				return;
			}

			const first = disabledRef.current.findIndex((d) => !d);
			setActiveIndex(first >= 0 ? first : null);
		});
	}, [open, selectedIndex]);

	// Restore focus to trigger after close
	React.useEffect(() => {
		if (!open) {
			const el = triggerElRef.current;
			queueMicrotask(() => el?.focus?.());
		}
	}, [open]);

	const ctx = React.useMemo<RootCtx>(
		() => ({
			disabled,
			open,
			setOpen,
			value,
			setValue,

			contentId,
			labelId,

			triggerElRef,
			contentElRef,
			viewportElRef,

			portalRoot,

			placement,
			refs: floating.refs,
			floatingContext: floating.context,
			floatingStyles: floating.floatingStyles,
			getReferenceProps,
			getFloatingProps,

			isMounted,
			transitionStyles,
			cssVars,

			activeIndex,
			setActiveIndex,
			selectedIndex,

			elementsRef,
			labelsRef,
			valuesRef,
			disabledRef,
		}),
		[
			disabled,
			open,
			setOpen,
			value,
			setValue,
			contentId,
			labelId,
			portalRoot,
			placement,
			floating.refs,
			floating.context,
			floating.floatingStyles,
			getReferenceProps,
			getFloatingProps,
			isMounted,
			transitionStyles,
			cssVars,
			activeIndex,
			selectedIndex,
		]
	);

	return (
		<RootContext.Provider value={ctx}>
			{props.children}
			{props.name ? <input type="hidden" name={props.name} value={value ?? ""} readOnly aria-hidden="true" /> : null}
		</RootContext.Provider>
	);
}

/* -------------------------------------------------------------------------------------------------
 * Trigger / Icon / Value / Portal
 * -----------------------------------------------------------------------------------------------*/

const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(function Trigger(
	{ asChild, disabled: disabledProp, children, onKeyDown, ...rest },
	forwardedRef
) {
	const ctx = useRoot();
	const disabled = ctx.disabled || Boolean(disabledProp);

	const Comp = asChild ? Slot : "button";

	const mergedRef = composeRefs(
		forwardedRef,
		(node: HTMLButtonElement | null) => {
			ctx.triggerElRef.current = node;
		},
		ctx.refs.setReference as unknown as React.Ref<HTMLButtonElement>
	);

	const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
		if (disabled) return;

		if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			ctx.setOpen(true);
		}

		onKeyDown?.(e);
	};

	// NOTE: do NOT pass `ref` or `data-*` here
	const referenceProps = ctx.getReferenceProps({
		...rest,
		onKeyDown: handleKeyDown,
	});

	const common = {
		ref: mergedRef,
		type: "button" as const,
		disabled,
		role: "combobox" as const,
		"aria-controls": ctx.contentId,
		"aria-expanded": ctx.open,
		"aria-haspopup": "listbox" as const,
		"aria-labelledby": ctx.labelId,
		"data-state": ctx.open ? "open" : "closed",
		"data-disabled": disabled ? "" : undefined,
	};

	return asChild ? (
		<Comp {...(referenceProps as any)} {...(common as any)}>
			{children}
		</Comp>
	) : (
		<button {...referenceProps} {...common}>
			{children}
		</button>
	);
});

const Icon = React.forwardRef<HTMLElement, IconProps>(function Icon({ asChild, ...props }, ref) {
	const Comp = asChild ? Slot : "span";
	return asChild ? (
		<Comp {...props} ref={ref} data-slot="select-icon" />
	) : (
		<span {...props} ref={ref as React.Ref<HTMLSpanElement>} data-slot="select-icon" />
	);
});

const Value = React.forwardRef<HTMLSpanElement, ValueProps>(function Value({ placeholder = null, children, ...props }, forwardedRef) {
	const ctx = useRoot();
	const hasValue = ctx.value != null && ctx.value !== "";

	return (
		<span {...props} ref={forwardedRef} data-placeholder={hasValue ? undefined : ""}>
			{children ?? (hasValue ? ctx.value : placeholder)}
		</span>
	);
});

function Portal({ children, container }: PortalProps) {
	const ctx = useRoot();
	const root = container ?? ctx.portalRoot;
	return <FloatingPortal root={root}>{children}</FloatingPortal>;
}

/* -------------------------------------------------------------------------------------------------
 * Content / Viewport
 * -----------------------------------------------------------------------------------------------*/

const Content = React.forwardRef<HTMLDivElement, ContentProps>(function Content(
	{ children, style, position = "item-aligned", align, ...props },
	forwardedRef
) {
	const ctx = useRoot();

	const resolvedAlign: Align = align ?? ((ctx.placement.split("-")[1] as Align) || "start");
	const side = (ctx.placement.split("-")[0] as Side) ?? "bottom";

	if (!ctx.isMounted) return null;

	// NOTE: do NOT pass `ref` or `data-*` here
	const floatingProps = ctx.getFloatingProps({
		...props,
		style: {
			...ctx.floatingStyles,
			...ctx.transitionStyles,
			...ctx.cssVars,
			...style,
			transform: [ctx.floatingStyles.transform, ctx.transitionStyles.transform, style?.transform].filter(Boolean).join(" "),
		},
	});

	const mergedRef = composeRefs(
		forwardedRef,
		(node: HTMLDivElement | null) => {
			ctx.contentElRef.current = node;
		},
		ctx.refs.setFloating as unknown as React.Ref<HTMLDivElement>
	);

	return (
		<FloatingFocusManager context={ctx.floatingContext} modal={false} returnFocus>
			<div
				{...floatingProps}
				ref={mergedRef}
				id={ctx.contentId}
				role="listbox"
				tabIndex={-1}
				aria-labelledby={ctx.labelId}
				data-state={ctx.open ? "open" : "closed"}
				data-side={side}
				data-align={resolvedAlign}
				data-position={position}
			>
				{children}
			</div>
		</FloatingFocusManager>
	);
});

const Viewport = React.forwardRef<HTMLDivElement, ViewportProps>(function Viewport(props, forwardedRef) {
	const ctx = useRoot();
	return (
		<div
			{...props}
			ref={composeRefs(forwardedRef, (node: HTMLDivElement | null) => void (ctx.viewportElRef.current = node))}
			data-slot="select-viewport"
		/>
	);
});

/* -------------------------------------------------------------------------------------------------
 * Group / Label / Separator
 * -----------------------------------------------------------------------------------------------*/

const Group = React.forwardRef<HTMLDivElement, GroupProps>(function Group(props, ref) {
	return <div {...props} ref={ref} role="group" data-slot="select-group" />;
});

const Label = React.forwardRef<HTMLDivElement, LabelProps>(function Label(props, ref) {
	const ctx = useRoot();
	return <div {...props} ref={ref} id={ctx.labelId} data-slot="select-label" />;
});

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(function Separator(props, ref) {
	return <div {...props} ref={ref} role="separator" data-slot="select-separator" />;
});

/* -------------------------------------------------------------------------------------------------
 * Item / ItemText / ItemIndicator
 * -----------------------------------------------------------------------------------------------*/

const Item = React.forwardRef<HTMLDivElement, ItemProps>(function Item(
	{ value, disabled = false, textValue, onClick, onKeyDown, ...props },
	forwardedRef
) {
	const ctx = useRoot();
	const isDisabled = ctx.disabled || disabled;

	// Register with Floating UI list system
	const { ref, index } = useListItem({ label: textValue ?? (props.children ? undefined : value) });

	// Keep parallel arrays for value + disabled + label (typeahead uses labelsRef)
	React.useLayoutEffect(() => {
		ctx.valuesRef.current[index] = value;
		ctx.disabledRef.current[index] = isDisabled;
		// `useListItem({label})` feeds typeahead internally, but we also keep a mirror
		ctx.labelsRef.current[index] = textValue ?? value;
	}, [ctx, index, value, isDisabled, textValue]);

	const selected = ctx.value === value;
	const active = ctx.activeIndex === index;

	const selectValue = (target: HTMLElement, originalEvent?: Event) => {
		// cancelable event so consumers can prevent close (Radix-ish)
		const ev = new CustomEvent<{ originalEvent?: Event }>("select", {
			bubbles: true,
			cancelable: true,
			detail: { originalEvent },
		});
		target.dispatchEvent(ev);

		ctx.setValue(value);
		ctx.setActiveIndex(index);

		if (!ev.defaultPrevented) ctx.setOpen(false);
	};

	return (
		<ItemContext.Provider value={{ selected, disabled: isDisabled, index }}>
			<div
				{...props}
				ref={composeRefs(forwardedRef, ref)}
				role="option"
				tabIndex={isDisabled ? undefined : active ? 0 : -1}
				aria-disabled={isDisabled ? "true" : undefined}
				aria-selected={selected}
				data-disabled={isDisabled ? "" : undefined}
				data-state={selected ? "checked" : "unchecked"}
				data-highlighted={active ? "" : undefined}
				data-value={value}
				data-text-value={textValue}
				onKeyDown={(e) => {
					if (isDisabled) return;

					// Let Floating UI list navigation handle arrows/home/end etc.
					// Keep “select” keys as Radix-ish behavior.
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						selectValue(e.currentTarget, e.nativeEvent);
						return;
					}

					onKeyDown?.(e);
				}}
				onPointerMove={() => {
					// Hover to highlight (common select behavior)
					if (!isDisabled) ctx.setActiveIndex(index);
				}}
				onClick={(e) => {
					if (isDisabled) {
						e.preventDefault();
						e.stopPropagation();
						return;
					}
					onClick?.(e);
					selectValue(e.currentTarget, e.nativeEvent);
				}}
			/>
		</ItemContext.Provider>
	);
});

const ItemText = React.forwardRef<HTMLSpanElement, ItemTextProps>(function ItemText(props, ref) {
	return <span {...props} ref={ref} data-slot="select-item-text" />;
});

const ItemIndicator = React.forwardRef<HTMLSpanElement, ItemIndicatorProps>(function ItemIndicator({ forceMount, ...props }, ref) {
	const item = useItem();
	if (!forceMount && !item.selected) return null;
	return <span {...props} ref={ref} aria-hidden="true" data-slot="select-item-indicator" />;
});

/* -------------------------------------------------------------------------------------------------
 * Scroll buttons (unchanged; they’re not really Floating UI territory)
 * -----------------------------------------------------------------------------------------------*/

function useViewportScroll(ctx: RootCtx) {
	const [canScrollUp, setCanScrollUp] = React.useState(false);
	const [canScrollDown, setCanScrollDown] = React.useState(false);

	const update = React.useCallback(() => {
		const el = ctx.viewportElRef.current;
		if (!el) {
			setCanScrollUp(false);
			setCanScrollDown(false);
			return;
		}
		setCanScrollUp(el.scrollTop > 0);
		setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight);
	}, [ctx]);

	React.useEffect(() => {
		if (!ctx.open) return;

		const el = ctx.viewportElRef.current;
		if (!el) return;

		update();

		const onScroll = () => update();
		el.addEventListener("scroll", onScroll, { passive: true });

		const ro = new ResizeObserver(() => update());
		ro.observe(el);

		return () => {
			el.removeEventListener("scroll", onScroll);
			ro.disconnect();
		};
	}, [ctx.open, update]);

	return { canScrollUp, canScrollDown };
}

function startContinuousScroll(el: HTMLElement, dir: 1 | -1) {
	let raf = 0;
	let active = true;

	const step = () => {
		if (!active) return;
		el.scrollTop += dir * 12;
		raf = requestAnimationFrame(step);
	};

	raf = requestAnimationFrame(step);

	return () => {
		active = false;
		cancelAnimationFrame(raf);
	};
}

const ScrollUpButton = React.forwardRef<HTMLDivElement, ScrollButtonProps>(function ScrollUpButton(
	{ onPointerDown, onPointerUp, onPointerLeave, ...props },
	ref
) {
	const ctx = useRoot();
	const { canScrollUp } = useViewportScroll(ctx);
	const cleanupRef = React.useRef<null | (() => void)>(null);

	if (!canScrollUp) return null;

	return (
		<div
			{...props}
			ref={ref}
			data-slot="select-scroll-up-button"
			onPointerDown={(e) => {
				onPointerDown?.(e);
				const viewport = ctx.viewportElRef.current;
				if (!viewport) return;
				cleanupRef.current?.();
				cleanupRef.current = startContinuousScroll(viewport, -1);
			}}
			onPointerUp={(e) => {
				onPointerUp?.(e);
				cleanupRef.current?.();
				cleanupRef.current = null;
			}}
			onPointerLeave={(e) => {
				onPointerLeave?.(e);
				cleanupRef.current?.();
				cleanupRef.current = null;
			}}
		/>
	);
});

const ScrollDownButton = React.forwardRef<HTMLDivElement, ScrollButtonProps>(function ScrollDownButton(
	{ onPointerDown, onPointerUp, onPointerLeave, ...props },
	ref
) {
	const ctx = useRoot();
	const { canScrollDown } = useViewportScroll(ctx);
	const cleanupRef = React.useRef<null | (() => void)>(null);

	if (!canScrollDown) return null;

	return (
		<div
			{...props}
			ref={ref}
			data-slot="select-scroll-down-button"
			onPointerDown={(e) => {
				onPointerDown?.(e);
				const viewport = ctx.viewportElRef.current;
				if (!viewport) return;
				cleanupRef.current?.();
				cleanupRef.current = startContinuousScroll(viewport, 1);
			}}
			onPointerUp={(e) => {
				onPointerUp?.(e);
				cleanupRef.current?.();
				cleanupRef.current = null;
			}}
			onPointerLeave={(e) => {
				onPointerLeave?.(e);
				cleanupRef.current?.();
				cleanupRef.current = null;
			}}
		/>
	);
});

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

export {
	Root,
	Trigger,
	Icon,
	Value,
	Portal,
	Content,
	Viewport,
	Group,
	Label,
	Item,
	ItemText,
	ItemIndicator,
	Separator,
	ScrollUpButton,
	ScrollDownButton,
};
