import { createContext, useContext } from "react";
import type { AlertDialogContextValue } from "../types";

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);

function useAlertDialogContext(componentName: string): AlertDialogContextValue {
	const ctx = useContext(AlertDialogContext);
	if (!ctx) throw new Error(`${componentName} must be used within <AlertDialog.Root>.`);
	return ctx;
}

export { AlertDialogContext, useAlertDialogContext };