"use client";

import * as React from "react";
import {
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
	type VirtualElement
} from "@floating-ui/react";
import { Slot } from "@/primitives/slot/src";
import { composeRefs } from "@/primitives/compose-refs/src";
import { useOverlayDOMManager } from "@/primitives/overlay/src";

export type Side = "top" | "right" | "bottom" | "left";
export type Align = "start" | "center" | "end";

export type SelectedState = boolean | "indeterminate";

export class MenuFocus {
	static isPrintableKey(e: React.KeyboardEvent): boolean {
		return e.key.length === 1 && !e.altKey && !e.ctrlKey && !e.metaKey;
	}
	static items(root: HTMLElement | null): HTMLElement[] {
		if (!root) return [];
		const all = Array.from(root.querySelectorAll<HTMLElement>('[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]'));

		return all.filter((el) => {
			const ariaDisabled = el.getAttribute("aria-disabled") === "true";
			const dataDisabled = el.hasAttribute("data-disabled");
			return !(ariaDisabled || dataDisabled);
		});
	}
	static first(root: HTMLElement | null) {
		const items = MenuFocus.items(root);
		items[0]?.focus();
	}
	static next(root: HTMLElement | null, dir: 1 | -1) {
		const items = MenuFocus.items(root);
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

		items[0]?.focus();
	}
	static home(root: HTMLElement | null) {
		const items = MenuFocus.items(root);
		items[0]?.focus();
	}
	static end(root: HTMLElement | null) {
		const items = MenuFocus.items(root);
		items[items.length - 1]?.focus();
	}
	static typeahead(el: HTMLElement): string {
		return (el.textContent ?? "").trim().toLowerCase();
	}
	static focusTypeAhead(root: HTMLElement | null, query: string) {
		const items = MenuFocus.items(root);
		if (items.length === 0) return;

		const q = query.trim().toLowerCase();
		if (!q) return;

		const active = document.activeElement as HTMLElement | null;
		const startIdx = active ? items.indexOf(active) : -1;

		const ordered = startIdx >= 0 ? [...items.slice(startIdx + 1), ...items.slice(0, startIdx + 1)] : items;

		for (const el of ordered) {
			const txt = MenuFocus.typeahead(el);
			if (txt.startsWith(q)) {
				el.focus();
				return;
			}
		}
	}

	static listboxItems(root: HTMLElement | null): HTMLElement[] {
		if (!root) return [];
		const all = Array.from(root.querySelectorAll<HTMLElement>('[role="option"]'));

		return all.filter((el) => {
			const ariaDisabled = el.getAttribute("aria-disabled") === "true";
			const dataDisabled = el.hasAttribute("data-disabled");
			return !(ariaDisabled || dataDisabled);
		});
	}

	static listboxFirst(root: HTMLElement | null) {
		const items = MenuFocus.listboxItems(root);
		items[0]?.focus();
	}

	static listboxNext(root: HTMLElement | null, dir: 1 | -1) {
		const items = MenuFocus.listboxItems(root);
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

		items[0]?.focus();
	}

	static listboxHome(root: HTMLElement | null) {
		const items = MenuFocus.listboxItems(root);
		items[0]?.focus();
	}

	static listboxEnd(root: HTMLElement | null) {
		const items = MenuFocus.listboxItems(root);
		items[items.length - 1]?.focus();
	}

	static listboxTypeahead(el: HTMLElement): string {
		// Prefer explicit data-text-value (Select.Item sets this), fallback to textContent
		return (el.getAttribute("data-text-value") ?? el.textContent ?? "").trim().toLowerCase();
	}

	static listboxFocusTypeAhead(root: HTMLElement | null, query: string) {
		const items = MenuFocus.listboxItems(root);
		if (items.length === 0) return;

		const q = query.trim().toLowerCase();
		if (!q) return;

		const active = document.activeElement as HTMLElement | null;
		const startIdx = active ? items.indexOf(active) : -1;

		const ordered = startIdx >= 0 ? [...items.slice(startIdx + 1), ...items.slice(0, startIdx + 1)] : items;

		for (const el of ordered) {
			const txt = MenuFocus.listboxTypeahead(el);
			if (txt.startsWith(q)) {
				el.focus();
				return;
			}
		}
	}
}

