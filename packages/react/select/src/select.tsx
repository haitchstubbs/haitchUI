/* "use client";

import * as React from "react";
import {
	FloatingPortal,
	autoUpdate,
	flip,
	offset,
	shift,
	size,
	useDismiss,
	useFloating,
	useInteractions,
	useRole,
	useClick,
	useTransitionStyles,
	type Side,
	type Align,
	Placement,
	FloatingPlacement,
	MenuFocus,
} from "@haitch/react-core";
import { Slot } from "@haitch/react-slot";
import { composeRefs } from "@haitch/react-compose-refs";
import { useOverlayDOMManager } from "@haitch/react-overlay";


export type SelectValue = string;

export type SelectPosition = "item-aligned" | "popper";

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

export type TriggerProps = React.HTMLAttributes<HTMLElement> & {
	asChild?: boolean;
	disabled?: boolean;
};

export type ValueProps = React.HTMLAttributes<HTMLSpanElement> & {
	placeholder?: React.ReactNode;
};

export type PortalProps = React.PropsWithChildren<{
	container?: HTMLElement | null;
}>;

export type ContentProps = React.HTMLAttributes<HTMLDivElement> & {
	position?: SelectPosition;
	align?: Align;
	sideOffset?: number;
};

export type ViewportProps = React.HTMLAttributes<HTMLDivElement>;

export type GroupProps = React.HTMLAttributes<HTMLDivElement>;

export type LabelProps = React.HTMLAttributes<HTMLDivElement>;

export type ItemProps = React.HTMLAttributes<HTMLDivElement> & {
	value: SelectValue;
	disabled?: boolean;
	textValue?: string;
};

export type ItemTextProps = React.HTMLAttributes<HTMLSpanElement>;

export type ItemIndicatorProps = React.HTMLAttributes<HTMLSpanElement> & {
	forceMount?: boolean;
};

export type SeparatorProps = React.HTMLAttributes<HTMLDivElement>;

export type IconProps = React.HTMLAttributes<HTMLElement> & {
	asChild?: boolean;
};

export type ScrollButtonProps = React.HTMLAttributes<HTMLDivElement>;


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

	// floating-ui
	placement: FloatingPlacement;
	refs: ReturnType<typeof useFloating>["refs"];
	floatingStyles: React.CSSProperties;
	getReferenceProps: ReturnType<typeof useInteractions>["getReferenceProps"];
	getFloatingProps: ReturnType<typeof useInteractions>["getFloatingProps"];
	floatingContext: ReturnType<typeof useFloating>["context"];

	// portal root (shadow-safe)
	portalRoot: HTMLElement | null;

	// transitions
	isMounted: boolean;
	transitionStyles: React.CSSProperties;

	// CSS vars (Radix-compatible names used by shadcn styles)
	cssVars: React.CSSProperties;
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
};
const ItemContext = React.createContext<ItemCtx | null>(null);

function useItem() {
	const ctx = React.useContext(ItemContext);
	if (!ctx) throw new Error("Select.Item* components must be used within <Select.Item>.");
	return ctx;
}

function useControllableBoolean(opts: {
	value?: boolean;
	defaultValue?: boolean;
	onChange?: (v: boolean) => void;
}) {
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

function useControllableString(opts: {
	value?: string;
	defaultValue?: string;
	onChange?: (v: string) => void;
}) {
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

	const placement = React.useMemo<FloatingPlacement>(() => {
		const side: Side = props.side ?? "bottom";
		const align: Align = props.align ?? "start";
		return Placement.fromSideAlign(side, align);
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

	const floating = useFloating({
		open,
		onOpenChange: setOpen,
		placement,
		strategy: "fixed",
		middleware: [
			offset(props.sideOffset ?? 4),
			flip(),
			shift({ padding: 8 }),
			size({
				padding: 8,
				apply({ rects, availableHeight, elements }) {
					const triggerW = Math.round(rects.reference.width);
					const triggerH = Math.round(rects.reference.height);

					// These names match what shadcn expects (Radix Select vars)
					elements.floating.style.setProperty("--radix-select-trigger-width", `${triggerW}px`);
					elements.floating.style.setProperty("--radix-select-trigger-height", `${triggerH}px`);
					elements.floating.style.setProperty("--radix-select-content-available-height", `${Math.floor(availableHeight)}px`);
				},
			}),
		],
		whileElementsMounted: autoUpdate,
	});

	// Clicking the trigger toggles open (unless disabled)
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

	// Listbox semantics
	const role = useRole(floating.context, { role: "listbox" });

	const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

	const { isMounted, styles: transitionStyles } = useTransitionStyles(floating.context, {
		duration: { open: 120, close: 100 },
		initial: { opacity: 0, transform: "scale(0.98)" },
		open: { opacity: 1, transform: "scale(1)" },
		close: { opacity: 0, transform: "scale(0.98)" },
	});

	// Maintain a Radix-like origin var so shadcn animations can hook in
	React.useEffect(() => {
		const side = Placement.side(placement);
		// good-enough transform origin for headless primitive
		const origin =
			side === "top"
				? "bottom"
				: side === "bottom"
					? "top"
					: side === "left"
						? "right"
						: "left";

		setCssVars((prev) => ({
			...prev,
			// used by shadcn className: origin-(--radix-select-content-transform-origin)
			["--radix-select-content-transform-origin" as unknown as string]: origin,
		}));
	}, [placement]);

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
			placement,
			refs: floating.refs,
			floatingContext: floating.context,
			floatingStyles: floating.floatingStyles,
			getReferenceProps,
			getFloatingProps,
			portalRoot,
			isMounted,
			transitionStyles,
			cssVars,
		}),
		[
			disabled,
			open,
			setOpen,
			value,
			setValue,
			contentId,
			labelId,
			placement,
			floating.refs,
			floating.context,
			floating.floatingStyles,
			getReferenceProps,
			getFloatingProps,
			portalRoot,
			isMounted,
			transitionStyles,
			cssVars,
		]
	);

	return (
		<RootContext.Provider value={ctx}>
			{props.children}
			{props.name ? <input type="hidden" name={props.name} value={value ?? ""} readOnly aria-hidden="true" /> : null}
		</RootContext.Provider>
	);
}

const Trigger = React.forwardRef<HTMLElement, TriggerProps>(function Trigger(
	{ asChild, disabled: disabledProp, children, onKeyDown, ...rest },
	forwardedRef
) {
	const ctx = useRoot();
	const disabled = ctx.disabled || Boolean(disabledProp);

	const Comp = asChild ? Slot : "button";

	const mergedRef = composeRefs(
		forwardedRef,
		(node: HTMLElement | null) => {
			ctx.triggerElRef.current = node;
		},
		ctx.refs.setReference as unknown as React.Ref<HTMLElement>
	);

	const handleKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
		if (disabled) return;

		// Open with common Select keys
		if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			ctx.setOpen(true);

			queueMicrotask(() => {
				const viewport = ctx.viewportElRef.current ?? ctx.contentElRef.current;
				if (!viewport) return;
				if (e.key === "ArrowUp") MenuFocus.listboxEnd(viewport);
				else MenuFocus.listboxFirst(viewport);
			});
		}

		onKeyDown?.(e);
	};

	const referenceProps = ctx.getReferenceProps({
		...(rest as React.HTMLAttributes<HTMLElement>),
		ref: mergedRef,
		role: "combobox",
		"aria-controls": ctx.contentId,
		"aria-expanded": ctx.open,
		"aria-haspopup": "listbox",
		"aria-labelledby": ctx.labelId,
		"aria-disabled": disabled ? "true" : undefined,
		"data-state": ctx.open ? "open" : "closed",
		"data-disabled": disabled ? "" : undefined,
		onKeyDown: handleKeyDown as unknown as React.KeyboardEventHandler<HTMLElement>,
	} as React.HTMLAttributes<HTMLElement>);

	return asChild ? (
		<Comp {...(referenceProps as React.HTMLAttributes<HTMLElement>)}>{children}</Comp>
	) : (
		<button type="button" {...(referenceProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
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


const Value = React.forwardRef<HTMLSpanElement, ValueProps>(function Value(
	{ placeholder = null, children, ...props },
	forwardedRef
) {
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


const Content = React.forwardRef<HTMLDivElement, ContentProps>(function Content(
	{
		children,
		style,
		onKeyDown,
		position = "item-aligned",
		align = "center",
		...props
	},
	forwardedRef
) {
	const ctx = useRoot();

	// If caller supplies align on Content, it overrides Root's align for this render.
	// (This matches how shadcn passes align="center".)
	const placement = React.useMemo<FloatingPlacement>(() => {
		const side = Placement.side(ctx.placement);
		const resolvedAlign = align;
		return Placement.fromSideAlign(side, resolvedAlign);
	}, [ctx.placement, align]);

	React.useEffect(() => {
		// Keep floating placement in sync (only when open)
		// We do this by calling update and setting placement via refs:
		// simplest: re-run floating's compute by forcing update; placement is fixed at hook init,
		// so we *don't* change hook placement here to avoid tearing.
		// For your wrapper, align generally doesn't need to change dynamically after mount.
		void placement;
	}, [placement]);

	const typeaheadRef = React.useRef<{ buffer: string; timer: number | null }>({
		buffer: "",
		timer: null,
	});

	React.useEffect(() => {
		return () => {
			if (typeaheadRef.current.timer != null) {
				window.clearTimeout(typeaheadRef.current.timer);
				typeaheadRef.current.timer = null;
			}
		};
	}, []);

	// Focus selected (or first) when opened
	React.useLayoutEffect(() => {
		if (!ctx.open) return;

		queueMicrotask(() => {
			const viewport = ctx.viewportElRef.current ?? ctx.contentElRef.current;
			if (!viewport) return;

			const selected = viewport.querySelector<HTMLElement>(
				'[role="option"][aria-selected="true"]:not([aria-disabled="true"]):not([data-disabled])'
			);
			if (selected) selected.focus();
			else MenuFocus.listboxFirst(viewport);
		});
	}, [ctx.open]);

	const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
		const root = ctx.viewportElRef.current ?? ctx.contentElRef.current;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			MenuFocus.listboxNext(root, 1);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			MenuFocus.listboxNext(root, -1);
		} else if (e.key === "Home") {
			e.preventDefault();
			MenuFocus.listboxFirst(root);
		} else if (e.key === "End") {
			e.preventDefault();
			MenuFocus.listboxEnd(root);
		} else if (e.key === "Enter" || e.key === " ") {
			const active = document.activeElement as HTMLElement | null;
			if (active && root?.contains(active)) {
				e.preventDefault();
				active.click();
			}
		} else if (e.key === "Escape") {
			e.preventDefault();
			ctx.setOpen(false);
		} else if (MenuFocus.isPrintableKey(e)) {
			typeaheadRef.current.buffer += e.key.toLowerCase();
			if (typeaheadRef.current.timer != null) window.clearTimeout(typeaheadRef.current.timer);
			typeaheadRef.current.timer = window.setTimeout(() => {
				typeaheadRef.current.buffer = "";
				typeaheadRef.current.timer = null;
			}, 500);

			MenuFocus.focusTypeAhead(root, typeaheadRef.current.buffer);
		}

		onKeyDown?.(e);
	};

	if (!ctx.open) return null;

	const side = Placement.side(ctx.placement);
	const dataAlign = Placement.align(ctx.placement);

	const floatingProps = ctx.getFloatingProps({
		...props,
		ref: composeRefs(
			forwardedRef,
			(node: HTMLDivElement | null) => {
				ctx.contentElRef.current = node;
			},
			ctx.refs.setFloating as unknown as React.Ref<HTMLDivElement>
		),
		id: ctx.contentId,
		role: "listbox",
		tabIndex: -1,
		"aria-labelledby": ctx.labelId,
		"data-state": ctx.open ? "open" : "closed",
		"data-side": side,
		"data-align": dataAlign,
		"data-position": position,
		style: {
			...ctx.floatingStyles,
			...ctx.transitionStyles,
			...ctx.cssVars,
			...style,
			// Merge transforms (floating-ui sets translate; transition sets scale)
			transform: [ctx.floatingStyles.transform, ctx.transitionStyles.transform, style?.transform]
				.filter(Boolean)
				.join(" "),
		},
		onKeyDown: handleKeyDown,
	} as React.HTMLAttributes<HTMLDivElement>);

	// For "item-aligned" we keep the same floating positioning. Your UI layer controls padding,
	// and Viewport gives the “scroll-my-1” behavior.
	// For "popper" shadcn adds extra translate classes, so primitives don’t need to change behavior.

	return <div {...floatingProps}>{children}</div>;
});


const Viewport = React.forwardRef<HTMLDivElement, ViewportProps>(function Viewport(props, forwardedRef) {
	const ctx = useRoot();
	return (
		<div
			{...props}
			ref={composeRefs(forwardedRef, (node: HTMLDivElement | null) => { ctx.viewportElRef.current = node; })}
			data-slot="select-viewport"
		/>
	);
});


const Group = React.forwardRef<HTMLDivElement, GroupProps>(function Group(props, ref) {
	return <div {...props} ref={ref} role="group" data-slot="select-group" />;
});

const Label = React.forwardRef<HTMLDivElement, LabelProps>(function Label(props, ref) {
	const ctx = useRoot();
	return <div {...props} ref={ref} id={ctx.labelId} data-slot="select-label" />;
});

const Item = React.forwardRef<HTMLDivElement, ItemProps>(function Item(
	{ value, disabled = false, textValue, onClick, onKeyDown, ...props },
	forwardedRef
) {
	const ctx = useRoot();
	const isDisabled = ctx.disabled || disabled;
	const selected = ctx.value === value;

	const selectValue = (target: HTMLElement, originalEvent?: Event) => {
		// cancelable event so consumers can prevent close (Radix-ish)
		const ev = new CustomEvent<{ originalEvent?: Event }>("select", {
			bubbles: true,
			cancelable: true,
			detail: { originalEvent },
		});
		target.dispatchEvent(ev);

		ctx.setValue(value);
		if (!ev.defaultPrevented) ctx.setOpen(false);
	};

	return (
		<ItemContext.Provider value={{ selected, disabled: isDisabled }}>
			<div
				{...props}
				ref={forwardedRef}
				role="option"
				tabIndex={isDisabled ? undefined : -1}
				aria-disabled={isDisabled ? "true" : undefined}
				aria-selected={selected}
				data-disabled={isDisabled ? "" : undefined}
				data-state={selected ? "checked" : "unchecked"}
				data-value={value}
				data-text-value={textValue}
				onKeyDown={(e) => {
					if (isDisabled) return;

					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						selectValue(e.currentTarget, e.nativeEvent);
						return;
					}

					onKeyDown?.(e);
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

const ItemIndicator = React.forwardRef<HTMLSpanElement, ItemIndicatorProps>(function ItemIndicator(
	{ forceMount, ...props },
	ref
) {
	const item = useItem();
	if (!forceMount && !item.selected) return null;
	return <span {...props} ref={ref} aria-hidden="true" data-slot="select-item-indicator" />;
});


const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(function Separator(props, ref) {
	return <div {...props} ref={ref} role="separator" data-slot="select-separator" />;
});


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
 */