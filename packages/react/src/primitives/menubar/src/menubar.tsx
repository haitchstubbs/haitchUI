"use client";

import * as React from "react";
import {
	FloatingArrow,
	FloatingFocusManager,
	FloatingPortal,
	autoUpdate,
	flip,
	offset,
	shift,
	size as fsize,
	safePolygon,
	useClick,
	useDismiss,
	useFloating,
	useFocus,
	useHover,
	useInteractions,
	useRole,
	useTransitionStyles,
	type Placement,
} from "@floating-ui/react";

/* -------------------------------------------------------------------------------------------------
 * Types + utils
 * ------------------------------------------------------------------------------------------------- */

export type CSSProperties = React.CSSProperties;

export type DivProps = React.ComponentPropsWithRef<"div">;
export type ButtonProps = React.ComponentPropsWithRef<"button">;

export type ClassNameProp<S> = string | ((state: S) => string | undefined);
export type StyleProp<S> = CSSProperties | ((state: S) => CSSProperties | undefined);
export type RenderProp<HP, S> = React.ReactElement | ((props: HP, state: S) => React.ReactElement);

function composeEventHandlers<E>(theirs: ((event: E) => void) | undefined, ours: (event: E) => void) {
	return (event: E) => {
		theirs?.(event);
		// @ts-expect-error common pattern
		if (event?.defaultPrevented) return;
		ours(event);
	};
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
	return (node: T) => {
		for (const ref of refs) {
			if (!ref) continue;
			if (typeof ref === "function") ref(node);
			else (ref as React.MutableRefObject<T | null>).current = node;
		}
	};
}

function getPropValue<T, S>(prop: T | ((state: S) => T | undefined) | undefined, state: S) {
	if (typeof prop === "function") return (prop as any)(state);
	return prop as any;
}

function renderWith<HP extends Record<string, any>, S>(render: RenderProp<HP, S> | undefined, props: HP, state: S) {
	if (!render) return null;
	if (typeof render === "function") return render(props, state);
	return React.cloneElement(render, props);
}

function cx(...parts: Array<string | undefined | false | null>) {
	return parts.filter(Boolean).join(" ");
}

function isPrintableKey(key: string) {
	return key.length === 1 && key !== " " && !key.startsWith("Arrow");
}

function makeTextValue(node: HTMLElement | null) {
	if (!node) return "";
	const aria = node.getAttribute("aria-label");
	if (aria) return aria.trim().toLowerCase();
	return (node.textContent ?? "").trim().toLowerCase();
}

function useControllableState<T>({ value, defaultValue, onChange }: { value: T | undefined; defaultValue: T; onChange?: (v: T) => void }) {
	const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
	const isControlled = value !== undefined;
	const v = isControlled ? (value as T) : uncontrolled;

	const set = React.useCallback(
		(next: T) => {
			if (!isControlled) setUncontrolled(next);
			onChange?.(next);
		},
		[isControlled, onChange]
	);

	return [v, set] as const;
}

let cachedRoot: HTMLElement | null = null;

export function getUIPortalRoot(): HTMLElement {
	if (typeof document === "undefined") {
		return undefined as unknown as HTMLElement;
	}

	if (cachedRoot && document.contains(cachedRoot)) {
		return cachedRoot;
	}

	cachedRoot = document.querySelector<HTMLElement>(".ui-root") ?? document.body;

	return cachedRoot;
}

/* -------------------------------------------------------------------------------------------------
 * Public API types
 * ------------------------------------------------------------------------------------------------- */

export type MenubarState = {
	disabled: boolean;
	orientation: "horizontal" | "vertical";
	modal: boolean;
	loopFocus: boolean;
};

export type MenubarProps = Omit<DivProps, "className" | "style" | "children"> & {
	loopFocus?: boolean;
	modal?: boolean;
	disabled?: boolean;
	orientation?: "horizontal" | "vertical";
	className?: ClassNameProp<MenubarState>;
	style?: StyleProp<MenubarState>;
	render?: RenderProp<DivProps, MenubarState>;
	children?: React.ReactNode;
};

export type MenuState = {
	open: boolean;
	disabled: boolean;
	active: boolean;
};

export type MenuRootProps = Omit<DivProps, "className" | "style" | "children"> & {
	disabled?: boolean;
	defaultOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	placement?: Placement;
	className?: ClassNameProp<MenuState>;
	style?: StyleProp<MenuState>;
	render?: RenderProp<DivProps, MenuState>;
	children?: React.ReactNode;
};

export type MenuTriggerProps = Omit<ButtonProps, "className" | "style"> & {
	className?: ClassNameProp<{ open: boolean; disabled: boolean; active: boolean }>;
	style?: StyleProp<{ open: boolean; disabled: boolean; active: boolean }>;
	render?: RenderProp<ButtonProps, { open: boolean; disabled: boolean; active: boolean }>;
};

export type MenuPortalProps = { children?: React.ReactNode };

export type MenuBackdropProps = Omit<DivProps, "className" | "style"> & {
	className?: ClassNameProp<{ open: boolean }>;
	style?: StyleProp<{ open: boolean }>;
	render?: RenderProp<DivProps, { open: boolean }>;
};

export type MenuPositionerProps = Omit<DivProps, "className" | "style"> & {
	className?: ClassNameProp<{ open: boolean }>;
	style?: StyleProp<{ open: boolean }>;
	render?: RenderProp<DivProps, { open: boolean }>;
	children?: React.ReactNode;
};

export type MenuPopupProps = Omit<DivProps, "className" | "style"> & {
	className?: ClassNameProp<{ open: boolean }>;
	style?: StyleProp<{ open: boolean }>;
	render?: RenderProp<DivProps, { open: boolean }>;
	children?: React.ReactNode;
};

export type MenuItemCommonState = {
	disabled: boolean;
	highlighted: boolean;
};

export type MenuItemProps = Omit<ButtonProps, "className" | "style"> & {
	disabled?: boolean;
	closeOnSelect?: boolean;
	className?: ClassNameProp<MenuItemCommonState>;
	style?: StyleProp<MenuItemCommonState>;
	render?: RenderProp<ButtonProps, MenuItemCommonState>;
};

export type MenuSeparatorProps = Omit<DivProps, "className" | "style"> & {
	className?: ClassNameProp<{}>;
	style?: StyleProp<{}>;
	render?: RenderProp<DivProps, {}>;
};

export type MenuGroupProps = Omit<DivProps, "className" | "style" | "children"> & {
	className?: ClassNameProp<{}>;
	style?: StyleProp<{}>;
	render?: RenderProp<DivProps, {}>;
	children?: React.ReactNode;
};

export type MenuGroupLabelProps = Omit<DivProps, "className" | "style"> & {
	className?: ClassNameProp<{}>;
	style?: StyleProp<{}>;
	render?: RenderProp<DivProps, {}>;
};

