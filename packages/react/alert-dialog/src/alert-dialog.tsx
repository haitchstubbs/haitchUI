"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";

import { Slot } from "@haitch-ui/react-slot";
import { composeRefs } from "@haitch-ui/react-compose-refs";
import { useOverlayDOMManager, type OverlayDOM } from "@haitch/react-overlay";

type AlertDialogContextValue = {
	open: boolean;
	setOpen: (next: boolean) => void;

	disabled: boolean;

	titleId: string;
	descriptionId: string;
	contentId: string;

	triggerRef: React.RefObject<HTMLElement | null>;
	contentRef: React.RefObject<HTMLDivElement | null>;
	cancelRef: React.RefObject<HTMLElement | null>;
	lastActiveElementRef: React.RefObject<HTMLElement | null>;

	portalRoot: HTMLElement | null;
	dom: OverlayDOM;

	isMounted: boolean;
	transitionStyles: React.CSSProperties;
};

const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(null);

function useAlertDialogContext(componentName: string): AlertDialogContextValue {
	const ctx = React.useContext(AlertDialogContext);
	if (!ctx) throw new Error(`${componentName} must be used within <AlertDialog.Root>.`);
	return ctx;
}

function useControllableOpen(opts: {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	disabled: boolean;
}) {
	const [uncontrolled, setUncontrolled] = React.useState<boolean>(opts.defaultOpen ?? false);
	const controlled = typeof opts.open === "boolean";
	const open = controlled ? (opts.open as boolean) : uncontrolled;

	const setOpen = React.useCallback(
		(next: boolean) => {
			if (opts.disabled) return;
			if (!controlled) setUncontrolled(next);
			opts.onOpenChange?.(next);
		},
		[controlled, opts.disabled, opts.onOpenChange]
	);

	return { open, setOpen };
}

function getFocusableWithin(root: HTMLElement): HTMLElement[] {
	const candidates = root.querySelectorAll<HTMLElement>(
		[
			'button:not([disabled])',
			'[href]',
			'input:not([disabled])',
			'select:not([disabled])',
			'textarea:not([disabled])',
			'[tabindex]:not([tabindex="-1"])',
		].join(",")
	);

	return Array.from(candidates).filter((el) => {
		if (el.hasAttribute("disabled")) return false;
		if (el.getAttribute("aria-hidden") === "true") return false;
		if ((el as any).hidden) return false;
		return true;
	});
}

function usePresence(open: boolean, durations?: { open?: number; close?: number }) {
	const openMs = durations?.open ?? 120;
	const closeMs = durations?.close ?? 100;

	const [isMounted, setIsMounted] = React.useState(open);
	const [styles, setStyles] = React.useState<React.CSSProperties>(() => ({
		opacity: open ? 1 : 0,
		transform: open ? "scale(1)" : "scale(0.95)",
	}));

	const rafRef = React.useRef<number | null>(null);
	const tRef = React.useRef<number | null>(null);

	const clearTimers = React.useCallback(() => {
		if (rafRef.current != null) {
			cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
		}
		if (tRef.current != null) {
			window.clearTimeout(tRef.current);
			tRef.current = null;
		}
	}, []);

	React.useEffect(() => {
		clearTimers();

		if (open) {
			setIsMounted(true);
			setStyles({ opacity: 0, transform: "scale(0.95)" });

			rafRef.current = requestAnimationFrame(() => {
				setStyles({
					opacity: 1,
					transform: "scale(1)",
					transition: `opacity ${openMs}ms ease, transform ${openMs}ms ease`,
				});
			});

			return () => clearTimers();
		}

		setStyles({
			opacity: 0,
			transform: "scale(0.95)",
			transition: `opacity ${closeMs}ms ease, transform ${closeMs}ms ease`,
		});

		tRef.current = window.setTimeout(() => setIsMounted(false), closeMs);
		return () => clearTimers();
	}, [open, openMs, closeMs, clearTimers]);

	return { isMounted, styles };
}

/* -------------------------------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------------------------------- */

export type AlertDialogRootProps = {
	dom?: OverlayDOM;

	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;

	disabled?: boolean;

	children: React.ReactNode;
};

