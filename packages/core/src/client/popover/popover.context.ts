import * as React from "react";
import type { Align, FloatingRefs, PopoverFloatingPropsGetter, PopoverReferencePropsGetter, Side, Placement } from "./popover.types";
import type { UseFloatingReturn } from "@floating-ui/react";

export type PopoverContextValue = {
	open: boolean;
	setOpen: (open: boolean) => void;

	placement: Placement;
	refs: FloatingRefs;
	floatingStyles: React.CSSProperties;
	getReferenceProps: PopoverReferencePropsGetter;
	getFloatingProps: PopoverFloatingPropsGetter;
	floatingContext: UseFloatingReturn["context"];
	portalRoot: HTMLElement | null;

	modal: boolean;
	closeOnOutsidePress: boolean;
	closeOnEscape: boolean;

	isOutside: (event: Event) => boolean;

	isMounted: boolean;
	transitionStyles: React.CSSProperties;

	setContentOverrides: (overrides: { side?: Side; align?: Align; sideOffset?: number }) => void;
};

export const PopoverContext = React.createContext<PopoverContextValue | null>(null);

export function usePopoverContext() {
	const ctx = React.useContext(PopoverContext);
	if (!ctx) {
		throw new Error("Popover components must be used within <Popover>.");
	}
	return ctx;
}
