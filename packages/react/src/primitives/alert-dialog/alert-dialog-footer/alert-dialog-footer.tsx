import type { AlertDialogFooterProps } from "../types";

export function Footer(props: AlertDialogFooterProps) {
	return <div data-slot="alert-dialog-footer" {...props} />;
}
	