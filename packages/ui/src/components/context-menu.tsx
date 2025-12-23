"use client";

import * as React from "react";
import {
	FloatingFocusManager,
	FloatingPortal,
	autoUpdate,
	flip,
	offset,
	shift,
	useDismiss,
	useFloating,
	useInteractions,
	useRole,
	useTransitionStyles,
	safePolygon,
	useHover,
	type Placement,
	type VirtualElement,
} from "@floating-ui/react";

import { IconCheck, IconChevronRight, IconCircle } from "@tabler/icons-react";
import { Slot } from "../lib/slot";
import { cn } from "../lib/cn";
import { composeRefs } from "../lib/compose-refs";
import { useOverlayDOMManager } from "@haitch/core/client";

type CheckedState = boolean | "indeterminate";

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

function toVirtualPoint(x: number, y: number): VirtualElement {
	return {
		getBoundingClientRect() {
			return {
				x,
				y,
				width: 0,
				height: 0,
				top: y,
				left: x,
				right: x,
				bottom: y,
			} as DOMRect;
		},
	};
}

function isPrintableKey(e: React.KeyboardEvent): boolean {
	// single-character key without modifiers
	return e.key.length === 1 && !e.altKey && !e.ctrlKey && !e.metaKey;
}

function getMenuItems(root: HTMLElement | null): HTMLElement[] {
	if (!root) return [];
	const all = Array.from(root.querySelectorAll<HTMLElement>('[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]'));

	return all.filter((el) => {
		const ariaDisabled = el.getAttribute("aria-disabled") === "true";
		const dataDisabled = el.hasAttribute("data-disabled");
		const disabled = ariaDisabled || dataDisabled;
		return !disabled;
	});
}

function focusFirstEnabled(root: HTMLElement | null) {
	const items = getMenuItems(root);
	if (items.length > 0) items[0]?.focus();
}

function focusNext(root: HTMLElement | null, dir: 1 | -1) {
	const items = getMenuItems(root);
	if (items.length === 0) return;

	const active = document.activeElement as HTMLElement | null;
	const idx = active ? items.indexOf(active) : -1;

	let nextIdx = idx;
	for (let i = 0; i < items.length; i++) {
		nextIdx = (nextIdx + dir + items.length) % items.length;
		const next = items[nextIdx];
		if (next) {
			next.focus();
			return;
		}
	}

	// fallback
	items[0]?.focus();
}

function focusHome(root: HTMLElement | null) {
	const items = getMenuItems(root);
	items[0]?.focus();
}

function focusEnd(root: HTMLElement | null) {
	const items = getMenuItems(root);
	items[items.length - 1]?.focus();
}

function getTextForTypeahead(el: HTMLElement): string {
	return (el.textContent ?? "").trim().toLowerCase();
}

function typeaheadFocus(root: HTMLElement | null, query: string) {
	const items = getMenuItems(root);
	if (items.length === 0) return;

	const q = query.trim().toLowerCase();
	if (!q) return;

	const active = document.activeElement as HTMLElement | null;
	const startIdx = active ? items.indexOf(active) : -1;

	// cycle from next item to end, then from start
	const ordered = startIdx >= 0 ? [...items.slice(startIdx + 1), ...items.slice(0, startIdx + 1)] : items;

	for (const el of ordered) {
		const txt = getTextForTypeahead(el);
		if (txt.startsWith(q)) {
			el.focus();
			return;
		}
	}
}

/* -------------------------------------------------------------------------------------------------
 * Root context
 * ------------------------------------------------------------------------------------------------- */