function Root({
	dom: domOverride,
	open: controlledOpen,
	defaultOpen,
	onOpenChange,
	disabled = false,
	children,
}: AlertDialogRootProps) {
	const parentManager = useOverlayDOMManager();
	const manager = React.useMemo(() => parentManager.fork(domOverride), [parentManager, domOverride]);
	const dom = manager.dom;

	const { open, setOpen } = useControllableOpen({
		open: controlledOpen,
		defaultOpen,
		onOpenChange,
		disabled,
	});

	const triggerRef = React.useRef<HTMLElement | null>(null);
	const contentRef = React.useRef<HTMLDivElement | null>(null);
	const cancelRef = React.useRef<HTMLElement | null>(null);
	const lastActiveElementRef = React.useRef<HTMLElement | null>(null);

	const titleId = React.useId();
	const descriptionId = React.useId();
	const contentId = React.useId();

	const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(null);

	React.useEffect(() => {
		setPortalRoot(dom.getPortalContainer());
	}, [dom]);

	const { isMounted, styles: transitionStyles } = usePresence(open, { open: 120, close: 100 });

	// Track last active element before opening; restore focus on close.
	React.useEffect(() => {
		if (typeof document === "undefined") return;

		if (open) {
			const active = document.activeElement as HTMLElement | null;
			if (active && active !== document.body && active !== document.documentElement) {
				lastActiveElementRef.current = active;
			}
		} else {
			queueMicrotask(() => {
				(triggerRef.current ?? lastActiveElementRef.current)?.focus?.();
			});
		}
	}, [open]);

	// Scroll lock when open (AlertDialog is always modal)
	React.useEffect(() => {
		if (typeof document === "undefined") return;
		if (!open) return;

		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prevOverflow;
		};
	}, [open]);

	// Escape to close (Radix-like)
	React.useEffect(() => {
		if (typeof document === "undefined") return;
		if (!open) return;
		if (disabled) return;

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key !== "Escape") return;
			e.stopPropagation();
			setOpen(false);
		};

		document.addEventListener("keydown", onKeyDown, { capture: true });
		return () => document.removeEventListener("keydown", onKeyDown, { capture: true } as any);
	}, [open, disabled, setOpen]);

	// Focus management (always trap; initial focus prefers Cancel)
	React.useEffect(() => {
		if (typeof document === "undefined") return;
		if (!open) return;

		const node = contentRef.current;
		if (!node) return;

		queueMicrotask(() => {
			const preferred = cancelRef.current;
			if (preferred) {
				preferred.focus?.();
				return;
			}

			const focusables = getFocusableWithin(node);
			(focusables[0] ?? node).focus?.();
		});

		const onFocusIn = (event: FocusEvent) => {
			const contentEl = contentRef.current;
			if (!contentEl) return;

			const target = event.target as Node | null;
			if (!target) return;

			if (contentEl.contains(target)) return;

			// Always trap focus inside for AlertDialog
			const preferred = cancelRef.current;
			if (preferred) {
				preferred.focus?.();
				return;
			}

			const focusables = getFocusableWithin(contentEl);
			(focusables[0] ?? contentEl).focus?.();
		};

		document.addEventListener("focusin", onFocusIn, { capture: true });
		return () => document.removeEventListener("focusin", onFocusIn, { capture: true } as any);
	}, [open]);

	const value = React.useMemo<AlertDialogContextValue>(
		() => ({
			open,
			setOpen,

			disabled,

			titleId,
			descriptionId,
			contentId,

			triggerRef,
			contentRef,
			cancelRef,
			lastActiveElementRef,

			portalRoot,
			dom,

			isMounted,
			transitionStyles,
		}),
		[
			open,
			setOpen,
			disabled,
			titleId,
			descriptionId,
			contentId,
			portalRoot,
			dom,
			isMounted,
			transitionStyles,
		]
	);

	return (
		<AlertDialogContext.Provider value={value}>
			<div data-slot="alert-dialog">{children}</div>
		</AlertDialogContext.Provider>
	);
}

/* -------------------------------------------------------------------------------------------------
 * Trigger
 * ------------------------------------------------------------------------------------------------- */

export type AlertDialogTriggerProps = React.HTMLAttributes<HTMLElement> & {
	asChild?: boolean;
};

const Trigger = React.forwardRef<HTMLElement, AlertDialogTriggerProps>(function Trigger(
	{ asChild, onClick, children, ...props },
	forwardedRef
) {
	const { open, setOpen, contentId, triggerRef, disabled } =
		useAlertDialogContext("AlertDialog.Trigger");

	const handleClick = (e: React.MouseEvent<HTMLElement>) => {
		onClick?.(e);
		if (e.defaultPrevented) return;

		if (e.currentTarget instanceof HTMLButtonElement && e.currentTarget.type === "submit") {
			e.preventDefault();
		}

		setOpen(true);
	};

	const triggerProps: React.HTMLAttributes<HTMLElement> & Record<string, unknown> = {
		...props,
		"data-slot": "alert-dialog-trigger",
		"data-state": open ? "open" : "closed",
		"aria-haspopup": "dialog",
		"aria-expanded": open,
		"aria-controls": contentId,
		"aria-disabled": disabled ? "true" : undefined,
		onClick: disabled ? undefined : handleClick,
		ref: composeRefs(forwardedRef, (node: HTMLElement | null) => {
			triggerRef.current = node;
		}),
	};

	if (asChild) return <Slot {...triggerProps}>{children}</Slot>;

	return (
		<button
			{...(triggerProps as Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "ref">)}
			ref={triggerProps.ref as React.Ref<HTMLButtonElement>}
			type="button"
		>
			{children}
		</button>
	);
});