export type MenuRadioGroupProps = {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	children?: React.ReactNode;
};

export type MenuRadioItemProps = Omit<MenuItemProps, "onClick"> & {
	value: string;
	onSelect?: () => void;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export type MenuCheckboxItemProps = Omit<MenuItemProps, "onClick"> & {
	checked?: boolean;
	defaultChecked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	onSelect?: () => void;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export type MenuArrowProps = React.ComponentProps<typeof FloatingArrow> & {
	className?: string;
};

/** Submenu primitives */
export type MenuSubProps = {
	disabled?: boolean;
	defaultOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	placement?: Placement; // default: "right-start"
	children?: React.ReactNode;
};

export type MenuSubTriggerProps = Omit<MenuItemProps, "closeOnSelect"> & {
	disabled?: boolean;
	openOnHover?: boolean; // default true
	openOnFocus?: boolean; // default true
};

export type MenuSubContentProps = Omit<DivProps, "className" | "style" | "children"> & {
	className?: ClassNameProp<{ open: boolean }>;
	style?: StyleProp<{ open: boolean }>;
	render?: RenderProp<DivProps, { open: boolean }>;
	children?: React.ReactNode;
};

type MenuItemIndicatorState = { kind: "checkbox"; checked: boolean } | { kind: "radio"; checked: boolean } | { kind: "item"; checked: false };

const MenuItemIndicatorContext = React.createContext<MenuItemIndicatorState | null>(null);

function useMenuItemIndicatorCtx(name: string) {
	const ctx = React.useContext(MenuItemIndicatorContext);
	return ctx ?? { kind: "item" as const, checked: false as const };
}

export type MenuItemIndicatorProps = Omit<DivProps, "children"> & {
	/** Rendered only when checked/selected */
	children?: React.ReactNode;
	/** Optional: force mount (useful for layout consistency/animations) */
	forceMount?: boolean;
};

/* -------------------------------------------------------------------------------------------------
 * Menubar context
 * ------------------------------------------------------------------------------------------------- */

type MenuRegistration = {
	id: string;
	triggerRef: React.RefObject<HTMLButtonElement | null>;
	setOpenFromMenubar: (open: boolean) => void;
	getOpen: () => boolean;
	isDisabled: () => boolean;
};

type MenubarCtx = {
	state: MenubarState;
	registerMenu: (reg: MenuRegistration) => () => void;
	menus: () => MenuRegistration[];
	activeMenuId: string | null;
	setActiveMenuId: (id: string | null) => void;
	closeAll: () => void;
	focusTriggerByDelta: (delta: number) => void;
	focusTriggerById: (id: string) => void;
};

const MenubarContext = React.createContext<MenubarCtx | null>(null);

function useMenubarCtx(name: string) {
	const ctx = React.useContext(MenubarContext);
	if (!ctx) throw new Error(`${name} must be used within <Menubar>.`);
	return ctx;
}

/* -------------------------------------------------------------------------------------------------
 * Menu context
 * ------------------------------------------------------------------------------------------------- */

type MenuItemRecord = {
	id: string;
	ref: React.RefObject<HTMLElement | null>;
	disabled: boolean;
	textValue: string;
	kind: "item" | "checkbox" | "radio";
};

type MenuRadioCtx = {
	value: string | null;
	setValue: (v: string) => void;
};

type MenuTransitionCtx = {
	isMounted: boolean;
	transitionStyles: React.CSSProperties;
};

type MenuCtx = {
	id: string;
	disabled: boolean;
	open: boolean;
	setOpen: (open: boolean, reason?: string) => void;

	floating: ReturnType<typeof useFloating>;
	getReferenceProps: ReturnType<typeof useInteractions>["getReferenceProps"];
	getFloatingProps: ReturnType<typeof useInteractions>["getFloatingProps"];

	triggerRef: React.RefObject<HTMLButtonElement | null>;
	popupRef: React.RefObject<HTMLDivElement | null>;
	items: React.MutableRefObject<MenuItemRecord[]>;
	registerItem: (rec: MenuItemRecord) => () => void;
	highlightedId: string | null;
	setHighlightedId: (id: string | null) => void;
	moveHighlight: (dir: 1 | -1, opts?: { wrap?: boolean }) => void;
	focusHighlighted: () => void;
	focusFirst: () => void;
	focusLast: () => void;
	typeahead: (char: string) => void;

	menubar: MenubarCtx;
};

const MenuContext = React.createContext<MenuCtx | null>(null);
function useMenuCtx(name: string) {
	const ctx = React.useContext(MenuContext);
	if (!ctx) throw new Error(`${name} must be used within <Menu.Root>.`);
	return ctx;
}

const MenuRadioGroupContext = React.createContext<MenuRadioCtx | null>(null);
function useMenuRadioGroupCtx(name: string) {
	const ctx = React.useContext(MenuRadioGroupContext);
	if (!ctx) throw new Error(`${name} must be used within <Menu.RadioGroup>.`);
	return ctx;
}

const MenuTransitionContext = React.createContext<MenuTransitionCtx | null>(null);
function useMenuTransition() {
	return React.useContext(MenuTransitionContext) ?? { isMounted: false, transitionStyles: {} };
}

/* -------------------------------------------------------------------------------------------------
 * Submenu context
 * ------------------------------------------------------------------------------------------------- */

type SubCtx = {
	id: string;
	parent: MenuCtx;
	disabled: boolean;
	open: boolean;
	setOpen: (open: boolean, reason?: string) => void;

	triggerRef: React.RefObject<HTMLButtonElement | null>;
	popupRef: React.RefObject<HTMLDivElement | null>;

	floating: ReturnType<typeof useFloating>;
	getReferenceProps: ReturnType<typeof useInteractions>["getReferenceProps"];
	getFloatingProps: ReturnType<typeof useInteractions>["getFloatingProps"];

	items: React.MutableRefObject<MenuItemRecord[]>;
	registerItem: (rec: MenuItemRecord) => () => void;
	highlightedId: string | null;
	setHighlightedId: (id: string | null) => void;
	moveHighlight: (dir: 1 | -1, opts?: { wrap?: boolean }) => void;
	focusHighlighted: () => void;
	focusFirst: () => void;
	focusLast: () => void;
	typeahead: (char: string) => void;

	isMounted: boolean;
	transitionStyles: React.CSSProperties;
};

const SubmenuContext = React.createContext<SubCtx | null>(null);

function useSubmenuCtx(name: string) {
	const ctx = React.useContext(SubmenuContext);
	if (!ctx) throw new Error(`${name} must be used within <Menu.Sub>.`);
	return ctx;
}

/* -------------------------------------------------------------------------------------------------
 * Menubar
 * ------------------------------------------------------------------------------------------------- */

export function Menubar(props: MenubarProps) {
	const {
		loopFocus = true,
		modal = true,
		disabled = false,
		orientation = "horizontal",
		className,
		style,
		render,
		children,
		onKeyDown,
		...rest
	} = props;

	const state = React.useMemo<MenubarState>(() => ({ disabled, orientation, modal, loopFocus }), [disabled, orientation, modal, loopFocus]);

	const regsRef = React.useRef<MenuRegistration[]>([]);
	const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

	const registerMenu = React.useCallback((reg: MenuRegistration) => {
		regsRef.current = [...regsRef.current, reg];
		return () => {
			regsRef.current = regsRef.current.filter((r) => r.id !== reg.id);
		};
	}, []);

	const menus = React.useCallback(() => regsRef.current, []);

	const closeAll = React.useCallback(() => {
		for (const m of regsRef.current) m.setOpenFromMenubar(false);
		setActiveMenuId(null);
	}, []);

	const focusTriggerById = React.useCallback((id: string) => {
		const m = regsRef.current.find((r) => r.id === id);
		m?.triggerRef.current?.focus();
	}, []);

	const focusTriggerByDelta = React.useCallback(
		(delta: number) => {
			const list = regsRef.current.filter((r) => !r.isDisabled());
			if (!list.length) return;

			const focused = document.activeElement;
			const idx = list.findIndex((r) => r.triggerRef.current === focused);
			const start = idx >= 0 ? idx : 0;

			let next = start + delta;
			if (state.loopFocus) next = (next + list.length) % list.length;
			else next = Math.max(0, Math.min(list.length - 1, next));

			list[next]?.triggerRef.current?.focus();
		},
		[state.loopFocus]
	);

	const ctx = React.useMemo<MenubarCtx>(
		() => ({
			state,
			registerMenu,
			menus,
			activeMenuId,
			setActiveMenuId,
			closeAll,
			focusTriggerByDelta,
			focusTriggerById,
		}),
		[state, registerMenu, menus, activeMenuId, closeAll, focusTriggerByDelta, focusTriggerById]
	);

	const baseProps: DivProps = {
		role: "menubar",
		"aria-orientation": orientation,
		...rest,
		onKeyDown: composeEventHandlers(onKeyDown as any, (e: React.KeyboardEvent<HTMLDivElement>) => {
			if (state.disabled) return;

			const horizontal = orientation === "horizontal";
			const prevKey = horizontal ? "ArrowLeft" : "ArrowUp";
			const nextKey = horizontal ? "ArrowRight" : "ArrowDown";

			if (e.key === prevKey) {
				e.preventDefault();
				ctx.focusTriggerByDelta(-1);
			} else if (e.key === nextKey) {
				e.preventDefault();
				ctx.focusTriggerByDelta(1);
			} else if (e.key === "Escape") {
				ctx.closeAll();
			}
		}),
		className: cx(getPropValue(className, state)),
		style: getPropValue(style, state),
	};

	const rendered = renderWith(render, baseProps, state);

	return <MenubarContext.Provider value={ctx}>{rendered ?? <div {...baseProps}>{children}</div>}</MenubarContext.Provider>;
}

/* -------------------------------------------------------------------------------------------------
 * Menu helpers
 * ------------------------------------------------------------------------------------------------- */

function nextItemId(items: MenuItemRecord[], currentId: string | null, dir: 1 | -1, wrap: boolean) {
	const enabled = items.filter((i) => !i.disabled);
	if (!enabled.length) return null;

	const idx = enabled.findIndex((i) => i.id === currentId);
	const start = idx >= 0 ? idx : dir === 1 ? -1 : enabled.length;

	let next = start + dir;
	if (wrap) next = (next + enabled.length) % enabled.length;
	else next = Math.max(0, Math.min(enabled.length - 1, next));

	return enabled[next]?.id ?? null;
}

/* -------------------------------------------------------------------------------------------------
 * Menu primitives
 * ------------------------------------------------------------------------------------------------- */

export const Menu = {
	Root: function MenuRoot(props: MenuRootProps) {
		const menubar = useMenubarCtx("Menu.Root");

		const {
			disabled: disabledProp = false,
			defaultOpen,
			open: openProp,
			onOpenChange,
			placement = "bottom-start",
			className,
			style,
			render,
			children,
			...rest
		} = props;

		const id = React.useId();
		const triggerRef = React.useRef<HTMLButtonElement | null>(null);
		const popupRef = React.useRef<HTMLDivElement | null>(null);

		const disabled = menubar.state.disabled || disabledProp;

		const [open, setOpen] = useControllableState<boolean>({
			value: openProp,
			defaultValue: defaultOpen ?? false,
			onChange: onOpenChange,
		});

		const floating = useFloating({
			open,
			onOpenChange: (o) => setOpen(o),
			placement,
			whileElementsMounted: autoUpdate,
			middleware: [
				offset(6),
				flip(),
				shift({ padding: 8 }),
				fsize({
					padding: 8,
					apply({ rects, availableHeight, elements }) {
						Object.assign(elements.floating.style, {
							minWidth: `${rects.reference.width}px`,
							maxHeight: `${Math.max(80, availableHeight)}px`,
							overflow: "auto",
						});
					},
				}),
			],
		});

		const { context } = floating;

		const click = useClick(context, { enabled: !disabled, toggle: true, event: "mousedown" });
		const role = useRole(context, { role: "menu" });
		const dismiss = useDismiss(context, {
			enabled: true,
			escapeKey: true,
			outsidePressEvent: "mousedown",
		});
		const { getReferenceProps, getFloatingProps } = useInteractions([click, role, dismiss]);

		const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
			duration: { open: 120, close: 90 },
			initial: { opacity: 0, transform: "scale(0.98)" },
			open: { opacity: 1, transform: "scale(1)" },
			close: { opacity: 0, transform: "scale(0.98)" },
		});

		const items = React.useRef<MenuItemRecord[]>([]);
		const [highlightedId, setHighlightedId] = React.useState<string | null>(null);

		const registerItem = React.useCallback((rec: MenuItemRecord) => {
			items.current = [...items.current.filter((i) => i.id !== rec.id), rec];
			return () => {
				items.current = items.current.filter((i) => i.id !== rec.id);
			};
		}, []);

		const moveHighlight = React.useCallback(
			(dir: 1 | -1, opts?: { wrap?: boolean }) => {
				const wrap = opts?.wrap ?? menubar.state.loopFocus;
				const next = nextItemId(items.current, highlightedId, dir, wrap);
				setHighlightedId(next);
			},
			[highlightedId, menubar.state.loopFocus]
		);

		const focusHighlighted = React.useCallback(() => {
			const item = items.current.find((i) => i.id === highlightedId);
			item?.ref.current?.focus();
		}, [highlightedId]);

		const focusFirst = React.useCallback(() => {
			const enabledItems = items.current.filter((i) => !i.disabled);
			const first = enabledItems[0]?.id ?? null;
			setHighlightedId(first);
			queueMicrotask(() => enabledItems[0]?.ref.current?.focus());
		}, []);

		const focusLast = React.useCallback(() => {
			const enabledItems = items.current.filter((i) => !i.disabled);
			const last = enabledItems[enabledItems.length - 1]?.id ?? null;
			setHighlightedId(last);
			queueMicrotask(() => enabledItems[enabledItems.length - 1]?.ref.current?.focus());
		}, []);

		const typeBufferRef = React.useRef("");
		const typeTimerRef = React.useRef<number | null>(null);

		const typeahead = React.useCallback(
			(char: string) => {
				window.clearTimeout(typeTimerRef.current ?? undefined);
				typeBufferRef.current = (typeBufferRef.current + char).slice(0, 30);
				typeTimerRef.current = window.setTimeout(() => {
					typeBufferRef.current = "";
				}, 450);

				const q = typeBufferRef.current.toLowerCase();
				const enabledItems = items.current.filter((i) => !i.disabled);
				const startIdx = highlightedId ? enabledItems.findIndex((i) => i.id === highlightedId) : -1;

				const ordered = [...enabledItems.slice(startIdx + 1), ...enabledItems.slice(0, startIdx + 1)];
				const hit = ordered.find((i) => i.textValue.startsWith(q));
				if (hit) {
					setHighlightedId(hit.id);
					queueMicrotask(() => hit.ref.current?.focus());
				}
			},
			[highlightedId]
		);

		React.useEffect(() => {
			if (!open) {
				setHighlightedId(null);
				return;
			}
			const enabledItems = items.current.filter((i) => !i.disabled);
			const first = enabledItems[0]?.id ?? null;
			setHighlightedId(first);
			queueMicrotask(() => enabledItems[0]?.ref.current?.focus());
		}, [open]);

		React.useEffect(() => {
			return menubar.registerMenu({
				id,
				triggerRef,
				setOpenFromMenubar: (o) => setOpen(o),
				getOpen: () => open,
				isDisabled: () => disabled,
			});
		}, [menubar, id, open, disabled, setOpen]);

		const setOpenWithReason = React.useCallback(
			(o: boolean) => {
				if (disabled) return;
				setOpen(o);
				if (o) menubar.setActiveMenuId(id);
				if (!o && menubar.activeMenuId === id) menubar.setActiveMenuId(null);
			},
			[disabled, setOpen, menubar, id]
		);

		React.useEffect(() => {
			if (!open) return;
			if (menubar.activeMenuId && menubar.activeMenuId !== id) setOpen(false);
		}, [menubar.activeMenuId, open, id, setOpen]);

		const rootState: MenuState = { open, disabled, active: menubar.activeMenuId === id };

		const ctx: MenuCtx = React.useMemo(
			() => ({
				id,
				disabled,
				open,
				setOpen: setOpenWithReason,
				floating,
				getReferenceProps,
				getFloatingProps,
				triggerRef,
				popupRef,
				items,
				registerItem,
				highlightedId,
				setHighlightedId,
				moveHighlight,
				focusHighlighted,
				focusFirst,
				focusLast,
				typeahead,
				menubar,
			}),
			[
				id,
				disabled,
				open,
				setOpenWithReason,
				floating,
				getReferenceProps,
				getFloatingProps,
				highlightedId,
				moveHighlight,
				focusHighlighted,
				focusFirst,
				focusLast,
				typeahead,
				menubar,
			]
		);

		const baseProps: DivProps = {
			...rest,
			className: cx(getPropValue(className, rootState)),
			style: getPropValue(style, rootState),
		};

		const rendered = renderWith(render, baseProps, rootState);

		return (
			<MenuContext.Provider value={ctx}>
				<MenuTransitionContext.Provider value={{ isMounted, transitionStyles }}>
					{rendered ?? (
						<div {...baseProps} data-state={open ? "open" : "closed"} data-disabled={disabled ? "" : undefined}>
							{children}
						</div>
					)}
				</MenuTransitionContext.Provider>
			</MenuContext.Provider>
		);
	},

	Trigger: function MenuTrigger(props: MenuTriggerProps) {
		const menu = useMenuCtx("Menu.Trigger");
		const { className, style, render, disabled: disabledProp, onKeyDown, onPointerDown, onPointerMove, onPointerEnter, ...rest } = props;

		const disabled = menu.disabled || !!disabledProp;
		const state = { open: menu.open, disabled, active: menu.menubar.activeMenuId === menu.id };

		const base = menu.getReferenceProps({
			...rest,
			ref: mergeRefs(
				menu.triggerRef,
				(node) => {
					if (node !== null) menu.floating.refs.setReference(node);
				},
				(props as any).ref
			),
			role: "menuitem",
			type: (rest as any).type ?? "button",
			"aria-haspopup": "menu",
			"aria-expanded": menu.open,
			disabled,
			tabIndex: state.active || !menu.menubar.activeMenuId ? 0 : -1,
			onPointerDown: composeEventHandlers(onPointerDown as any, () => {
				if (disabled) return;
				menu.menubar.setActiveMenuId(menu.id);
			}),
			onKeyDown: composeEventHandlers(onKeyDown as any, (e: React.KeyboardEvent<HTMLButtonElement>) => {
				if (disabled) return;

				if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					menu.setOpen(true, "trigger-key");
					return;
				}

				const horizontal = menu.menubar.state.orientation === "horizontal";
				const prevKey = horizontal ? "ArrowLeft" : "ArrowUp";
				const nextKey = horizontal ? "ArrowRight" : "ArrowDown";

				if (e.key === prevKey) {
					e.preventDefault();
					menu.menubar.focusTriggerByDelta(-1);
				} else if (e.key === nextKey) {
					e.preventDefault();
					menu.menubar.focusTriggerByDelta(1);
				} else if (e.key === "Escape") {
					menu.menubar.closeAll();
				}
			}),
			onPointerEnter: composeEventHandlers(onPointerEnter as any, () => {
				if (disabled) return;

				// If another menu is active/open in the menubar, hover switches to this one.
				if (menu.menubar.activeMenuId && menu.menubar.activeMenuId !== menu.id) {
					menu.menubar.setActiveMenuId(menu.id);
					menu.setOpen(true, "menubar-hover");
				}
			}),
			onPointerMove: composeEventHandlers(onPointerMove as any, () => {
				if (disabled) return;

				if (menu.menubar.activeMenuId && menu.menubar.activeMenuId !== menu.id) {
					menu.menubar.setActiveMenuId(menu.id);
					menu.setOpen(true, "menubar-hover");
				}
			}),
			className: cx(getPropValue(className as any, state)),
			style: getPropValue(style as any, state),
		});

		const rendered = renderWith(render as any, base, state);
		return rendered ?? <button {...base} data-active={state.active ? "" : undefined} data-state={menu.open ? "open" : "closed"} />;
	},

	Portal: function MenuPortal({ children }: MenuPortalProps) {
		const menu = useMenuCtx("Menu.Portal");
		const t = useMenuTransition();
		if (!menu.open && !t.isMounted) return null;
		return <FloatingPortal root={getUIPortalRoot()}>{children}</FloatingPortal>;
	},

	Backdrop: function MenuBackdrop(props: MenuBackdropProps) {
		const menu = useMenuCtx("Menu.Backdrop");
		const { className, style, render, onMouseDown, ...rest } = props;
		const state = { open: menu.open };

		if (!menu.menubar.state.modal) return null;

		const base: DivProps = {
			...rest,
			onMouseDown: composeEventHandlers(onMouseDown as any, (e: React.MouseEvent<HTMLDivElement>) => {
				e.preventDefault();
				menu.menubar.closeAll();
			}),
			style: getPropValue(style, state),
			className: cx(getPropValue(className, state)),
		};

		const rendered = renderWith(render, base, state);
		return rendered ?? <div {...base} data-state={menu.open ? "open" : "closed"} />;
	},

	Positioner: function MenuPositioner(props: MenuPositionerProps) {
		const menu = useMenuCtx("Menu.Positioner");
		const t = useMenuTransition();
		const { className, style, render, children, ...rest } = props;

		if (!menu.open && !t.isMounted) return null;

		const state = { open: menu.open };

		const base: DivProps = menu.getFloatingProps({
			...rest,
			ref: mergeRefs(menu.floating.refs.setFloating, (props as any).ref),
			style: {
				position: menu.floating.strategy,
				top: menu.floating.y ?? 0,
				left: menu.floating.x ?? 0,
				...t.transitionStyles,
				...getPropValue(style, state),
			},
			className: cx(getPropValue(className, state)),
		});

		const rendered = renderWith(render, base, state);
		return (
			rendered ?? (
				<div {...base} data-state={menu.open ? "open" : "closed"}>
					{children}
				</div>
			)
		);
	},

	Popup: function MenuPopup(props: MenuPopupProps) {
		const menu = useMenuCtx("Menu.Popup");
		const { className, style, render, onKeyDown, children, ...rest } = props;

		if (!menu.open) return null;

		const state = { open: menu.open };

		const base: DivProps = {
			...rest,
			ref: mergeRefs(menu.popupRef, (props as any).ref),
			role: "menu",
			tabIndex: -1,
			"aria-orientation": "vertical",
			onKeyDown: composeEventHandlers(onKeyDown as any, (e: React.KeyboardEvent<HTMLDivElement>) => {
				if (e.key === "ArrowDown") {
					e.preventDefault();
					menu.moveHighlight(1);
					queueMicrotask(menu.focusHighlighted);
				} else if (e.key === "ArrowUp") {
					e.preventDefault();
					menu.moveHighlight(-1);
					queueMicrotask(menu.focusHighlighted);
				} else if (e.key === "Home") {
					e.preventDefault();
					menu.focusFirst();
				} else if (e.key === "End") {
					e.preventDefault();
					menu.focusLast();
				} else if (e.key === "Escape") {
					e.preventDefault();
					menu.menubar.closeAll();
					queueMicrotask(() => menu.triggerRef.current?.focus());
				} else if (e.key === "Tab") {
					if (menu.menubar.state.modal) e.preventDefault();
				} else if (isPrintableKey(e.key)) {
					menu.typeahead(e.key);
				}
			}),
			className: cx(getPropValue(className, state)),
			style: getPropValue(style, state),
		};

		const rendered = renderWith(render, base, state);
		const content = rendered ?? (
			<div {...base} data-state={menu.open ? "open" : "closed"}>
				{children}
			</div>
		);

		return menu.menubar.state.modal ? (
			<FloatingFocusManager context={menu.floating.context} modal={true} initialFocus={-1} returnFocus={false}>
				{content}
			</FloatingFocusManager>
		) : (
			content
		);
	},

	Arrow: function MenuArrow(props: MenuArrowProps) {
		const menu = useMenuCtx("Menu.Arrow");
		if (!menu.open) return null;
		const { className, ...rest } = props;
		return <FloatingArrow className={className} {...rest} />;
	},

	Item: function MenuItem(props: MenuItemProps) {
		const menu = useMenuCtx("Menu.Item");
		const { disabled: disabledProp = false, closeOnSelect = true, className, style, render, onPointerMove, onFocus, onClick, ...rest } = props;

		const id = React.useId();
		const ref = React.useRef<HTMLButtonElement | null>(null);
		const disabled = menu.disabled || disabledProp;

		React.useEffect(() => {
			const rec: MenuItemRecord = {
				id,
				ref: ref as React.RefObject<HTMLElement | null>,
				disabled,
				textValue: makeTextValue(ref.current),
				kind: "item",
			};
			return menu.registerItem(rec);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [id, disabled]);

		const highlighted = menu.highlightedId === id;
		const state: MenuItemCommonState = { disabled, highlighted };

		const base: ButtonProps = {
			...rest,
			ref: mergeRefs(ref, (props as any).ref),
			role: "menuitem",
			type: (rest as any).type ?? "button",
			tabIndex: highlighted ? 0 : -1,
			disabled,
			onPointerMove: composeEventHandlers(onPointerMove as any, () => {
				if (disabled) return;
				menu.setHighlightedId(id);
			}),
			onFocus: composeEventHandlers(onFocus as any, () => {
				if (disabled) return;
				menu.setHighlightedId(id);
			}),
			onClick: composeEventHandlers(onClick as any, (e: React.MouseEvent<HTMLButtonElement>) => {
				if (disabled) {
					e.preventDefault();
					return;
				}
				if (closeOnSelect) {
					menu.menubar.closeAll();
					queueMicrotask(() => menu.triggerRef.current?.focus());
				}
			}),
			className: cx(getPropValue(className, state)),
			style: getPropValue(style, state),
		};

		const rendered = renderWith(render as any, base, state);
		return rendered ?? <button {...base} data-highlighted={highlighted ? "" : undefined} data-disabled={disabled ? "" : undefined} />;
	},

	CheckboxItem: function MenuCheckboxItem(props: MenuCheckboxItemProps) {
		const menu = useMenuCtx("Menu.CheckboxItem");

		const {
			checked: checkedProp,
			defaultChecked,
			onCheckedChange,
			onSelect,
			closeOnSelect = true,
			disabled: disabledProp = false,
			className,
			style,
			render,
			onClick,
			...rest
		} = props;

		const [checked, setChecked] = useControllableState<boolean>({
			value: checkedProp,
			defaultValue: defaultChecked ?? false,
			onChange: onCheckedChange,
		});

		const id = React.useId();
		const ref = React.useRef<HTMLButtonElement | null>(null);
		const disabled = menu.disabled || disabledProp;

		React.useEffect(() => {
			const rec: MenuItemRecord = {
				id,
				ref: ref as React.RefObject<HTMLElement | null>,
				disabled,
				textValue: makeTextValue(ref.current),
				kind: "checkbox",
			};
			return menu.registerItem(rec);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [id, disabled]);

		const highlighted = menu.highlightedId === id;
		const state: MenuItemCommonState = { disabled, highlighted };

		const base: ButtonProps = {
			...rest,
			ref: mergeRefs(ref, (props as any).ref),
			role: "menuitemcheckbox",
			"aria-checked": checked,
			type: (rest as any).type ?? "button",
			tabIndex: highlighted ? 0 : -1,
			disabled,
			onPointerMove: composeEventHandlers((rest as any).onPointerMove, () => {
				if (disabled) return;
				menu.setHighlightedId(id);
			}),
			onFocus: composeEventHandlers((rest as any).onFocus, () => {
				if (disabled) return;
				menu.setHighlightedId(id);
			}),
			onClick: composeEventHandlers(onClick as any, (e: React.MouseEvent<HTMLButtonElement>) => {
				if (disabled) {
					e.preventDefault();
					return;
				}
				setChecked(!checked);
				onSelect?.();
				if (closeOnSelect) {
					menu.menubar.closeAll();
					queueMicrotask(() => menu.triggerRef.current?.focus());
				}
			}),
			className: cx(getPropValue(className, state)),
			style: getPropValue(style, state),
		};

		const rendered = renderWith(render as any, base, state);

		const node = rendered ?? (
			<button
				{...base}
				data-highlighted={highlighted ? "" : undefined}
				data-disabled={disabled ? "" : undefined}
				data-checked={checked ? "" : undefined}
			/>
		);

		return <MenuItemIndicatorContext.Provider value={{ kind: "checkbox", checked }}>{node}</MenuItemIndicatorContext.Provider>;
	},

	RadioGroup: function MenuRadioGroup(props: MenuRadioGroupProps) {
		const { value, defaultValue, onValueChange, children } = props;

		const [v, setV] = useControllableState<string>({
			value,
			defaultValue: defaultValue ?? "",
			onChange: onValueChange,
		});

		const ctx = React.useMemo<MenuRadioCtx>(
			() => ({
				value: v || null,
				setValue: setV,
			}),
			[v, setV]
		);

		return <MenuRadioGroupContext.Provider value={ctx}>{children}</MenuRadioGroupContext.Provider>;
	},

	RadioItem: function MenuRadioItem(props: MenuRadioItemProps) {
		const menu = useMenuCtx("Menu.RadioItem");
		const radio = useMenuRadioGroupCtx("Menu.RadioItem");

		const { value, onSelect, closeOnSelect = true, disabled: disabledProp = false, className, style, render, onClick, ...rest } = props;

		const selected = radio.value === value;

		const id = React.useId();
		const ref = React.useRef<HTMLButtonElement | null>(null);
		const disabled = menu.disabled || disabledProp;

		React.useEffect(() => {
			const rec: MenuItemRecord = {
				id,
				ref: ref as React.RefObject<HTMLElement | null>,
				disabled,
				textValue: makeTextValue(ref.current),
				kind: "radio",
			};
			return menu.registerItem(rec);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [id, disabled]);

		const highlighted = menu.highlightedId === id;
		const state: MenuItemCommonState = { disabled, highlighted };

		const base: ButtonProps = {
			...rest,
			ref: mergeRefs(ref, (props as any).ref),
			role: "menuitemradio",
			"aria-checked": selected,
			type: (rest as any).type ?? "button",
			tabIndex: highlighted ? 0 : -1,
			disabled,
			onPointerMove: composeEventHandlers((rest as any).onPointerMove, () => {
				if (disabled) return;
				menu.setHighlightedId(id);
			}),
			onFocus: composeEventHandlers((rest as any).onFocus, () => {
				if (disabled) return;
				menu.setHighlightedId(id);
			}),
			onClick: composeEventHandlers(onClick as any, (e: React.MouseEvent<HTMLButtonElement>) => {
				if (disabled) {
					e.preventDefault();
					return;
				}
				radio.setValue(value);
				onSelect?.();
				if (closeOnSelect) {
					menu.menubar.closeAll();
					queueMicrotask(() => menu.triggerRef.current?.focus());
				}
			}),
			className: cx(getPropValue(className, state)),
			style: getPropValue(style, state),
		};

		const rendered = renderWith(render as any, base, state);

		const node = rendered ?? (
			<button
				{...base}
				data-highlighted={highlighted ? "" : undefined}
				data-disabled={disabled ? "" : undefined}
				data-checked={selected ? "" : undefined}
			/>
		);

		return <MenuItemIndicatorContext.Provider value={{ kind: "radio", checked: selected }}>{node}</MenuItemIndicatorContext.Provider>;
	},

	ItemIndicator: function MenuItemIndicator(props: MenuItemIndicatorProps) {
		const { children, forceMount = false, ...rest } = props;
		const state = useMenuItemIndicatorCtx("Menu.ItemIndicator");

		const shouldRender = forceMount || state.checked;
		if (!shouldRender) return null;

		// Keep this super light: UI layer decides element + styling.
		return (
			<div {...rest} data-state={state.checked ? "checked" : "unchecked"}>
				{children}
			</div>
		);
	},

	Separator: function MenuSeparator(props: MenuSeparatorProps) {
		const { className, style, render, ...rest } = props;
		const state = {};
		const base: DivProps = {
			...rest,
			role: "separator",
			"aria-orientation": "horizontal",
			className: cx(getPropValue(className, state)),
			style: getPropValue(style, state),
		};
		const rendered = renderWith(render, base, state);
		return rendered ?? <div {...base} />;
	},

	Group: function MenuGroup(props: MenuGroupProps) {
		const { className, style, render, children, ...rest } = props;
		const state = {};
		const base: DivProps = {
			...rest,
			role: "group",
			className: cx(getPropValue(className, state)),
			style: getPropValue(style, state),
		};
		const rendered = renderWith(render, base, state);
		return rendered ?? <div {...base}>{children}</div>;
	},

	GroupLabel: function MenuGroupLabel(props: MenuGroupLabelProps) {
		const { className, style, render, ...rest } = props;
		const state = {};
		const base: DivProps = {
			...rest,
			role: "presentation",
			className: cx(getPropValue(className, state)),
			style: getPropValue(style, state),
		};
		const rendered = renderWith(render, base, state);
		return rendered ?? <div {...base} />;
	},

	/* -------------------------------------------------------------------------------------------------
	 * Submenu primitives (hover-intent via safePolygon)
	 * ------------------------------------------------------------------------------------------------- */

	Sub: function MenuSub(props: MenuSubProps) {
		const parent = useMenuCtx("Menu.Sub");
		const menubar = parent.menubar;

		const { disabled: disabledProp = false, defaultOpen, open: openProp, onOpenChange, placement = "right-start", children } = props;

		const id = React.useId();
		const disabled = parent.disabled || disabledProp;

		const [open, setOpen] = useControllableState<boolean>({
			value: openProp,
			defaultValue: defaultOpen ?? false,
			onChange: onOpenChange,
		});

		React.useEffect(() => {
			if (!parent.open && open) setOpen(false);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [parent.open]);

		const triggerRef = React.useRef<HTMLButtonElement | null>(null);
		const popupRef = React.useRef<HTMLDivElement | null>(null);

		const floating = useFloating({
			open,
			onOpenChange: (o) => setOpen(o),
			placement,
			whileElementsMounted: autoUpdate,
			middleware: [
				offset(4),
				flip(),
				shift({ padding: 8 }),
				fsize({
					padding: 8,
					apply({ availableHeight, elements }) {
						Object.assign(elements.floating.style, {
							maxHeight: `${Math.max(80, availableHeight)}px`,
							overflow: "auto",
						});
					},
				}),
			],
		});

		const { context } = floating;

		// Hover intent: safe polygon to keep submenu open when moving diagonally.
		const hover = useHover(context, {
			enabled: !disabled,
			handleClose: safePolygon({ blockPointerEvents: true }),
			restMs: 40,
			delay: { open: 0, close: 80 },
			move: false,
		});

		const focus = useFocus(context, { enabled: !disabled });
		const role = useRole(context, { role: "menu" });
		const dismiss = useDismiss(context, {
			enabled: true,
			escapeKey: true,
			outsidePressEvent: "mousedown",
		});

		const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, role, dismiss]);

		const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
			duration: { open: 120, close: 90 },
			initial: { opacity: 0, transform: "scale(0.98)" },
			open: { opacity: 1, transform: "scale(1)" },
			close: { opacity: 0, transform: "scale(0.98)" },
		});

		const items = React.useRef<MenuItemRecord[]>([]);
		const [highlightedId, setHighlightedId] = React.useState<string | null>(null);

		const registerItem = React.useCallback((rec: MenuItemRecord) => {
			items.current = [...items.current.filter((i) => i.id !== rec.id), rec];
			return () => {
				items.current = items.current.filter((i) => i.id !== rec.id);
			};
		}, []);

		const moveHighlight = React.useCallback(
			(dir: 1 | -1, opts?: { wrap?: boolean }) => {
				const wrap = opts?.wrap ?? menubar.state.loopFocus;
				const next = nextItemId(items.current, highlightedId, dir, wrap);
				setHighlightedId(next);
			},
			[highlightedId, menubar.state.loopFocus]
		);

		const focusHighlighted = React.useCallback(() => {
			const item = items.current.find((i) => i.id === highlightedId);
			item?.ref.current?.focus();
		}, [highlightedId]);

		const focusFirst = React.useCallback(() => {
			const enabledItems = items.current.filter((i) => !i.disabled);
			const first = enabledItems[0]?.id ?? null;
			setHighlightedId(first);
			queueMicrotask(() => enabledItems[0]?.ref.current?.focus());
		}, []);

		const focusLast = React.useCallback(() => {
			const enabledItems = items.current.filter((i) => !i.disabled);
			const last = enabledItems[enabledItems.length - 1]?.id ?? null;
			setHighlightedId(last);
			queueMicrotask(() => enabledItems[enabledItems.length - 1]?.ref.current?.focus());
		}, []);

		const typeBufferRef = React.useRef("");
		const typeTimerRef = React.useRef<number | null>(null);

		const typeahead = React.useCallback(
			(char: string) => {
				window.clearTimeout(typeTimerRef.current ?? undefined);
				typeBufferRef.current = (typeBufferRef.current + char).slice(0, 30);
				typeTimerRef.current = window.setTimeout(() => {
					typeBufferRef.current = "";
				}, 450);

				const q = typeBufferRef.current.toLowerCase();
				const enabledItems = items.current.filter((i) => !i.disabled);
				const startIdx = highlightedId ? enabledItems.findIndex((i) => i.id === highlightedId) : -1;

				const ordered = [...enabledItems.slice(startIdx + 1), ...enabledItems.slice(0, startIdx + 1)];
				const hit = ordered.find((i) => i.textValue.startsWith(q));
				if (hit) {
					setHighlightedId(hit.id);
					queueMicrotask(() => hit.ref.current?.focus());
				}
			},
			[highlightedId]
		);

		React.useEffect(() => {
			if (!open) {
				setHighlightedId(null);
				return;
			}
			const enabledItems = items.current.filter((i) => !i.disabled);
			const first = enabledItems[0]?.id ?? null;
			setHighlightedId(first);
		}, [open]);

		const setOpenWithReason = React.useCallback(
			(o: boolean) => {
				if (disabled) return;
				setOpen(o);
			},
			[disabled, setOpen]
		);

		const ctx = React.useMemo<SubCtx>(
			() => ({
				id,
				parent,
				disabled,
				open,
				setOpen: setOpenWithReason,
				triggerRef,
				popupRef,
				floating,
				getReferenceProps,
				getFloatingProps,
				items,
				registerItem,
				highlightedId,
				setHighlightedId,
				moveHighlight,
				focusHighlighted,
				focusFirst,
				focusLast,
				typeahead,
				isMounted,
				transitionStyles,
			}),
			[
				id,
				parent,
				disabled,
				open,
				setOpenWithReason,
				floating,
				getReferenceProps,
				getFloatingProps,
				highlightedId,
				moveHighlight,
				focusHighlighted,
				focusFirst,
				focusLast,
				typeahead,
				isMounted,
				transitionStyles,
			]
		);

		return <SubmenuContext.Provider value={ctx}>{children}</SubmenuContext.Provider>;
	},

	SubTrigger: function MenuSubTrigger(props: MenuSubTriggerProps) {
		const parent = useMenuCtx("Menu.SubTrigger");
		const sub = useSubmenuCtx("Menu.SubTrigger");

		const {
			disabled: disabledProp = false,
			openOnHover = true,
			openOnFocus = true,
			className,
			style,
			render,
			onPointerMove,
			onFocus,
			onKeyDown,
			onClick,
			...rest
		} = props;

		const disabled = parent.disabled || sub.disabled || disabledProp;

		const id = React.useId();
		const itemRef = React.useRef<HTMLButtonElement | null>(null);

		React.useEffect(() => {
			const rec: MenuItemRecord = {
				id,
				ref: itemRef as React.RefObject<HTMLElement | null>,
				disabled,
				textValue: makeTextValue(itemRef.current),
				kind: "item",
			};
			return parent.registerItem(rec);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [id, disabled]);

		const highlighted = parent.highlightedId === id;
		const state: MenuItemCommonState = { disabled, highlighted };

		const base: ButtonProps = sub.getReferenceProps({
			...rest,
			ref: mergeRefs(
				itemRef,
				sub.triggerRef,
				(node) => {
					if (node) sub.floating.refs.setReference(node);
				},
				(props as any).ref
			),

			role: "menuitem",
			type: (rest as any).type ?? "button",
			tabIndex: highlighted ? 0 : -1,
			"aria-haspopup": "menu",
			"aria-expanded": sub.open,
			disabled,
			onPointerMove: composeEventHandlers(onPointerMove as any, () => {
				if (disabled) return;
				parent.setHighlightedId(id);
				if (openOnHover) sub.setOpen(true, "hover");
			}),
			onFocus: composeEventHandlers(onFocus as any, () => {
				if (disabled) return;
				parent.setHighlightedId(id);
				if (openOnFocus) sub.setOpen(true, "focus");
			}),
			onKeyDown: composeEventHandlers(onKeyDown as any, (e: React.KeyboardEvent<HTMLButtonElement>) => {
				if (disabled) return;

				if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					sub.setOpen(true, "key-open");
					queueMicrotask(() => sub.focusFirst());
					return;
				}

				if (e.key === "ArrowLeft") {
					e.preventDefault();
					sub.setOpen(false, "key-close");
					queueMicrotask(() => itemRef.current?.focus());
					return;
				}

				if (e.key === "Escape") {
					e.preventDefault();
					parent.menubar.closeAll();
					queueMicrotask(() => parent.triggerRef.current?.focus());
					return;
				}

				if (e.key === "ArrowDown") {
					e.preventDefault();
					parent.moveHighlight(1);
					queueMicrotask(parent.focusHighlighted);
					return;
				}

				if (e.key === "ArrowUp") {
					e.preventDefault();
					parent.moveHighlight(-1);
					queueMicrotask(parent.focusHighlighted);
					return;
				}

				if (isPrintableKey(e.key)) parent.typeahead(e.key);
			}),
			onClick: composeEventHandlers(onClick as any, (e: React.MouseEvent<HTMLButtonElement>) => {
				if (disabled) {
					e.preventDefault();
					return;
				}
				sub.setOpen(!sub.open, "click-toggle");
			}),
			className: cx(getPropValue(className, state)),
			style: getPropValue(style, state),
		});

		const rendered = renderWith(render as any, base, state);
		return (
			rendered ?? (
				<button
					{...base}
					data-highlighted={highlighted ? "" : undefined}
					data-disabled={disabled ? "" : undefined}
					data-state={sub.open ? "open" : "closed"}
				/>
			)
		);
	},

	SubContent: function MenuSubContent(props: MenuSubContentProps) {
		const sub = useSubmenuCtx("Menu.SubContent");
		const parent = sub.parent;

		const { className, style, render, onKeyDown, children, ...rest } = props;

		// ✅ compute booleans first (no early return yet)
		const shouldRender = parent.open && (sub.open || sub.isMounted);

		// ✅ hooks must always run in the same order
		const state = React.useMemo(() => ({ open: sub.open }), [sub.open]);

		const submenuMenuCtx: MenuCtx = React.useMemo(
			() => ({
				id: sub.id,
				disabled: sub.disabled,
				open: sub.open,
				setOpen: sub.setOpen,
				floating: sub.floating,
				getReferenceProps: sub.getReferenceProps,
				getFloatingProps: sub.getFloatingProps,
				triggerRef: sub.triggerRef,
				popupRef: sub.popupRef,
				items: sub.items,
				registerItem: sub.registerItem,
				highlightedId: sub.highlightedId,
				setHighlightedId: sub.setHighlightedId,
				moveHighlight: sub.moveHighlight,
				focusHighlighted: sub.focusHighlighted,
				focusFirst: sub.focusFirst,
				focusLast: sub.focusLast,
				typeahead: sub.typeahead,
				menubar: parent.menubar,
			}),
			[sub, parent.menubar]
		);

		// ✅ now it’s safe to bail out
		if (!shouldRender) return null;
		const outer: DivProps = sub.getFloatingProps({
			...rest,
			ref: mergeRefs(sub.floating.refs.setFloating, (props as any).ref),
			style: {
				position: sub.floating.strategy,
				top: sub.floating.y ?? 0,
				left: sub.floating.x ?? 0,
				...sub.transitionStyles,
				...getPropValue(style, state),
			},
			className: cx(getPropValue(className, state)),
		});

		const inner: DivProps = {
			ref: mergeRefs(sub.popupRef),
			role: "menu",
			tabIndex: -1,
			"aria-orientation": "vertical",
			onKeyDown: composeEventHandlers(onKeyDown as any, (e: React.KeyboardEvent<HTMLDivElement>) => {
				if (e.key === "ArrowDown") {
					e.preventDefault();
					sub.moveHighlight(1);
					queueMicrotask(sub.focusHighlighted);
				} else if (e.key === "ArrowUp") {
					e.preventDefault();
					sub.moveHighlight(-1);
					queueMicrotask(sub.focusHighlighted);
				} else if (e.key === "Home") {
					e.preventDefault();
					sub.focusFirst();
				} else if (e.key === "End") {
					e.preventDefault();
					sub.focusLast();
				} else if (e.key === "ArrowLeft") {
					e.preventDefault();
					sub.setOpen(false, "key-left");
					queueMicrotask(() => sub.triggerRef.current?.focus());
				} else if (e.key === "Escape") {
					e.preventDefault();
					parent.menubar.closeAll();
					queueMicrotask(() => parent.triggerRef.current?.focus());
				} else if (e.key === "Tab") {
					if (parent.menubar.state.modal) e.preventDefault();
				} else if (isPrintableKey(e.key)) {
					sub.typeahead(e.key);
				}
			}),
		};

		const rendered = renderWith(render, outer, state);

		return (
			<FloatingPortal root={getUIPortalRoot()}>
				<MenuContext.Provider value={submenuMenuCtx}>
					<MenuTransitionContext.Provider value={{ isMounted: sub.isMounted, transitionStyles: sub.transitionStyles }}>
						{rendered ?? (
							<div {...outer} data-state={sub.open ? "open" : "closed"}>
								<div {...inner} data-state={sub.open ? "open" : "closed"}>
									{children}
								</div>
							</div>
						)}
					</MenuTransitionContext.Provider>
				</MenuContext.Provider>
			</FloatingPortal>
		);
	},
};