type RootCtx = {
	open: boolean;
	setOpen: (open: boolean) => void;

	// floating
	placement: Placement;
	refs: ReturnType<typeof useFloating>["refs"];
	floatingStyles: React.CSSProperties;
	getReferenceProps: ReturnType<typeof useInteractions>["getReferenceProps"];
	getFloatingProps: ReturnType<typeof useInteractions>["getFloatingProps"];
	floatingContext: ReturnType<typeof useFloating>["context"];

	// portal
	portalRoot: HTMLElement | null;

	// transitions
	isMounted: boolean;
	transitionStyles: React.CSSProperties;

	// ids
	contentId: string;

	// “radio group” value store (local, simple shadcn-style)
	radioValue: string | null;
	setRadioValue: (v: string) => void;

	// trigger for focus return
	triggerElRef: React.MutableRefObject<HTMLElement | null>;
};

const RootContext = React.createContext<RootCtx | null>(null);
function useRoot() {
	const ctx = React.useContext(RootContext);
	if (!ctx) throw new Error("ContextMenu components must be used within <ContextMenu>.");
	return ctx;
}

type ContextMenuProps = React.PropsWithChildren<{
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;

	side?: Side;
	align?: Align;
	sideOffset?: number;

	modal?: boolean;
}>;

function useControllableOpen(opts: Pick<ContextMenuProps, "open" | "defaultOpen" | "onOpenChange">) {
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

export function ContextMenu(props: ContextMenuProps) {
	const parentManager = useOverlayDOMManager();
	const dom = parentManager.dom;

	const { open, setOpen } = useControllableOpen(props);

	const contentId = React.useId();

	const [radioValue, setRadioValue] = React.useState<string | null>(null);

	const triggerElRef = React.useRef<HTMLElement | null>(null);

	const placement = React.useMemo<Placement>(() => {
		const side = props.side ?? "right";
		const align = props.align ?? "start";
		return placementFromSideAlign(side, align);
	}, [props.side, props.align]);

	const middleware = React.useMemo(() => {
		const m = [];
		m.push(offset(props.sideOffset ?? 4));
		m.push(flip());
		m.push(shift({ padding: 8 }));
		return m;
	}, [props.sideOffset]);

	const floating = useFloating({
		open,
		onOpenChange: setOpen,
		placement,
		strategy: "fixed",
		middleware,
		whileElementsMounted: autoUpdate,
	});

	const dismiss = useDismiss(floating.context, {
		enabled: true,
		escapeKey: true,
		outsidePressEvent: "pointerdown",
	});

	const role = useRole(floating.context, { role: "menu" });

	const { getReferenceProps, getFloatingProps } = useInteractions([dismiss, role]);

	// Init synchronously to reduce act() warnings / timing flakiness
	const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(() => dom.getPortalContainer());
	React.useEffect(() => {
		const next = dom.getPortalContainer();
		setPortalRoot(next);
	}, [dom]);

	const { isMounted, styles: transitionStyles } = useTransitionStyles(floating.context, {
		duration: { open: 100, close: 90 },
		initial: { opacity: 0, transform: "scale(0.98)" },
		open: { opacity: 1, transform: "scale(1)" },
		close: { opacity: 0, transform: "scale(0.98)" },
	});

	// Restore focus to trigger when closing
	React.useEffect(() => {
		if (!open) {
			const el = triggerElRef.current;
			// queue to allow unmount first
			queueMicrotask(() => {
				el?.focus?.();
			});
		}
	}, [open]);

	const value = React.useMemo<RootCtx>(
		() => ({
			open,
			setOpen,
			placement,
			refs: floating.refs,
			floatingContext: floating.context,
			floatingStyles: floating.floatingStyles,
			getReferenceProps,
			getFloatingProps,
			portalRoot,
			isMounted,
			transitionStyles,
			contentId,
			radioValue,
			setRadioValue,
			triggerElRef,
		}),
		[
			open,
			setOpen,
			placement,
			floating.refs,
			floating.context,
			floating.floatingStyles,
			getReferenceProps,
			getFloatingProps,
			portalRoot,
			isMounted,
			transitionStyles,
			contentId,
			radioValue,
		]
	);

	return <RootContext.Provider value={value}>{props.children}</RootContext.Provider>;
}

/* -------------------------------------------------------------------------------------------------
 * Trigger
 * ------------------------------------------------------------------------------------------------- */

type ContextMenuTriggerProps = React.HTMLAttributes<HTMLElement> & {
	asChild?: boolean;
	disabled?: boolean;
};

export const ContextMenuTrigger = React.forwardRef<HTMLElement, ContextMenuTriggerProps>(function ContextMenuTrigger(
	{ asChild, disabled, children, onContextMenu, onKeyDown, ...rest },
	forwardedRef
) {
	const ctx = useRoot();
	const Comp = asChild ? Slot : "button";

	const mergedRef = composeRefs(forwardedRef);

	const openAtPoint = (triggerEl: HTMLElement, x: number, y: number) => {
		ctx.triggerElRef.current = triggerEl;
		// set real reference for focus return + any positioning needs
		ctx.refs.setReference(triggerEl as unknown as Element);
		ctx.refs.setPositionReference(toVirtualPoint(x, y));
		ctx.setOpen(true);
	};

	const handleContextMenu: React.MouseEventHandler<HTMLElement> = (e) => {
		e.preventDefault();
		if (disabled) return;

		openAtPoint(e.currentTarget, e.clientX, e.clientY);

		onContextMenu?.(e);
	};

	const handleKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
		if (disabled) return;

		if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
			e.preventDefault();
			const el = e.currentTarget;
			const r = el.getBoundingClientRect();
			openAtPoint(el, Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
		}

		onKeyDown?.(e);
	};

	// Floating UI's getReferenceProps is typed around Element, so we hand it a compatible object,
	// but we keep our public surface strictly typed to HTMLElement.
	const referenceProps = ctx.getReferenceProps({
		...(rest as React.HTMLAttributes<Element>),
		ref: mergedRef as unknown as React.Ref<Element>,
		onContextMenu: handleContextMenu as unknown as React.MouseEventHandler<Element>,
		onKeyDown: handleKeyDown as unknown as React.KeyboardEventHandler<Element>,
	});

	return asChild ? (
		<Comp {...(referenceProps as React.HTMLAttributes<HTMLElement>)} data-slot="context-menu-trigger" data-state={ctx.open ? "open" : "closed"}>
			{children}
		</Comp>
	) : (
		<button
			type="button"
			{...(referenceProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
			data-slot="context-menu-trigger"
			data-state={ctx.open ? "open" : "closed"}
		>
			{children}
		</button>
	);
});

/* -------------------------------------------------------------------------------------------------
 * Content
 * ------------------------------------------------------------------------------------------------- */

type ContextMenuContentProps = React.HTMLAttributes<HTMLDivElement> & {
	className?: string;
	sideOffset?: number; // accepted for API parity, root handles it
};

export const ContextMenuContent = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(function ContextMenuContent(
	{ className, style, children, onKeyDown, ...props },
	forwardedRef
) {
	const ctx = useRoot();

	// ✅ hooks must always run, even when closed
	const placementSide = sideFromPlacement(ctx.placement);
	const placementAlign = alignFromPlacement(ctx.placement);

	const localRef = React.useRef<HTMLDivElement | null>(null);
	const typeaheadRef = React.useRef<{ buffer: string; timer: number | null }>({
		buffer: "",
		timer: null,
	});

	React.useLayoutEffect(() => {
		if (!ctx.open) return;
		// ✅ focus first enabled item on open
		const active = document.activeElement as HTMLElement | null;
		if (active && localRef.current && localRef.current.contains(active)) return;

		queueMicrotask(() => {
			const activeNow = document.activeElement as HTMLElement | null;
			if (activeNow && localRef.current && localRef.current.contains(activeNow)) return;
			focusFirstEnabled(localRef.current);
		});
	}, [ctx.open, ctx.portalRoot]);

	React.useEffect(() => {
		return () => {
			if (typeaheadRef.current.timer != null) {
				window.clearTimeout(typeaheadRef.current.timer);
				typeaheadRef.current.timer = null;
			}
		};
	}, []);

	const handleKeyDownContent: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			focusNext(localRef.current, 1);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			focusNext(localRef.current, -1);
		} else if (e.key === "Home") {
			e.preventDefault();
			focusHome(localRef.current);
		} else if (e.key === "End") {
			e.preventDefault();
			focusEnd(localRef.current);
		} else if (e.key === "Enter" || e.key === " ") {
			const active = document.activeElement as HTMLElement | null;
			if (active && localRef.current?.contains(active)) {
				e.preventDefault();
				active.click();
			}
		} else if (isPrintableKey(e)) {
			typeaheadRef.current.buffer += e.key.toLowerCase();

			if (typeaheadRef.current.timer != null) window.clearTimeout(typeaheadRef.current.timer);
			typeaheadRef.current.timer = window.setTimeout(() => {
				typeaheadRef.current.buffer = "";
				typeaheadRef.current.timer = null;
			}, 500);

			typeaheadFocus(localRef.current, typeaheadRef.current.buffer);
		}

		onKeyDown?.(e);
	};

	// ✅ Contract: when closed, menu is not in the DOM
	if (!ctx.open) return null;

	const floatingProps = ctx.getFloatingProps({
		...props,
		ref: composeRefs(
			forwardedRef,
			(node: HTMLDivElement | null) => {
				localRef.current = node;
			},
			ctx.refs.setFloating as unknown as React.Ref<HTMLDivElement>
		),
		id: ctx.contentId,
		role: "menu",
		tabIndex: -1,
		"data-slot": "context-menu-content",
		"data-state": "open",
		"data-side": placementSide,
		"data-align": placementAlign,
		onKeyDown: handleKeyDownContent,
		style: {
			...ctx.floatingStyles,
			...style,
			transform: [ctx.floatingStyles.transform, style?.transform].filter(Boolean).join(" "),
		},
		className: cn(
			"z-50 min-w-[12rem] overflow-hidden rounded-ui-radius border border-border bg-popover p-1 text-popover-foreground shadow-md outline-hidden",
			className
		),
	} as React.HTMLAttributes<HTMLDivElement>);

	return (
		<FloatingPortal root={ctx.portalRoot}>
			<div {...floatingProps}>{children}</div>
		</FloatingPortal>
	);
});

