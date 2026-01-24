import { forwardRef } from "react";
import type { KeyboardEvent } from "react";
import { Portal } from "../alert-dialog-portal";
import { composeRefs } from "@/compose-refs/src";
import { useAlertDialogContext } from "../alert-dialog-context";
import type { AlertDialogContentProps } from "../types/types";
import { getFocusableWithin } from "../lib/getFocusableWithin";
import { Overlay } from "../alert-dialog-overlay";

export const Content = forwardRef<HTMLDivElement, AlertDialogContentProps>(function Content(
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

	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
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
