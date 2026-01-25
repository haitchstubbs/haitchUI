import { forwardRef } from "react";
import { useAlertDialogContext } from "../alert-dialog-context";
import { Slot } from "@/primitives/slot/slot";
import type { AlertDialogDescriptionProps } from "../types";

export const Description = forwardRef<HTMLParagraphElement, AlertDialogDescriptionProps>(function Description({ asChild, ...props }, forwardedRef) {
	const { descriptionId } = useAlertDialogContext("AlertDialog.Description");
	const Comp = asChild ? Slot : "p";
	return <Comp data-slot="alert-dialog-description" {...props} ref={forwardedRef} id={descriptionId} />;
});