/* -------------------------------------------------------------------------------------------------
 * Item primitives
 * ------------------------------------------------------------------------------------------------- */

type ItemBaseProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> & {
	inset?: boolean;
	disabled?: boolean;
	variant?: "default" | "destructive";
};

type SelectEvent = CustomEvent<{ originalEvent?: Event }>;

function dispatchSelect(target: HTMLElement): SelectEvent {
	const ev = new CustomEvent<{ originalEvent?: Event }>("select", { bubbles: true, cancelable: true, detail: {} });
	target.dispatchEvent(ev);
	return ev;
}

export const ContextMenuItem = React.forwardRef<HTMLDivElement, ItemBaseProps & { onSelect?: (event: Event) => void }>(function ContextMenuItem(
	{ className, inset, disabled, variant = "default", onClick, onKeyDown, onSelect, role, ...props },
	forwardedRef
) {
	const ctx = useRoot();

	const runSelect = (target: HTMLElement, originalEvent?: Event) => {
		const ev = dispatchSelect(target);
		if (originalEvent) {
			(ev as unknown as SelectEvent).detail.originalEvent = originalEvent;
		}
		onSelect?.(ev);
		if (!ev.defaultPrevented) {
			ctx.setOpen(false);
		}
	};

	return (
		<div
			{...props}
			ref={forwardedRef}
			// ✅ allow override from CheckboxItem/RadioItem
			role={role ?? "menuitem"}
			data-slot="context-menu-item"
			data-disabled={disabled ? "" : undefined}
			aria-disabled={disabled ? "true" : undefined}
			tabIndex={disabled ? undefined : -1}
			onKeyDown={(e) => {
				if (disabled) return;
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					runSelect(e.currentTarget as unknown as HTMLElement, e.nativeEvent);
					return;
				}
				onKeyDown?.(e);
			}}
			onClick={(e) => {
				if (disabled) {
					e.preventDefault();
					e.stopPropagation();
					return;
				}
				onClick?.(e);
				runSelect(e.currentTarget as unknown as HTMLElement, e.nativeEvent);
			}}
			className={cn(
				"relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden",
				"focus:bg-accent focus:text-accent-foreground",
				"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
				inset && "pl-8",
				variant === "destructive" && "text-destructive focus:bg-destructive/10 focus:text-destructive",
				className
			)}
		/>
	);
});