export class PlacementManager {
	static fromSideAlign(side: Side, align: Align): Placement {
		if (align === "center") return side;
		return `${side}-${align}` as Placement;
	}
	static side(p: Placement): Side {
		return p.split("-")[0] as Side;
	}
	static align(p: Placement): Align {
		const parts = p.split("-");
		return (parts[1] as Align) ?? "center";
	}
	static virtualPoint(x: number, y: number): VirtualElement {
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
}


/* -------------------------------------------------------------------------------------------------
 * Root context
 * ------------------------------------------------------------------------------------------------- */

type RootCtx = {
	open: boolean;
	setOpen: (open: boolean) => void;

	placement: Placement;
	refs: ReturnType<typeof useFloating>["refs"];
	floatingStyles: React.CSSProperties;
	getReferenceProps: ReturnType<typeof useInteractions>["getReferenceProps"];
	getFloatingProps: ReturnType<typeof useInteractions>["getFloatingProps"];
	floatingContext: ReturnType<typeof useFloating>["context"];

	portalRoot: HTMLElement | null;

	isMounted: boolean;
	transitionStyles: React.CSSProperties;

	contentId: string;

	radioValue: string | null;
	setRadioValue: (v: string) => void;

	triggerElRef: React.MutableRefObject<HTMLElement | null>;
};

const RootContext = React.createContext<RootCtx | null>(null);

function useRoot() {
	const ctx = React.useContext(RootContext);
	if (!ctx) throw new Error("ContextMenu components must be used within <ContextMenu.Root>.");
	return ctx;
}

export type ContextMenuRootProps = React.PropsWithChildren<{
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;

	side?: Side;
	align?: Align;
	sideOffset?: number;

	modal?: boolean;
}>;

function useControllableOpen(opts: Pick<ContextMenuRootProps, "open" | "defaultOpen" | "onOpenChange">) {
	const [uncontrolled, setUncontrolled] = React.useState<boolean>(opts.defaultOpen ?? false);
	const controlled = typeof opts.open === "boolean";
	const open = controlled ? (opts.open as boolean) : uncontrolled;

	const setOpen = React.useCallback(
		(next: boolean) => {
			if (!controlled) setUncontrolled(next);
			opts.onOpenChange?.(next);
		},
		[controlled, opts.onOpenChange]
	);

	return { open, setOpen };
}

function Root(props: ContextMenuRootProps) {
	const parentManager = useOverlayDOMManager();
	const dom = parentManager.dom;

	const { open, setOpen } = useControllableOpen(props);
	const contentId = React.useId();

	const [radioValue, setRadioValue] = React.useState<string | null>(null);
	const triggerElRef = React.useRef<HTMLElement | null>(null);

	const placement = React.useMemo<Placement>(() => {
		const side = props.side ?? "right";
		const align = props.align ?? "start";
		return PlacementManager.fromSideAlign(side, align);
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

	const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(() => {
		if (typeof document === "undefined") return null;
		return dom.getPortalContainer();
	});

	React.useEffect(() => {
		if (typeof document === "undefined") return;
		setPortalRoot(dom.getPortalContainer());
	}, [dom]);

	const { isMounted, styles: transitionStyles } = useTransitionStyles(floating.context, {
		duration: { open: 100, close: 90 },
		initial: { opacity: 0, transform: "scale(0.98)" },
		open: { opacity: 1, transform: "scale(1)" },
		close: { opacity: 0, transform: "scale(0.98)" },
	});

	React.useEffect(() => {
		if (!open) {
			const el = triggerElRef.current;
			queueMicrotask(() => el?.focus?.());
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

export type ContextMenuTriggerProps = React.HTMLAttributes<HTMLElement> & {
	asChild?: boolean;
	disabled?: boolean;
};

const Trigger = React.forwardRef<HTMLElement, ContextMenuTriggerProps>(function Trigger(
	{ asChild, disabled, children, onContextMenu, onKeyDown, ...rest },
	forwardedRef
) {
	const ctx = useRoot();
	const Comp = asChild ? Slot : "button";

	const mergedRef = composeRefs(forwardedRef);

	const openAtPoint = (triggerEl: HTMLElement, x: number, y: number) => {
		ctx.triggerElRef.current = triggerEl;
		ctx.refs.setReference(triggerEl as unknown as Element);
		ctx.refs.setPositionReference(PlacementManager.virtualPoint(x, y));
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

	const referenceProps = ctx.getReferenceProps({
		...(rest as React.HTMLAttributes<HTMLElement>),
		ref: mergedRef,
		onContextMenu: handleContextMenu as unknown as React.MouseEventHandler<HTMLElement>,
		onKeyDown: handleKeyDown as unknown as React.KeyboardEventHandler<HTMLElement>,
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

export type ContextMenuContentProps = React.HTMLAttributes<HTMLDivElement> & {
	sideOffset?: number;
};

const Content = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(function Content({ style, children, onKeyDown, ...props }, forwardedRef) {
	const ctx = useRoot();

	const placementSide = PlacementManager.side(ctx.placement);
	const placementAlign = PlacementManager.align(ctx.placement);

	const localRef = React.useRef<HTMLDivElement | null>(null);
	const typeaheadRef = React.useRef<{ buffer: string; timer: number | null }>({
		buffer: "",
		timer: null,
	});

	React.useLayoutEffect(() => {
		if (!ctx.open) return;

		const active = document.activeElement as HTMLElement | null;
		if (active && localRef.current && localRef.current.contains(active)) return;

		queueMicrotask(() => {
			const activeNow = document.activeElement as HTMLElement | null;
			if (activeNow && localRef.current && localRef.current.contains(activeNow)) return;
			MenuFocus.first(localRef.current);
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
			MenuFocus.next(localRef.current, 1);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			MenuFocus.next(localRef.current, -1);
		} else if (e.key === "Home") {
			e.preventDefault();
			MenuFocus.first(localRef.current);
		} else if (e.key === "End") {
			e.preventDefault();
			MenuFocus.end(localRef.current);
		} else if (e.key === "Enter" || e.key === " ") {
			const active = document.activeElement as HTMLElement | null;
			if (active && localRef.current?.contains(active)) {
				e.preventDefault();
				active.click();
			}
		} else if (MenuFocus.isPrintableKey(e)) {
			typeaheadRef.current.buffer += e.key.toLowerCase();

			if (typeaheadRef.current.timer != null) window.clearTimeout(typeaheadRef.current.timer);
			typeaheadRef.current.timer = window.setTimeout(() => {
				typeaheadRef.current.buffer = "";
				typeaheadRef.current.timer = null;
			}, 500);

			MenuFocus.focusTypeAhead(localRef.current, typeaheadRef.current.buffer);
		}

		onKeyDown?.(e);
	};

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

export type ContextMenuItemProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> & {
	inset?: boolean;
	disabled?: boolean;
	variant?: "default" | "destructive";
	onSelect?: (event: Event) => void;
};

type SelectEvent = CustomEvent<{ originalEvent?: Event }>;

function dispatchSelect(target: HTMLElement): SelectEvent {
	const ev = new CustomEvent<{ originalEvent?: Event }>("select", {
		bubbles: true,
		cancelable: true,
		detail: {},
	});
	target.dispatchEvent(ev);
	return ev as SelectEvent;
}

const Item = React.forwardRef<HTMLDivElement, ContextMenuItemProps>(function Item(
	{ inset, disabled, variant = "default", onClick, onKeyDown, onSelect, role, ...props },
	forwardedRef
) {
	const ctx = useRoot();

	const runSelect = (target: HTMLElement, originalEvent?: Event) => {
		const ev = dispatchSelect(target);
		if (originalEvent) ev.detail.originalEvent = originalEvent;
		onSelect?.(ev);
		if (!ev.defaultPrevented) ctx.setOpen(false);
	};

	return (
		<div
			{...props}
			ref={forwardedRef}
			role={role ?? "menuitem"}
			data-slot="context-menu-item"
			data-inset={inset ? "" : undefined}
			data-variant={variant}
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
		/>
	);
});

export type ContextMenuLabelProps = React.HTMLAttributes<HTMLDivElement> & { inset?: boolean };
const Label = React.forwardRef<HTMLDivElement, ContextMenuLabelProps>(function Label(
  { inset, ...props },
  ref
) {
  return (
    <div
      {...props}
      ref={ref}
      data-slot="context-menu-label"
      data-inset={inset ? "" : undefined}
    />
  );
});

export type ContextMenuSeparatorProps = React.HTMLAttributes<HTMLDivElement>;
const Separator = React.forwardRef<HTMLDivElement, ContextMenuSeparatorProps>(function Separator(
  props,
  ref
) {
  return <div {...props} ref={ref} role="separator" data-slot="context-menu-separator" />;
});

export type ContextMenuShortcutProps = React.HTMLAttributes<HTMLSpanElement>;
const Shortcut = React.forwardRef<HTMLSpanElement, ContextMenuShortcutProps>(function Shortcut(
  props,
  ref
) {
  return <span {...props} ref={ref} data-slot="context-menu-shortcut" />;
});

/* -------------------------------------------------------------------------------------------------
 * Checkbox + Radio
 * ------------------------------------------------------------------------------------------------- */

export type ContextMenuCheckboxItemProps = Omit<ContextMenuItemProps, "onClick" | "role"> & {
	checked?: SelectedState;
	onCheckedChange?: (checked: boolean) => void;
};

const CheckboxItem = React.forwardRef<HTMLDivElement, ContextMenuCheckboxItemProps>(function CheckboxItem(
	{ checked = false, onCheckedChange, onSelect, ...props },
	forwardedRef
) {
	const isOn = checked === true;

	return (
		<Item
			{...props}
			ref={forwardedRef}
			role="menuitemcheckbox"
			aria-checked={checked === "indeterminate" ? "mixed" : isOn}
			data-slot="context-menu-checkbox-item"
			data-state={checked === "indeterminate" ? "indeterminate" : isOn ? "checked" : "unchecked"}
			onSelect={(ev) => {
				onCheckedChange?.(!isOn);
				onSelect?.(ev);
			}}
		/>
	);
});

type RadioGroupCtx = { value: string | null; setValue: (v: string) => void };
const RadioGroupContext = React.createContext<RadioGroupCtx | null>(null);

function RadioGroup(props: { value?: string; onValueChange?: (v: string) => void; children: React.ReactNode }) {
	const root = useRoot();
	const resolved = props.value ?? root.radioValue;

	const setValue = React.useCallback(
		(v: string) => {
			if (props.value === undefined) root.setRadioValue(v);
			props.onValueChange?.(v);
		},
		[props.onValueChange, props.value, root]
	);

	const ctx = React.useMemo<RadioGroupCtx>(() => ({ value: resolved ?? null, setValue }), [resolved, setValue]);
	return <RadioGroupContext.Provider value={ctx}>{props.children}</RadioGroupContext.Provider>;
}

export type ContextMenuRadioItemProps = Omit<ContextMenuItemProps, "onClick" | "role"> & {
	value: string;
};

const RadioItem = React.forwardRef<HTMLDivElement, ContextMenuRadioItemProps>(function RadioItem({ value, onSelect, ...props }, forwardedRef) {
	const rg = React.useContext(RadioGroupContext);
	const isOn = rg?.value === value;

	return (
		<Item
			{...props}
			ref={forwardedRef}
			role="menuitemradio"
			aria-checked={isOn}
			data-slot="context-menu-radio-item"
			data-state={isOn ? "checked" : "unchecked"}
			onSelect={(ev) => {
				rg?.setValue(value);
				onSelect?.(ev);
			}}
		/>
	);
});

/* -------------------------------------------------------------------------------------------------
 * Submenu
 * ------------------------------------------------------------------------------------------------- */

type SubCtx = {
	open: boolean;
	setOpen: (o: boolean) => void;

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
	if (!ctx) throw new Error("ContextMenuSub components must be used within <ContextMenu.Sub>.");
	return ctx;
}

function Sub({ children }: { children: React.ReactNode }) {
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

	React.useEffect(() => {
		if (!root.open) setOpen(false);
	}, [root.open]);

	const value = React.useMemo<SubCtx>(
		() => ({
			open,
			setOpen,
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

export type ContextMenuSubTriggerProps = ContextMenuItemProps;

const SubTrigger = React.forwardRef<HTMLDivElement, ContextMenuSubTriggerProps>(function SubTrigger(
	{ disabled, onKeyDown, onPointerMove, onMouseEnter, ...props },
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
		inset: props.inset?.toString() || undefined,
		role: "menuitem",
		"aria-haspopup": "menu",
		"aria-expanded": sub.open,
		"data-slot": "context-menu-sub-trigger",
		"data-disabled": disabled ? "" : undefined,
		tabIndex: disabled ? undefined : -1,
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
			if (e.button === 0) sub.setOpen(true);
			props.onPointerDown?.(e);
		},
	} as React.HTMLAttributes<HTMLDivElement>);

	return <div {...referenceProps} />;
});

export type ContextMenuSubContentProps = React.HTMLAttributes<HTMLDivElement>;

const SubContent = React.forwardRef<HTMLDivElement, ContextMenuSubContentProps>(function SubContent({ style, onKeyDown, ...props }, forwardedRef) {
	const sub = useSub();
	const localRef = React.useRef<HTMLDivElement | null>(null);

	React.useLayoutEffect(() => {
		if (!sub.open) return;
		if (sub.openByKeyboardRef.current) {
			sub.openByKeyboardRef.current = false;
			MenuFocus.first(localRef.current);
		}
	}, [sub.open]);

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
	} as React.HTMLAttributes<HTMLDivElement>);

	return (
		<FloatingPortal root={sub.portalRoot}>
			<div {...floatingProps} />
		</FloatingPortal>
	);
});

/* -------------------------------------------------------------------------------------------------
 * Public API (shadcn-friendly namespace)
 * ------------------------------------------------------------------------------------------------- */

export {
	Root,
	Trigger,
	Content,
	Item,
	Label,
	Separator,
	Shortcut,
	CheckboxItem,
	RadioGroup,
	RadioItem,
	Sub,
	SubTrigger,
	SubContent,
};