/* -------------------------------------------------------------------------------------------------
 * Portal
 * ------------------------------------------------------------------------------------------------- */

export type AlertDialogPortalProps = {
	container?: Element | null;
	children: React.ReactNode;
};

function Portal({ container, children }: AlertDialogPortalProps) {
	const { portalRoot } = useAlertDialogContext("AlertDialog.Portal");
	if (typeof document === "undefined") return null;

	const target = (container ?? portalRoot) ?? document.body;
	return ReactDOM.createPortal(<div data-slot="alert-dialog-portal">{children}</div>, target);
}

/* -------------------------------------------------------------------------------------------------
 * Overlay
 * ------------------------------------------------------------------------------------------------- */

export type AlertDialogOverlayProps = React.ComponentPropsWithoutRef<"div">;

const Overlay = React.forwardRef<HTMLDivElement, AlertDialogOverlayProps>(function Overlay(
	{ style, ...props },
	forwardedRef
) {
	const { open, isMounted, transitionStyles } = useAlertDialogContext("AlertDialog.Overlay");

	if (!isMounted) return null;

	return (
		<div
			data-slot="alert-dialog-overlay"
			data-state={open ? "open" : "closed"}
			{...props}
			ref={forwardedRef}
			style={{
				opacity: open ? 1 : 0,
				transition: transitionStyles.transition,
				...style,
			}}
		/>
	);
});

/* -------------------------------------------------------------------------------------------------
 * Content
 * ------------------------------------------------------------------------------------------------- */

export type AlertDialogContentProps = Omit<React.ComponentPropsWithoutRef<"div">, "role"> & {
	forceMount?: boolean;
	container?: Element | null;
};

const Content = React.forwardRef<HTMLDivElement, AlertDialogContentProps>(function Content(
	{ children, forceMount = false, container, style, onKeyDown, ...props },
	forwardedRef
) {
	const {
		open,
		setOpen,
		contentId,
		titleId,
		descriptionId,
		contentRef,
		disabled,
		isMounted,
		transitionStyles,
	} = useAlertDialogContext("AlertDialog.Content");

	const mounted = forceMount || isMounted;

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		onKeyDown?.(e);
		if (e.defaultPrevented) return;
		if (disabled) return;

		if (e.key === "Escape") {
			e.stopPropagation();
			setOpen(false);
			return;
		}

		if (e.key !== "Tab") return;

		const node = contentRef.current;
		if (!node) return;

		const focusables = getFocusableWithin(node);
		if (focusables.length === 0) {
			e.preventDefault();
			node.focus();
			return;
		}

		const first = focusables[0]!;
		const last = focusables[focusables.length - 1]!;
		const active = document.activeElement as HTMLElement | null;

		if (e.shiftKey) {
			if (!active || active === first || !node.contains(active)) {
				e.preventDefault();
				last.focus();
			}
		} else {
			if (!active || active === last || !node.contains(active)) {
				e.preventDefault();
				first.focus();
			}
		}
	};

	if (!mounted) return null;

	return (
		<Portal container={container}>
			<Overlay />
			<div
				data-slot="alert-dialog-content"
				data-state={open ? "open" : "closed"}
				{...props}
				ref={composeRefs(forwardedRef, (node: HTMLDivElement | null) => {
					contentRef.current = node;
				})}
				id={contentId}
				role="alertdialog"
				aria-modal="true"
				aria-labelledby={titleId}
				aria-describedby={descriptionId}
				tabIndex={-1}
				onKeyDown={handleKeyDown}
				aria-hidden={open ? "false" : "true"}
				hidden={!open}
				// Radix-like: don't dismiss on outside click. Your overlay manager may still
				// report "outside" events elsewhere; we simply don't subscribe to them here.
				style={{
					...transitionStyles,
					...style,
				}}
			>
				{children}
			</div>
		</Portal>
	);
});

/* -------------------------------------------------------------------------------------------------
 * Header / Footer
 * ------------------------------------------------------------------------------------------------- */

