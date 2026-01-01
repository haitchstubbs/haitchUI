"use client";
import { useMemo, useState } from "react";

export function useControllableOpen(params: { initialOpen: boolean; open?: boolean; onOpenChange?: (open: boolean) => void }) {
	const { initialOpen, open: controlledOpen, onOpenChange } = params;

	const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);

	const open = controlledOpen ?? uncontrolledOpen;
	const setOpen = onOpenChange ?? setUncontrolledOpen;

	return useMemo(
		() => ({
			open,
			setOpen,
			isControlled: controlledOpen != null,
		}),
		[open, setOpen, controlledOpen]
	);
}
