import { forwardRef } from "react";
import type { AlertDialogTitleProps } from "../types";
import { useAlertDialogContext } from "../alert-dialog-context";
import { Slot } from "@/primitives/slot/slot";


export const Title = forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(function Title(
	{ asChild, ...props },
	forwardedRef
) {
	const { titleId } = useAlertDialogContext("AlertDialog.Title");
	const Comp = asChild ? Slot : "h2";
	return <Comp data-slot="alert-dialog-title" {...props} ref={forwardedRef} id={titleId} />;
});