export type AlertDialogHeaderProps = React.ComponentPropsWithoutRef<"div">;
function Header(props: AlertDialogHeaderProps) {
	return <div data-slot="alert-dialog-header" {...props} />;
}

export type AlertDialogFooterProps = React.ComponentPropsWithoutRef<"div">;
function Footer(props: AlertDialogFooterProps) {
	return <div data-slot="alert-dialog-footer" {...props} />;
}

/* -------------------------------------------------------------------------------------------------
 * Title / Description
 * ------------------------------------------------------------------------------------------------- */

export type AlertDialogTitleProps = React.ComponentPropsWithoutRef<"h2"> & { asChild?: boolean };

const Title = React.forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(function Title(
	{ asChild, ...props },
	forwardedRef
) {
	const { titleId } = useAlertDialogContext("AlertDialog.Title");
	const Comp = asChild ? Slot : "h2";
	return <Comp data-slot="alert-dialog-title" {...props} ref={forwardedRef} id={titleId} />;
});

export type AlertDialogDescriptionProps = React.ComponentPropsWithoutRef<"p"> & { asChild?: boolean };

const Description = React.forwardRef<HTMLParagraphElement, AlertDialogDescriptionProps>(function Description(
	{ asChild, ...props },
	forwardedRef
) {
	const { descriptionId } = useAlertDialogContext("AlertDialog.Description");
	const Comp = asChild ? Slot : "p";
	return (
		<Comp data-slot="alert-dialog-description" {...props} ref={forwardedRef} id={descriptionId} />
	);
});

/* -------------------------------------------------------------------------------------------------
 * Action / Cancel (Radix-ish)
 * ------------------------------------------------------------------------------------------------- */

export type AlertDialogActionProps = React.HTMLAttributes<HTMLElement> & {
	asChild?: boolean;
};

const Action = React.forwardRef<HTMLElement, AlertDialogActionProps>(function Action(
	{ asChild, onClick, children, ...props },
	forwardedRef
) {
	const { setOpen, disabled } = useAlertDialogContext("AlertDialog.Action");

	const handleClick = (e: React.MouseEvent<HTMLElement>) => {
		onClick?.(e);
		if (e.defaultPrevented) return;
		setOpen(false);
	};

	const actionProps: React.HTMLAttributes<HTMLElement> & Record<string, unknown> = {
		...props,
		"data-slot": "alert-dialog-action",
		"aria-disabled": disabled ? "true" : undefined,
		onClick: disabled ? undefined : handleClick,
		ref: forwardedRef,
	};

	if (asChild) return <Slot {...actionProps}>{children}</Slot>;

	return (
		<button
			{...(actionProps as Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "ref">)}
			ref={forwardedRef as React.Ref<HTMLButtonElement>}
			type="button"
		>
			{children}
		</button>
	);
});

export type AlertDialogCancelProps = React.HTMLAttributes<HTMLElement> & {
	asChild?: boolean;
};

const Cancel = React.forwardRef<HTMLElement, AlertDialogCancelProps>(function Cancel(
	{ asChild, onClick, children, ...props },
	forwardedRef
) {
	const { setOpen, disabled, cancelRef } = useAlertDialogContext("AlertDialog.Cancel");

	const handleClick = (e: React.MouseEvent<HTMLElement>) => {
		onClick?.(e);
		if (e.defaultPrevented) return;
		setOpen(false);
	};

	const cancelProps: React.HTMLAttributes<HTMLElement> & Record<string, unknown> = {
		...props,
		"data-slot": "alert-dialog-cancel",
		"aria-disabled": disabled ? "true" : undefined,
		onClick: disabled ? undefined : handleClick,
		ref: composeRefs(forwardedRef, (node: HTMLElement | null) => {
			cancelRef.current = node;
		}),
	};

	if (asChild) return <Slot {...cancelProps}>{children}</Slot>;

	return (
		<button
			{...(cancelProps as Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "ref">)}
			ref={cancelProps.ref as React.Ref<HTMLButtonElement>}
			type="button"
		>
			{children}
		</button>
	);
});

/* -------------------------------------------------------------------------------------------------
 * Public API (Radix-ish)
 * ------------------------------------------------------------------------------------------------- */

export const AlertDialog = {
	Root,
	Trigger,
	Portal,
	Overlay,
	Content,
	Header,
	Footer,
	Title,
	Description,
	Action,
	Cancel,
} as const;

export {
	Root,
	Trigger,
	Portal,
	Overlay,
	Content,
	Header,
	Footer,
	Title,
	Description,
	Action,
	Cancel,
};
