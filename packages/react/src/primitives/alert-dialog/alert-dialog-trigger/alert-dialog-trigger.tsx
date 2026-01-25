import type { AlertDialogTriggerProps } from "../types";
import { forwardRef } from "react";
import type {MouseEvent, HTMLAttributes, ButtonHTMLAttributes, Ref} from "react";
import { Slot } from "@/primitives/slot";
import { useAlertDialogContext } from "../alert-dialog-context";
import { composeRefs } from "@/utils/compose-refs";
export const Trigger = forwardRef<HTMLElement, AlertDialogTriggerProps>(function Trigger(
	{ asChild, onClick, children, ...props },
	forwardedRef
) {
	const { open, setOpen, contentId, triggerRef, disabled } =
		useAlertDialogContext("AlertDialog.Trigger");

	const handleClick = (e: MouseEvent<HTMLElement>) => {
		onClick?.(e);
		if (e.defaultPrevented) return;

		if (e.currentTarget instanceof HTMLButtonElement && e.currentTarget.type === "submit") {
			e.preventDefault();
		}

		setOpen(true);
	};

	const triggerProps: HTMLAttributes<HTMLElement> & Record<string, unknown> = {
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
			{...(triggerProps as Omit<ButtonHTMLAttributes<HTMLButtonElement>, "ref">)}
			ref={triggerProps.ref as Ref<HTMLButtonElement>}
			type="button"
		>
			{children}
		</button>
	);
});