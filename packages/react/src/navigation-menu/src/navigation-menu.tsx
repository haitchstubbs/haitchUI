"use client";

import * as React from "react";
import {
	FloatingFocusManager,
	FloatingPortal,
	autoUpdate,
	flip,
	offset,
	shift,
	size as fsize,
	useClick,
	useDismiss,
	useFloating,
	useInteractions,
	useRole,
	useTransitionStyles,
	type Placement,
} from "@floating-ui/react";
import { Slot } from "@/slot/src";

/* -------------------------------------------------------------------------------------------------
 * Types + utils (kept intentionally similar to your menubar file)
 * ------------------------------------------------------------------------------------------------- */

type CSSProperties = React.CSSProperties;

type NavProps = React.ComponentPropsWithRef<"nav">;
type DivProps = React.ComponentPropsWithRef<"div">;
type ButtonProps = React.ComponentPropsWithRef<"button">;
type AnchorProps = React.ComponentPropsWithRef<"a">;

type ClassNameProp<S> = string | ((state: S) => string | undefined);
type StyleProp<S> = CSSProperties | ((state: S) => CSSProperties | undefined);
type RenderProp<HP, S> = React.ReactElement | ((props: HP, state: S) => React.ReactElement);

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

let cached: HTMLElement | null = null;

export function getUIPortalRoot(): HTMLElement {
	if (typeof document === "undefined") return undefined as unknown as HTMLElement;

	// prefer an existing .ui-root always
	const uiRoot = document.querySelector<HTMLElement>(".ui-root");
	if (uiRoot) {
		cached = uiRoot;
		return uiRoot;
	}

	// only reuse cache if it was a .ui-root
	if (cached && cached !== document.body && document.contains(cached)) {
		return cached;
	}

	return document.body;
}

/* -------------------------------------------------------------------------------------------------
 * Public API types
 * ------------------------------------------------------------------------------------------------- */

type NavbarState = {
	disabled: boolean;
	orientation: "horizontal" | "vertical";
	modal: boolean;
	loopFocus: boolean;
};

export type NavbarProps = Omit<NavProps, "className" | "style" | "children"> & {
	loopFocus?: boolean;
	modal?: boolean;
	disabled?: boolean;
	orientation?: "horizontal" | "vertical";
	/** For screen readers */
	ariaLabel?: string;

	className?: ClassNameProp<NavbarState>;
	style?: StyleProp<NavbarState>;
	render?: RenderProp<NavProps, NavbarState>;
	children?: React.ReactNode;
};

type MenuState = { open: boolean; disabled: boolean; active: boolean };