export function ContextMenuLabel({ className, inset, ...props }: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }) {
	return (
		<div
			{...props}
			data-slot="context-menu-label"
			className={cn("px-2 py-1.5 text-sm font-semibold text-foreground", inset && "pl-8", className)}
		/>
	);
}

export function ContextMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div {...props} role="separator" data-slot="context-menu-separator" className={cn("-mx-1 my-1 h-px bg-border", className)} />;
}

export function ContextMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
	return <span {...props} data-slot="context-menu-shortcut" className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} />;
}

/* -------------------------------------------------------------------------------------------------
 * Checkbox + Radio
 * ------------------------------------------------------------------------------------------------- */

type CheckboxItemProps = Omit<ItemBaseProps, "onClick"> & {
	checked?: CheckedState;
	onCheckedChange?: (checked: boolean) => void;
	onSelect?: (event: Event) => void;
};
export const ContextMenuCheckboxItem = React.forwardRef<HTMLDivElement, CheckboxItemProps>(function ContextMenuCheckboxItem(
	{ checked = false, onCheckedChange, children, onSelect, ...props },
	forwardedRef
) {
	const isOn = checked === true;

	return (
		<ContextMenuItem
			{...props}
			ref={forwardedRef}
			role="menuitemcheckbox"
			aria-checked={checked === "indeterminate" ? "mixed" : isOn}
			onSelect={(ev) => {
				onCheckedChange?.(!isOn);
				onSelect?.(ev);
			}}
			inset
		>
			<span className="absolute left-2 inline-flex h-3.5 w-3.5 items-center justify-center">
				{checked === "indeterminate" ? <IconCheck className="h-4 w-4 opacity-60" /> : isOn ? <IconCheck className="h-4 w-4" /> : null}
			</span>
			{children}
		</ContextMenuItem>
	);
});

