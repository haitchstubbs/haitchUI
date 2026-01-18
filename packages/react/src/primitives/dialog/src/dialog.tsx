// packages/react/dialog/src/dialog.tsx
"use client";

import * as React from "react";

import {
	autoUpdate,
	useDismiss,
	useFloating,
	useInteractions,
	useRole,
	useTransitionStyles,
	FloatingPortal,
	FloatingFocusManager,
	FloatingOverlay,
	type FloatingContext,
} from "@floating-ui/react";

import { Slot } from "@/primitives/slot/src";
import { composeRefs } from "@/primitives/compose-refs/src";
import { useOverlayDOMManager, type OverlayDOM } from "@/primitives/overlay/src";

type DialogContextValue = {
	open: boolean;
	setOpen: (next: boolean) => void;

	disabled: boolean;
	modal: boolean;

	closeOnEscape: boolean;
	closeOnOutsidePress: boolean;

	titleId: string;
	descriptionId: string;
	contentId: string;

	// Refs (kept for compatibility / userland access)
	triggerRef: React.RefObject<HTMLElement | null>;
	contentRef: React.RefObject<HTMLDivElement | null>;
	lastActiveElementRef: React.RefObject<HTMLElement | null>;

	portalRoot: HTMLElement | null;
	dom: OverlayDOM;

	// Floating UI
	floating: ReturnType<typeof useFloating> & { context: FloatingContext };
	getReferenceProps: ReturnType<typeof useInteractions>["getReferenceProps"];
	getFloatingProps: ReturnType<typeof useInteractions>["getFloatingProps"];

	// Presence/transition
	isMounted: boolean;
	transitionStyles: React.CSSProperties;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext(componentName: string): DialogContextValue {
	const ctx = React.useContext(DialogContext);
	if (!ctx) throw new Error(`${componentName} must be used within <Dialog.Root>.`);
	return ctx;
}

function useControllableOpen(opts: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; disabled: boolean }) {
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

/* -------------------------------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------------------------------- */

export type DialogRootProps = {
	dom?: OverlayDOM;

	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;

	modal?: boolean;
	disabled?: boolean;

	closeOnEscape?: boolean;
	closeOnOutsidePress?: boolean;

	children: React.ReactNode;
};

function Root({
	dom: domOverride,
	open: controlledOpen,
	defaultOpen,
	onOpenChange,

	modal = true,
	disabled = false,

	closeOnEscape = true,
	closeOnOutsidePress = true,

	children,
}: DialogRootProps) {
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
	const lastActiveElementRef = React.useRef<HTMLElement | null>(null);

	const titleId = React.useId();
	const descriptionId = React.useId();
	const contentId = React.useId();

	const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(null);
	React.useEffect(() => {
		setPortalRoot(dom.getPortalContainer());
	}, [dom]);

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

	// Floating UI setup
	const floating = useFloating({
		open,
		onOpenChange: (next) => {
			// gate with disabled here as well (dismiss can call onOpenChange)
			if (disabled) return;
			setOpen(next);
		},
		whileElementsMounted: autoUpdate,
	});

	// Role="dialog"
	const role = useRole(floating.context, { role: "dialog" });

	// Dismiss (escape + outside press)
	const dismiss = useDismiss(floating.context, {
		enabled: open && !disabled,
		escapeKey: closeOnEscape,
		outsidePress: closeOnOutsidePress
			? (event) => {
					// Shadow/portal safe outside-press check using your OverlayDOM.
					const trigger = triggerRef.current;
					const content = contentRef.current;
					if (!content) return true;

					// If click is inside trigger or content => not outside press
					const target = (event as Event).target as Node | null;
					if (target && (content.contains(target) || trigger?.contains(target))) return false;

					// Otherwise defer to overlay dom manager
					return dom.isEventOutside(event as any, [trigger as any, content as any]);
				}
			: false,
	});

	const { getReferenceProps, getFloatingProps } = useInteractions([role, dismiss]);

	// Presence/transition styles
	const { isMounted, styles: transitionStyles } = useTransitionStyles(floating.context, {
		duration: { open: 120, close: 100 },
		initial: { opacity: 0, transform: "scale(0.95)" },
		open: { opacity: 1, transform: "scale(1)" },
		close: { opacity: 0, transform: "scale(0.95)" },
	});

	const value = React.useMemo<DialogContextValue>(
		() => ({
			open,
			setOpen,

			disabled,
			modal,
			closeOnEscape,
			closeOnOutsidePress,

			titleId,
			descriptionId,
			contentId,

			triggerRef,
			contentRef,
			lastActiveElementRef,

			portalRoot,
			dom,

			floating: Object.assign(floating, { context: floating.context }),
			getReferenceProps,
			getFloatingProps,

			isMounted,
			transitionStyles,
		}),
		[
			open,
			setOpen,
			disabled,
			modal,
			closeOnEscape,
			closeOnOutsidePress,
			titleId,
			descriptionId,
			contentId,
			portalRoot,
			dom,
			floating,
			getReferenceProps,
			getFloatingProps,
			isMounted,
			transitionStyles,
		]
	);

	return (
		<DialogContext.Provider value={value}>
			<div data-slot="dialog-root">{children}</div>
		</DialogContext.Provider>
	);
}

/* -------------------------------------------------------------------------------------------------
 * Trigger
 * ------------------------------------------------------------------------------------------------- */

export type DialogTriggerProps = React.HTMLAttributes<HTMLElement> & {
	asChild?: boolean;
};

const Trigger = React.forwardRef<HTMLElement, DialogTriggerProps>(function Trigger({ asChild, onClick, children, ...props }, forwardedRef) {
	const { open, setOpen, contentId, disabled, triggerRef, floating, getReferenceProps } = useDialogContext("Dialog.Trigger");

	const handleClick = (e: React.MouseEvent<HTMLElement>) => {
		onClick?.(e);
		if (e.defaultPrevented) return;

		if (e.currentTarget instanceof HTMLButtonElement && e.currentTarget.type === "submit") {
			e.preventDefault();
		}

		setOpen(true);
	};

	const mergedRef = composeRefs(forwardedRef, (node: HTMLElement | null) => {
		triggerRef.current = node;
		floating.refs.setReference(node);
	});

	const triggerProps = getReferenceProps({
		...props,
		ref: mergedRef,
		// keep only strongly-typed props here
		"aria-haspopup": "dialog",
		"aria-expanded": open,
		"aria-controls": contentId,
		"aria-disabled": disabled ? "true" : undefined,
		onClick: disabled ? undefined : handleClick,
	});

	// attach data attrs after (no TS complaint)
	(triggerProps as any)["data-slot"] = "dialog-trigger";
	(triggerProps as any)["data-state"] = open ? "open" : "closed";

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
 * Portal (kept for API compatibility)
 * ------------------------------------------------------------------------------------------------- */

export type DialogPortalProps = {
	container?: Element | null;
	children: React.ReactNode;
};

function Portal({ container, children }: DialogPortalProps) {
	const { portalRoot } = useDialogContext("Dialog.Portal");

	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => setMounted(true), []);

	if (!mounted) return null;

	const root = (container instanceof HTMLElement ? container : null) ?? portalRoot ?? document.body;

	return (
		<FloatingPortal root={root}>
			<div data-slot="dialog-portal">{children}</div>
		</FloatingPortal>
	);
}

/* -------------------------------------------------------------------------------------------------
 * Close
 * ------------------------------------------------------------------------------------------------- */

export type DialogCloseProps = React.HTMLAttributes<HTMLElement> & {
	asChild?: boolean;
};

const Close = React.forwardRef<HTMLElement, DialogCloseProps>(function Close({ asChild, onClick, children, ...props }, forwardedRef) {
	const { setOpen, disabled } = useDialogContext("Dialog.Close");

	const handleClick = (e: React.MouseEvent<HTMLElement>) => {
		onClick?.(e);
		if (e.defaultPrevented) return;
		setOpen(false);
	};

	const closeProps: React.HTMLAttributes<HTMLElement> & Record<string, unknown> = {
		...props,
		"data-slot": "dialog-close",
		"aria-disabled": disabled ? "true" : undefined,
		onClick: disabled ? undefined : handleClick,
		ref: forwardedRef,
	};

	if (asChild) return <Slot {...closeProps}>{children}</Slot>;

	return (
		<button
			{...(closeProps as Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "ref">)}
			ref={forwardedRef as React.Ref<HTMLButtonElement>}
			type="button"
		>
			{children}
		</button>
	);
});

/* -------------------------------------------------------------------------------------------------
 * Overlay
 * ------------------------------------------------------------------------------------------------- */

export type DialogOverlayProps = React.ComponentPropsWithoutRef<"div">;

const Overlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(function Overlay({ style, ...props }, forwardedRef) {
	const { open, isMounted, transitionStyles, modal } = useDialogContext("Dialog.Overlay");

	if (!modal || !isMounted) return null;

	// Rendered inside Content (same pattern as your old code),
	// but this component remains usable directly if needed.
	return (
		<FloatingOverlay
			data-slot="dialog-overlay"
			data-state={open ? "open" : "closed"}
			lockScroll
			{...props}
			ref={forwardedRef}
			style={{
				...transitionStyles,
				...style,
			}}
		/>
	);
});

/* -------------------------------------------------------------------------------------------------
 * Content
 * ------------------------------------------------------------------------------------------------- */

export type DialogContentProps = Omit<React.ComponentPropsWithoutRef<"div">, "role"> & {
	forceMount?: boolean;
	container?: Element | null;
};

const Content = React.forwardRef<HTMLDivElement, DialogContentProps>(function Content(
	{ children, forceMount = false, container, style, ...props },
	forwardedRef
) {
	const {
		open,
		contentId,
		titleId,
		descriptionId,
		contentRef,
		modal,
		disabled,
		isMounted,
		transitionStyles,
		portalRoot,
		floating,
		getFloatingProps,
	} = useDialogContext("Dialog.Content");

	const mounted = forceMount || isMounted;

	if (!mounted) return null;

	const root = (container instanceof HTMLElement ? container : null) ?? portalRoot ?? document.body;

	const mergedRef = composeRefs(forwardedRef, (node: HTMLDivElement | null) => {
		contentRef.current = node;
		floating.refs.setFloating(node);
	});

	const floatingProps = getFloatingProps({
		...props,
		ref: mergedRef,
		id: contentId,
		role: "dialog",
		"aria-modal": modal ? "true" : undefined,
		"aria-labelledby": titleId,
		"aria-describedby": descriptionId,
		tabIndex: -1,
		"aria-hidden": open ? "false" : "true",
		hidden: !open,
		style: { ...transitionStyles, ...style },
	});

	(floatingProps as any)["data-slot"] = "dialog-content";
	(floatingProps as any)["data-state"] = open ? "open" : "closed";

	return (
		<FloatingPortal root={root}>
			<div data-slot="dialog-portal">
				{/* Modal overlay + scroll lock when modal */}
				{modal ? (
					<FloatingOverlay data-slot="dialog-overlay" data-state={open ? "open" : "closed"} lockScroll style={transitionStyles} />
				) : null}

				<FloatingFocusManager
					context={floating.context}
					modal={modal}
					disabled={!open || disabled}
					// keep focus behavior similar to Radix: focus first on open, restore on close
					initialFocus={-1}
					returnFocus
				>
					<div {...floatingProps}>{children}</div>
				</FloatingFocusManager>
			</div>
		</FloatingPortal>
	);
});

/* -------------------------------------------------------------------------------------------------
 * Header / Footer
 * ------------------------------------------------------------------------------------------------- */

export type DialogHeaderProps = React.ComponentPropsWithoutRef<"div">;
function Header(props: DialogHeaderProps) {
	return <div data-slot="dialog-header" {...props} />;
}

export type DialogFooterProps = React.ComponentPropsWithoutRef<"div">;
function Footer(props: DialogFooterProps) {
	return <div data-slot="dialog-footer" {...props} />;
}

/* -------------------------------------------------------------------------------------------------
 * Title / Description
 * ------------------------------------------------------------------------------------------------- */

export type DialogTitleProps = React.ComponentPropsWithoutRef<"h2"> & { asChild?: boolean };

const Title = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(function Title({ asChild, ...props }, forwardedRef) {
	const { titleId } = useDialogContext("Dialog.Title");
	const Comp = asChild ? Slot : "h2";
	return <Comp data-slot="dialog-title" {...props} ref={forwardedRef} id={titleId} />;
});

export type DialogDescriptionProps = React.ComponentPropsWithoutRef<"p"> & { asChild?: boolean };

const Description = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(function Description({ asChild, ...props }, forwardedRef) {
	const { descriptionId } = useDialogContext("Dialog.Description");
	const Comp = asChild ? Slot : "p";
	return <Comp data-slot="dialog-description" {...props} ref={forwardedRef} id={descriptionId} />;
});

/* -------------------------------------------------------------------------------------------------
 * Public API (Radix-ish)
 * ------------------------------------------------------------------------------------------------- */

export const Dialog = {
	Root,
	Trigger,
	Portal,
	Overlay,
	Content,
	Close,
	Header,
	Footer,
	Title,
	Description,
} as const;

export { Root, Trigger, Portal, Overlay, Content, Close, Header, Footer, Title, Description };
