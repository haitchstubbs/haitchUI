import { forwardRef } from "react";
import { useAlertDialogContext } from "../alert-dialog-context";
import type { AlertDialogActionProps } from "../types";
import { Slot } from "@/slot/src";

const Action = forwardRef<HTMLElement, AlertDialogActionProps>(function Action({ asChild, onClick, children, ...props }, forwardedRef) {
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