type RadioGroupCtx = {
	value: string | null;
	setValue: (v: string) => void;
};

const RadioGroupContext = React.createContext<RadioGroupCtx | null>(null);

export function ContextMenuRadioGroup({
	value,
	onValueChange,
	children,
}: {
	value?: string;
	onValueChange?: (v: string) => void;
	children: React.ReactNode;
}) {
	const root = useRoot();
	const resolved = value ?? root.radioValue;

	const setValue = React.useCallback(
		(v: string) => {
			if (value === undefined) root.setRadioValue(v);
			onValueChange?.(v);
		},
		[onValueChange, root, value]
	);

	const ctx = React.useMemo<RadioGroupCtx>(() => ({ value: resolved ?? null, setValue }), [resolved, setValue]);

	return <RadioGroupContext.Provider value={ctx}>{children}</RadioGroupContext.Provider>;
}

type RadioItemProps = Omit<ItemBaseProps, "onClick"> & {
	value: string;
	onSelect?: (event: Event) => void;
};

export const ContextMenuRadioItem = React.forwardRef<HTMLDivElement, RadioItemProps>(function ContextMenuRadioItem(
	{ value, children, onSelect, ...props },
	forwardedRef
) {
	const rg = React.useContext(RadioGroupContext);
	const isOn = rg?.value === value;

	return (
		<ContextMenuItem
			{...props}
			ref={forwardedRef}
			role="menuitemradio"
			aria-checked={isOn}
			onSelect={(ev) => {
				rg?.setValue(value);
				onSelect?.(ev);
			}}
			inset
		>
			<span className="absolute left-2 inline-flex h-3.5 w-3.5 items-center justify-center">
				{isOn ? <IconCircle className="h-3.5 w-3.5" /> : null}
			</span>
			{children}
		</ContextMenuItem>
	);
});

