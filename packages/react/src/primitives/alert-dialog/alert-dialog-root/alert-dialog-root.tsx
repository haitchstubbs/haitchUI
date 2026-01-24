import React from "react";
import { AlertDialogContext } from "../alert-dialog-context";
import type { AlertDialogRootProps, AlertDialogContextValue } from "../types";
import { useOverlayDOMManager } from "@/overlay/src";
import {useControllableState} from "@/hooks/useControllableState";
import { usePresence } from "../hooks/usePresence";
import { getFocusableWithin } from "../lib/getFocusableWithin"

export function Root({
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

	const [open, setOpen] = useControllableState({
		value: controlledOpen ?? false,
		defaultValue: defaultOpen ?? false,
		...(onOpenChange ? { onChange: onOpenChange } : {}),
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

	const { isMounted, styles: transitionStyles } = usePresence(!!open, { open: 120, close: 100 });

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
			open:!!open,
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