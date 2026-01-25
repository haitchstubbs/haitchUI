import { createPortal } from "react-dom";
import { useAlertDialogContext } from "../alert-dialog-context";
import type { AlertDialogPortalProps } from "../types";

export function Portal({ container, children }: AlertDialogPortalProps) {
	const { portalRoot } = useAlertDialogContext("AlertDialog.Portal");
	if (typeof document === "undefined") return null;

	const target = container ?? portalRoot ?? document.body;
	return createPortal(<div data-slot="alert-dialog-portal">{children}</div>, target);
}
