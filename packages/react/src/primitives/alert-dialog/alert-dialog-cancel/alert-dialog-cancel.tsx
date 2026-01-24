import { forwardRef } from "react";
import type { AlertDialogCancelProps } from "../types";
import { useAlertDialogContext } from "../alert-dialog-context";
import { composeRefs } from "@/compose-refs/src";
import { Slot } from "@/slot/src";

export const Cancel = forwardRef<HTMLElement, AlertDialogCancelProps>(function Cancel(
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