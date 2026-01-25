import type { AlertDialogHeaderProps } from "../types";

export function Header(props: AlertDialogHeaderProps) {
	return <div data-slot="alert-dialog-header" {...props} />;
}