/* -------------------------------------------------------------------------------------------------
 * Submenu
 * ------------------------------------------------------------------------------------------------- */

type SubCtx = {
	open: boolean;
	setOpen: (o: boolean) => void;

	placement: Placement;
	refs: ReturnType<typeof useFloating>["refs"];
	floatingStyles: React.CSSProperties;
	getReferenceProps: ReturnType<typeof useInteractions>["getReferenceProps"];
	getFloatingProps: ReturnType<typeof useInteractions>["getFloatingProps"];

	portalRoot: HTMLElement | null;

	isMounted: boolean;
	transitionStyles: React.CSSProperties;

	triggerElRef: React.MutableRefObject<HTMLElement | null>;
	openByKeyboardRef: React.MutableRefObject<boolean>;
};

const SubContext = React.createContext<SubCtx | null>(null);
function useSub() {
	const ctx = React.useContext(SubContext);
	if (!ctx) throw new Error("ContextMenuSub components must be used within <ContextMenuSub>.");
	return ctx;
}

export function ContextMenuSub({ children }: { children: React.ReactNode }) {
	const root = useRoot();

	const [open, setOpen] = React.useState(false);

	const triggerElRef = React.useRef<HTMLElement | null>(null);
	const openByKeyboardRef = React.useRef(false);

	const floating = useFloating({
		open,
		onOpenChange: setOpen,
		placement: "right-start",
		strategy: "fixed",
		middleware: [offset(4), flip(), shift({ padding: 8 })],
		whileElementsMounted: autoUpdate,
	});

	// Immediate open on hover to reduce test flakiness
	const hover = useHover(floating.context, {
		enabled: true,
		delay: { open: 0, close: 0 },
		handleClose: safePolygon({ buffer: 2 }),
		move: false,
	});

	const dismiss = useDismiss(floating.context, { enabled: true, outsidePressEvent: "pointerdown" });
	const role = useRole(floating.context, { role: "menu" });

	const { getReferenceProps, getFloatingProps } = useInteractions([hover, dismiss, role]);

	const { isMounted, styles: transitionStyles } = useTransitionStyles(floating.context, {
		duration: { open: 90, close: 80 },
		initial: { opacity: 0, transform: "scale(0.98)" },
		open: { opacity: 1, transform: "scale(1)" },
		close: { opacity: 0, transform: "scale(0.98)" },
	});

	// Close submenu when root menu closes
	React.useEffect(() => {
		if (!root.open) setOpen(false);
	}, [root.open]);

	const value = React.useMemo<SubCtx>(
		() => ({
			open,
			setOpen,
			placement: "right-start",
			refs: floating.refs,
			floatingStyles: floating.floatingStyles,
			getReferenceProps,
			getFloatingProps,
			portalRoot: root.portalRoot,
			isMounted,
			transitionStyles,
			triggerElRef,
			openByKeyboardRef,
		}),
		[open, floating.refs, floating.floatingStyles, getReferenceProps, getFloatingProps, root.portalRoot, isMounted, transitionStyles]
	);

	return <SubContext.Provider value={value}>{children}</SubContext.Provider>;
}