export type NavMenuRootProps = Omit<DivProps, "className" | "style" | "children"> & {
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

export type NavTriggerProps = Omit<ButtonProps, "className" | "style"> & {
	asChild?: boolean;
	className?: ClassNameProp<{ open: boolean; disabled: boolean; active: boolean }>;
	style?: StyleProp<{ open: boolean; disabled: boolean; active: boolean }>;
	render?: RenderProp<ButtonProps, { open: boolean; disabled: boolean; active: boolean }>;
	children?: React.ReactNode;
};

export type NavItemProps = Omit<AnchorProps, "className" | "style"> & {
	disabled?: boolean;
	asChild?: boolean;
	className?: ClassNameProp<{ disabled: boolean; active: boolean }>;
	style?: StyleProp<{ disabled: boolean; active: boolean }>;
	render?: RenderProp<AnchorProps, { disabled: boolean; active: boolean }>;
};

export type NavPortalProps = { children?: React.ReactNode };

export type NavPositionerProps = Omit<DivProps, "className" | "style"> & {
	className?: ClassNameProp<{ open: boolean }>;
	style?: StyleProp<{ open: boolean }>;
	render?: RenderProp<DivProps, { open: boolean }>;
	children?: React.ReactNode;
};

export type NavContentProps = Omit<DivProps, "className" | "style" | "children"> & {
	className?: ClassNameProp<{ open: boolean }>;
	style?: StyleProp<{ open: boolean }>;
	render?: RenderProp<DivProps, { open: boolean }>;
	children?: React.ReactNode;
};

type DropdownItemState = { disabled: boolean; highlighted: boolean };

export type NavLinkProps = Omit<AnchorProps, "className" | "style"> & {
	asChild?: boolean;
	disabled?: boolean;
	closeOnSelect?: boolean;
	className?: ClassNameProp<DropdownItemState>;
	style?: StyleProp<DropdownItemState>;
	render?: RenderProp<AnchorProps, DropdownItemState>;
};

export type NavSeparatorProps = Omit<DivProps, "className" | "style"> & {
	className?: ClassNameProp<{}>;
	style?: StyleProp<{}>;
	render?: RenderProp<DivProps, {}>;
	asChild?: boolean;
};

export type NavGroupProps = Omit<DivProps, "className" | "style" | "children"> & {
	className?: ClassNameProp<{}>;
	style?: StyleProp<{}>;
	render?: RenderProp<DivProps, {}>;
	children?: React.ReactNode;
	asChild?: boolean;
};

export type NavGroupLabelProps = Omit<DivProps, "className" | "style"> & {
	className?: ClassNameProp<{}>;
	style?: StyleProp<{}>;
	render?: RenderProp<DivProps, {}>;
	asChild?: boolean;
};

/* -------------------------------------------------------------------------------------------------
 * Navbar context (top-level roving focus + "active" dropdown)
 * ------------------------------------------------------------------------------------------------- */

type TopLevelRegistration = {
	id: string;
	ref: React.RefObject<HTMLElement | null>;
	isDisabled: () => boolean;
	isDropdown: () => boolean;
	setOpenFromNavbar?: (open: boolean) => void;
	getOpen?: () => boolean;
};

type NavbarCtx = {
	state: NavbarState;
	registerTopLevel: (reg: TopLevelRegistration) => () => void;
	items: () => TopLevelRegistration[];
	activeId: string | null;
	setActiveId: (id: string | null) => void;
	closeAll: () => void;
	focusByDelta: (delta: number) => void;
	focusById: (id: string) => void;
	disabled?: boolean;
};

const NavbarContext = React.createContext<NavbarCtx | null>(null);
function useNavbarCtx(name: string) {
	const ctx = React.useContext(NavbarContext);
	if (!ctx) throw new Error(`${name} must be used within <Navbar>.`);
	return ctx;
}

/* -------------------------------------------------------------------------------------------------
 * Dropdown menu context (for the links panel)
 * ------------------------------------------------------------------------------------------------- */

type DropdownItemRecord = {
	id: string;
	ref: React.RefObject<HTMLElement | null>;
	disabled: boolean;
	textValue: string;
};

type DropdownTransitionCtx = { isMounted: boolean; transitionStyles: React.CSSProperties };

type DropdownCtx = {
	id: string;
	disabled: boolean;
	open: boolean;
	setOpen: (open: boolean, reason?: string) => void;

	floating: ReturnType<typeof useFloating>;
	getReferenceProps: ReturnType<typeof useInteractions>["getReferenceProps"];
	getFloatingProps: ReturnType<typeof useInteractions>["getFloatingProps"];

	triggerRef: React.RefObject<HTMLButtonElement | null>;
	contentRef: React.RefObject<HTMLDivElement | null>;

	items: React.MutableRefObject<DropdownItemRecord[]>;
	registerItem: (rec: DropdownItemRecord) => () => void;
	highlightedId: string | null;
	setHighlightedId: (id: string | null) => void;
	moveHighlight: (dir: 1 | -1, wrap?: boolean) => void;
	focusHighlighted: () => void;
	focusFirst: () => void;
	focusLast: () => void;
	typeahead: (char: string) => void;

	navbar: NavbarCtx;
};

const DropdownContext = React.createContext<DropdownCtx | null>(null);
function useDropdownCtx(name: string) {
	const ctx = React.useContext(DropdownContext);
	if (!ctx) throw new Error(`${name} must be used within <NavMenu.Root>.`);
	return ctx;
}

function useOptionalDropdownCtx() {
	return React.useContext(DropdownContext); // DropdownCtx | null
}

const DropdownTransitionContext = React.createContext<DropdownTransitionCtx | null>(null);
function useDropdownTransition() {
	return React.useContext(DropdownTransitionContext) ?? { isMounted: false, transitionStyles: {} };
}

/* -------------------------------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------------------------------- */

function nextEnabledId(items: DropdownItemRecord[], currentId: string | null, dir: 1 | -1, wrap: boolean) {
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
 * Navbar root
 * ------------------------------------------------------------------------------------------------- */

export function Navbar(props: NavbarProps) {
	const {
		loopFocus = true,
		modal = true,
		disabled = false,
		orientation = "horizontal",
		ariaLabel = "Primary navigation",
		className,
		style,
		render,
		children,
		onKeyDown,
		...rest
	} = props;

	const state = React.useMemo<NavbarState>(() => ({ disabled, orientation, modal, loopFocus }), [disabled, orientation, modal, loopFocus]);

	const regsRef = React.useRef<TopLevelRegistration[]>([]);
	const [activeId, setActiveId] = React.useState<string | null>(null);

	const registerTopLevel = React.useCallback((reg: TopLevelRegistration) => {
		regsRef.current = [...regsRef.current, reg];
		return () => {
			regsRef.current = regsRef.current.filter((r) => r.id !== reg.id);
		};
	}, []);

	const items = React.useCallback(() => regsRef.current, []);

	const closeAll = React.useCallback(() => {
		for (const it of regsRef.current) it.setOpenFromNavbar?.(false);
		setActiveId(null);
	}, []);

	const focusById = React.useCallback((id: string) => {
		const it = regsRef.current.find((r) => r.id === id);
		it?.ref.current?.focus();
	}, []);

	const focusByDelta = React.useCallback(
		(delta: number) => {
			const list = regsRef.current.filter((r) => !r.isDisabled());
			if (!list.length) return;

			const focused = document.activeElement;
			const idx = list.findIndex((r) => r.ref.current === focused);
			const start = idx >= 0 ? idx : 0;

			let next = start + delta;
			if (state.loopFocus) next = (next + list.length) % list.length;
			else next = Math.max(0, Math.min(list.length - 1, next));

			list[next]?.ref.current?.focus();
		},
		[state.loopFocus]
	);

	const ctx = React.useMemo<NavbarCtx>(
		() => ({
			state,
			registerTopLevel,
			items,
			activeId,
			setActiveId,
			closeAll,
			focusByDelta,
			focusById,
		}),
		[state, registerTopLevel, items, activeId, closeAll, focusByDelta, focusById]
	);

	const horizontal = orientation === "horizontal";
	const prevKey = horizontal ? "ArrowLeft" : "ArrowUp";
	const nextKey = horizontal ? "ArrowRight" : "ArrowDown";

	const baseProps: NavProps = {
		...rest,
		role: "navigation",
		"aria-label": ariaLabel,
		onKeyDown: composeEventHandlers(onKeyDown as any, (e: React.KeyboardEvent<HTMLElement>) => {
			if (state.disabled) return;

			if (e.key === prevKey) {
				e.preventDefault();
				ctx.focusByDelta(-1);
			} else if (e.key === nextKey) {
				e.preventDefault();
				ctx.focusByDelta(1);
			} else if (e.key === "Escape") {
				ctx.closeAll();
			}
		}),
		className: cx(getPropValue(className, state)),
		style: getPropValue(style, state),
	};

	const rendered = renderWith(render, baseProps, state);

	return <NavbarContext.Provider value={ctx}>{rendered ?? <nav {...baseProps}>{children}</nav>}</NavbarContext.Provider>;
}

/* -------------------------------------------------------------------------------------------------
 * Top-level: plain link item (no dropdown)
 * ------------------------------------------------------------------------------------------------- */

export function NavItem(props: NavItemProps) {
	const navbar = useNavbarCtx("NavItem");

	const { disabled: disabledProp = false, className, style, render, onClick, onPointerEnter, onPointerMove, ...rest } = props;

	const id = React.useId();
	const ref = React.useRef<HTMLAnchorElement | null>(null);

	const disabled = navbar.state.disabled || disabledProp;
	const state = { disabled, active: navbar.activeId === id };

	React.useEffect(() => {
		return navbar.registerTopLevel({
			id,
			ref: ref as React.RefObject<HTMLElement | null>,
			isDisabled: () => disabled,
			isDropdown: () => false,
		});
	}, [navbar, id, disabled]);

	const base: AnchorProps = {
		...rest,
		ref: mergeRefs(ref, (props as any).ref),
		"aria-disabled": disabled ? true : undefined,
		tabIndex: !navbar.activeId ? 0 : state.active ? 0 : -1,
		onClick: composeEventHandlers(onClick as any, (e: React.MouseEvent<HTMLAnchorElement>) => {
			if (disabled) {
				e.preventDefault();
				return;
			}
			navbar.closeAll();
		}),
		onPointerEnter: composeEventHandlers(onPointerEnter as any, () => {
			if (disabled) return;
			// Hover switches active when a dropdown is already active
			if (navbar.activeId) navbar.setActiveId(id);
		}),
		onPointerMove: composeEventHandlers(onPointerMove as any, () => {
			if (disabled) return;
			if (navbar.activeId) navbar.setActiveId(id);
		}),
		className: cx(getPropValue(className, state)),
		style: getPropValue(style, state),
	};

	const rendered = renderWith(render as any, base, state);
	return rendered ?? <a {...base} data-disabled={disabled ? "" : undefined} />;
}

/* -------------------------------------------------------------------------------------------------
 * Dropdown menu primitives (NavMenu.*)
 * ------------------------------------------------------------------------------------------------- */

export const NavMenu = {
	Root: function NavMenuRoot(props: NavMenuRootProps) {
		const navbar = useNavbarCtx("NavMenu.Root");

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
		const contentRef = React.useRef<HTMLDivElement | null>(null);

		const disabled = navbar.state.disabled || disabledProp;

		const [open, setOpen] = useControllableState<boolean>({
			value: openProp,
			defaultValue: defaultOpen ?? false,
			onChange: onOpenChange,
		});

		const floating = useFloating({
			open,
			onOpenChange: (o) => setOpenWithReason(o),
			placement,
			whileElementsMounted: autoUpdate,
			middleware: [
				offset(8),
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

		const role = useRole(context, { role: "menu" });
		const dismiss = useDismiss(context, { enabled: true, escapeKey: true, outsidePressEvent: "mousedown" });
		const { getReferenceProps, getFloatingProps } = useInteractions([role, dismiss]);

		const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
			duration: { open: 130, close: 90 },
			initial: { opacity: 0, transform: "scale(0.98)" },
			open: { opacity: 1, transform: "scale(1)" },
			close: { opacity: 0, transform: "scale(0.98)" },
		});

		// Dropdown items + keyboard highlight
		const items = React.useRef<DropdownItemRecord[]>([]);
		const [highlightedId, setHighlightedId] = React.useState<string | null>(null);

		const registerItem = React.useCallback((rec: DropdownItemRecord) => {
			items.current = [...items.current.filter((i) => i.id !== rec.id), rec];
			return () => {
				items.current = items.current.filter((i) => i.id !== rec.id);
			};
		}, []);

		const moveHighlight = React.useCallback(
			(dir: 1 | -1, wrap?: boolean) => {
				const shouldWrap = wrap ?? navbar.state.loopFocus;
				const next = nextEnabledId(items.current, highlightedId, dir, shouldWrap);
				setHighlightedId(next);
			},
			[highlightedId, navbar.state.loopFocus]
		);

		const focusHighlighted = React.useCallback(() => {
			const item = items.current.find((i) => i.id === highlightedId);
			item?.ref.current?.focus();
		}, [highlightedId]);

		const focusFirst = React.useCallback(() => {
			const enabled = items.current.filter((i) => !i.disabled);
			const first = enabled[0]?.id ?? null;
			setHighlightedId(first);
			queueMicrotask(() => enabled[0]?.ref.current?.focus());
		}, []);

		const focusLast = React.useCallback(() => {
			const enabled = items.current.filter((i) => !i.disabled);
			const last = enabled[enabled.length - 1]?.id ?? null;
			setHighlightedId(last);
			queueMicrotask(() => enabled[enabled.length - 1]?.ref.current?.focus());
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
				const enabled = items.current.filter((i) => !i.disabled);
				const startIdx = highlightedId ? enabled.findIndex((i) => i.id === highlightedId) : -1;
				const ordered = [...enabled.slice(startIdx + 1), ...enabled.slice(0, startIdx + 1)];
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
			const enabled = items.current.filter((i) => !i.disabled);
			const first = enabled[0]?.id ?? null;
			setHighlightedId(first);
			queueMicrotask(() => enabled[0]?.ref.current?.focus());
		}, [open]);

		const setOpenWithReason = React.useCallback(
			(o: boolean) => {
				if (disabled) return;
				setOpen(o);
				if (o) navbar.setActiveId(id);
				if (!o && navbar.activeId === id) navbar.setActiveId(null);
			},
			[disabled, setOpen, navbar, id]
		);

		React.useEffect(() => {
			return navbar.registerTopLevel({
				id,
				ref: triggerRef as React.RefObject<HTMLElement | null>,
				isDisabled: () => disabled,
				isDropdown: () => true,
				setOpenFromNavbar: (o) => setOpen(o),
				getOpen: () => open,
			});
		}, [navbar, id, open, disabled, setOpen]);

		React.useEffect(() => {
			if (!open) return;
			if (navbar.activeId && navbar.activeId !== id) setOpen(false);
		}, [navbar.activeId, open, id, setOpen]);

		const rootState: MenuState = { open, disabled, active: navbar.activeId === id };

		const ctx: DropdownCtx = React.useMemo(
			() => ({
				id,
				disabled,
				open,
				setOpen: setOpenWithReason,
				floating,
				getReferenceProps,
				getFloatingProps,
				triggerRef,
				contentRef,
				items,
				registerItem,
				highlightedId,
				setHighlightedId,
				moveHighlight,
				focusHighlighted,
				focusFirst,
				focusLast,
				typeahead,
				navbar,
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
				navbar,
			]
		);

		const baseProps: DivProps = {
			...rest,
			className: cx(getPropValue(className, rootState)),
			style: getPropValue(style, rootState),
		};

		const rendered = renderWith(render, baseProps, rootState);

		return (
			<DropdownContext.Provider value={ctx}>
				<DropdownTransitionContext.Provider value={{ isMounted, transitionStyles }}>
					{rendered ?? (
						<div {...baseProps} data-state={open ? "open" : "closed"} data-disabled={disabled ? "" : undefined}>
							{children}
						</div>
					)}
				</DropdownTransitionContext.Provider>
			</DropdownContext.Provider>
		);
	},

	Trigger: function NavTrigger(props: NavTriggerProps) {
		const menu = useDropdownCtx("NavMenu.Trigger");

		const {
			asChild,
			children,
			className,
			style,
			render,
			disabled: disabledProp,
			onKeyDown,
			onPointerDown,
			onPointerEnter,
			onPointerMove,
			...rest
		} = props;

		const disabled = menu.disabled || !!disabledProp;
		const state = { open: menu.open, disabled, active: menu.navbar.activeId === menu.id };

		const Comp: any = asChild ? Slot : "button";
		const base = menu.getReferenceProps({
			...rest,
			ref: mergeRefs(
				menu.triggerRef,
				(node) => {
					if (node !== null) menu.floating.refs.setReference(node);
				},
				(props as any).ref
			),
			type: (rest as any).type ?? "button",
			"aria-haspopup": "menu",
			"aria-expanded": menu.open,
			disabled,
			tabIndex: state.active || !menu.navbar.activeId ? 0 : -1,

			onPointerDown: composeEventHandlers(onPointerDown as any, (e: React.PointerEvent<any>) => {
				if (disabled) return;

				// If you ever use <a> as the trigger, this prevents navigation so the menu can open.
				if ((e.currentTarget as HTMLElement).tagName === "A") e.preventDefault();

				menu.navbar.setActiveId(menu.id);
				menu.setOpen(!menu.open, "trigger-pointer");
			}),
			onPointerEnter: composeEventHandlers(onPointerEnter as any, () => {
				if (disabled) return;
				// Hover switches when another dropdown is already active.
				if (menu.navbar.activeId && menu.navbar.activeId !== menu.id) {
					menu.navbar.setActiveId(menu.id);
					menu.setOpen(true, "navbar-hover");
				}
			}),

			onPointerMove: composeEventHandlers(onPointerMove as any, () => {
				if (disabled) return;
				if (menu.navbar.activeId && menu.navbar.activeId !== menu.id) {
					menu.navbar.setActiveId(menu.id);
					menu.setOpen(true, "navbar-hover");
				}
			}),

			onKeyDown: composeEventHandlers(onKeyDown as any, (e: React.KeyboardEvent<HTMLButtonElement>) => {
				if (disabled) return;

				if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					menu.setOpen(true, "trigger-key");
					return;
				}

				const horizontal = menu.navbar.state.orientation === "horizontal";
				const prevKey = horizontal ? "ArrowLeft" : "ArrowUp";
				const nextKey = horizontal ? "ArrowRight" : "ArrowDown";

				if (e.key === prevKey) {
					e.preventDefault();
					menu.navbar.focusByDelta(-1);
				} else if (e.key === nextKey) {
					e.preventDefault();
					menu.navbar.focusByDelta(1);
				} else if (e.key === "Escape") {
					menu.navbar.closeAll();
				}
			}),

			className: cx(getPropValue(className as any, state)),
			style: getPropValue(style as any, state),
		});

		const rendered = renderWith(render as any, base, state);
		if (rendered) return rendered;

		return (
			<Comp
				{...base}
				data-state={state.open ? "open" : "closed"}
				data-active={state.active ? "" : undefined}
				// IMPORTANT: Slot needs a single element child
			>
				{children}
			</Comp>
		);
	},

	Portal: function NavPortal({ children }: NavPortalProps) {
		const menu = useDropdownCtx("NavMenu.Portal");
		const t = useDropdownTransition();
		if (!menu.open && !t.isMounted) return null;
		return <FloatingPortal root={getUIPortalRoot()}>{children}</FloatingPortal>;
	},

	Positioner: function NavPositioner(props: NavPositionerProps) {
		const menu = useDropdownCtx("NavMenu.Positioner");
		const t = useDropdownTransition();
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

	Content: function NavContent(props: NavContentProps) {
		const menu = useDropdownCtx("NavMenu.Content");
		const { className, style, render, onKeyDown, children, ...rest } = props;

		if (!menu.open) return null;

		const state = { open: menu.open };

		const base: DivProps = {
			...rest,
			ref: mergeRefs(menu.contentRef, (props as any).ref),
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
					menu.navbar.closeAll();
					queueMicrotask(() => menu.triggerRef.current?.focus());
				} else if (e.key === "Tab") {
					if (menu.navbar.state.modal) e.preventDefault();
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

		// Optional focus trap for "modal" nav dropdowns
		return menu.navbar.state.modal ? (
			<FloatingFocusManager context={menu.floating.context} modal={true} initialFocus={-1} returnFocus={false}>
				{content}
			</FloatingFocusManager>
		) : (
			content
		);
	},

	Link: function NavLink(props: NavLinkProps) {
		const menu = useOptionalDropdownCtx(); // <-- key change (dropdown when available)
		const navbar = useNavbarCtx("NavMenu.Link");

		const {
			asChild,
			disabled: disabledProp = false,
			closeOnSelect = true,
			className,
			style,
			render,
			onPointerEnter,
			onPointerMove,
			onFocus,
			onClick,
			children,
			...rest
		} = props;

		const id = React.useId();
		const ref = React.useRef<HTMLElement | null>(null);

		// -----------------------------
		// DROPDOWN ITEM MODE
		// -----------------------------
		if (menu) {
			const disabled = menu.disabled || disabledProp;
			const highlighted = menu.highlightedId === id;
			const state: DropdownItemState = { disabled, highlighted };

			React.useEffect(() => {
				const rec: DropdownItemRecord = {
					id,
					ref,
					disabled,
					textValue: makeTextValue(ref.current),
				};
				return menu.registerItem(rec);
				// eslint-disable-next-line react-hooks/exhaustive-deps
			}, [id, disabled]);

			const Comp: any = asChild ? Slot : "a";

			const base: AnchorProps = {
				...rest,
				ref: mergeRefs(ref as any, (props as any).ref),
				role: "menuitem",
				"aria-disabled": disabled ? true : undefined,
				tabIndex: highlighted ? 0 : -1,

				onClick: composeEventHandlers(onClick as any, (e: React.MouseEvent<any>) => {
					if (disabled) {
						e.preventDefault();
						return;
					}
					if (closeOnSelect) menu.navbar.closeAll();
				}),

				onPointerEnter: composeEventHandlers(onPointerEnter as any, () => {
					if (disabled) return;
					menu.setHighlightedId(id);
				}),
				onPointerMove: composeEventHandlers(onPointerMove as any, () => {
					if (disabled) return;
					menu.setHighlightedId(id);
				}),
				onFocus: composeEventHandlers(onFocus as any, () => {
					if (disabled) return;
					menu.setHighlightedId(id);
				}),

				className: getPropValue(className, state),
				style: getPropValue(style, state),
			};

			const rendered = renderWith(render as any, base, state);
			if (rendered) return rendered;

			return (
				<Comp {...base} data-disabled={disabled ? "" : undefined} data-highlighted={highlighted ? "" : undefined}>
					{children}
				</Comp>
			);
		}

		// -----------------------------
		// TOP-LEVEL MODE
		// -----------------------------
		const disabled = navbar.disabled || disabledProp;
		const state: DropdownItemState = { disabled, highlighted: false };

		React.useEffect(() => {
			return navbar.registerTopLevel({
				id,
				ref: ref as React.RefObject<HTMLElement | null>,
				isDisabled: () => disabled,
				isDropdown: () => false,
			});
		}, [navbar, id, disabled]);

		const Comp: any = asChild ? Slot : "a";

		const base: AnchorProps = {
			...rest,
			ref: mergeRefs(ref as any, (props as any).ref),
			"aria-disabled": disabled ? true : undefined,
			tabIndex: !navbar.activeId ? 0 : navbar.activeId === id ? 0 : -1,

			onClick: composeEventHandlers(onClick as any, (e: React.MouseEvent<any>) => {
				if (disabled) {
					e.preventDefault();
					return;
				}
				navbar.closeAll();
			}),
			onPointerEnter: composeEventHandlers(onPointerEnter as any, () => {
				if (disabled) return;
				if (navbar.activeId) navbar.setActiveId(id);
			}),
			onPointerMove: composeEventHandlers(onPointerMove as any, () => {
				if (disabled) return;
				if (navbar.activeId) navbar.setActiveId(id);
			}),

			className: getPropValue(className, state),
			style: getPropValue(style, state),
		};

		const rendered = renderWith(render as any, base, state);
		if (rendered) return rendered;

		return (
			<Comp {...base} data-disabled={disabled ? "" : undefined}>
				{children}
			</Comp>
		);
	},

	Separator: function NavSeparator(props: NavSeparatorProps) {
		const { children, asChild, className, style, render, ...rest } = props;
		const Comp: any = asChild ? Slot : "div";
		const state = {};
		const base: DivProps = {
			...rest,
			role: "separator",
			"aria-orientation": "horizontal",
			className: cx(getPropValue(className, state)),
			style: getPropValue(style, state),
		};
		const rendered = renderWith(render, base, state);
		return rendered ?? <Comp {...base} />;
	},

	Group: function NavGroup(props: NavGroupProps) {
		const { children, asChild, className, style, render, ...rest } = props;
		const Comp: any = asChild ? Slot : "div";
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

	GroupLabel: function NavGroupLabel(props: NavGroupLabelProps) {
		const { children, asChild, className, style, render, ...rest } = props;
		const Comp: any = asChild ? Slot : "div";
		const state = {};
		const base: DivProps = {
			...rest,
			role: "presentation",
			className: cx(getPropValue(className, state)),
			style: getPropValue(style, state),
		};
		const rendered = renderWith(render, base, state);
		return rendered ?? <Comp {...base}>{children}</Comp>;
	},
} as const;

/* -------------------------------------------------------------------------------------------------
 * Example usage (remove if you don’t want it shipped)
 * -------------------------------------------------------------------------------------------------

<Navbar
	className={() => "flex items-center gap-6"}
>
	<NavItem href="/" className={() => "text-sm"}>Home</NavItem>

	<NavMenu.Root>
		<NavMenu.Trigger className={({ open }) => open ? "text-sm font-semibold" : "text-sm"}>
			Products
		</NavMenu.Trigger>

		<NavMenu.Portal>
			<NavMenu.Positioner className={() => "z-50"}>
				<NavMenu.Content className={() => "rounded-lg border bg-popover p-2 shadow-md"}>
					<NavMenu.Link href="/products/a" className={({ highlighted }) => highlighted ? "bg-accent px-3 py-2" : "px-3 py-2"}>
						Product A
					</NavMenu.Link>
					<NavMenu.Link href="/products/b">Product B</NavMenu.Link>
					<NavMenu.Separator className={() => "my-2 h-px bg-border"} />
					<NavMenu.Link href="/pricing">Pricing</NavMenu.Link>
				</NavMenu.Content>
			</NavMenu.Positioner>
		</NavMenu.Portal>
	</NavMenu.Root>

	<NavItem href="/about">About</NavItem>
</Navbar>

------------------------------------------------------------------------------------------------- */