export const ContextMenuSubTrigger = React.forwardRef<HTMLDivElement, ItemBaseProps>(function ContextMenuSubTrigger(
	{ className, inset, disabled, children, onKeyDown, onPointerMove, onMouseEnter, ...props },
	forwardedRef
) {
	const sub = useSub();

	const mergedRef = composeRefs(
		forwardedRef,
		(node: HTMLDivElement | null) => {
			sub.triggerElRef.current = node;
		},
		sub.refs.setReference as unknown as React.Ref<HTMLDivElement>
	);

	const referenceProps = sub.getReferenceProps({
		...props,
		ref: mergedRef,
		role: "menuitem",
		"aria-haspopup": "menu",
		"aria-expanded": sub.open,
		"data-slot": "context-menu-sub-trigger",
		"data-disabled": disabled ? "" : undefined,
		tabIndex: disabled ? undefined : -1,
		className: cn(
			"relative flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-hidden",
			"focus:bg-accent focus:text-accent-foreground",
			"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
			inset && "pl-8 pr-8",
			!inset && "pr-8",
			className
		),
		onPointerMove: (e) => {
			if (!disabled) sub.setOpen(true);
			onPointerMove?.(e);
		},
		onMouseEnter: (e) => {
			if (!disabled) sub.setOpen(true);
			onMouseEnter?.(e);
		},
		onKeyDown: (e) => {
			if (disabled) return;

			if (e.key === "ArrowRight") {
				e.preventDefault();
				sub.openByKeyboardRef.current = true;
				sub.setOpen(true);
				return;
			}
			if (e.key === "ArrowLeft") {
				// if submenu open, close and refocus self
				if (sub.open) {
					e.preventDefault();
					sub.setOpen(false);
					queueMicrotask(() => sub.triggerElRef.current?.focus?.());
					return;
				}
			}

			onKeyDown?.(e);
		},
		onPointerDown: (e) => {
			if (disabled) return;
			// allow click to open as well
			if (e.button === 0) sub.setOpen(true);
			props.onPointerDown?.(e);
		},
	} as React.HTMLAttributes<HTMLDivElement>);

	return (
		<div {...referenceProps}>
			{children}
			<span className="absolute right-2 inline-flex items-center">
				<IconChevronRight className="h-4 w-4 opacity-70" />
			</span>
		</div>
	);
});

export const ContextMenuSubContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function ContextMenuSubContent(
	{ className, style, children, onKeyDown, ...props },
	forwardedRef
) {
	const sub = useSub();

	// ✅ hooks must always run
	const localRef = React.useRef<HTMLDivElement | null>(null);

	React.useLayoutEffect(() => {
		if (!sub.open) return;
		if (sub.openByKeyboardRef.current) {
			sub.openByKeyboardRef.current = false;
			focusFirstEnabled(localRef.current);
		}
	}, [sub.open]);

	// ✅ Contract: when closed, submenu is not in DOM
	if (!sub.open) return null;

	const floatingProps = sub.getFloatingProps({
		...props,
		ref: composeRefs(
			forwardedRef,
			(node: HTMLDivElement | null) => {
				localRef.current = node;
			},
			sub.refs.setFloating as unknown as React.Ref<HTMLDivElement>
		),
		role: "menu",
		tabIndex: -1,
		"data-slot": "context-menu-sub-content",
		"data-state": sub.open ? "open" : "closed",
		onKeyDown: (e) => {
			if (e.key === "ArrowLeft") {
				e.preventDefault();
				sub.setOpen(false);
				queueMicrotask(() => sub.triggerElRef.current?.focus?.());
				return;
			}
			onKeyDown?.(e);
		},
		style: {
			...sub.floatingStyles,
			...sub.transitionStyles,
			...style,
			transform: [sub.floatingStyles.transform, sub.transitionStyles.transform, style?.transform].filter(Boolean).join(" "),
		},
		className: cn(
			"z-50 min-w-[11rem] overflow-hidden rounded-ui-radius border border-border bg-popover p-1 text-popover-foreground shadow-md outline-hidden",
			className
		),
	} as React.HTMLAttributes<HTMLDivElement>);

	return (
		<FloatingPortal root={sub.portalRoot}>
			<div {...floatingProps}>{children}</div>
		</FloatingPortal>
	);
});
