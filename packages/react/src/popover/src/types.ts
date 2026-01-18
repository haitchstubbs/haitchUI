import { type Middleware, type Placement, type Strategy, useFloating, useInteractions } from "@floating-ui/react";
import { type OverlayDOM } from "@/overlay/src";
import { type Rect } from "@floating-ui/react";
import { type HTMLAttributes, type PropsWithChildren } from "react";
export type Side = "top" | "right" | "bottom" | "left";
export type Align = "start" | "center" | "end";

export type PopoverContextValue = {
	open: boolean;
	setOpen: (open: boolean) => void;

	placement: Placement;
	refs: ReturnType<typeof useFloating>["refs"];
	floatingStyles: React.CSSProperties;

	getReferenceProps: ReturnType<typeof useInteractions>["getReferenceProps"];
	getFloatingProps: ReturnType<typeof useInteractions>["getFloatingProps"];

	portalRoot: HTMLElement | null;

	modal: boolean;
	isMounted: boolean;
	transitionStyles: React.CSSProperties;

	setContentOverrides: (o: { side?: Side; align?: Align; sideOffset?: number }) => void;

	// for focus manager
	floatingContext: ReturnType<typeof useFloating>["context"];

	// shadow-dom safe outside press helper
	isOutside: (event: Event) => boolean;
};

export type RootProps = PropsWithChildren<{
	dom?: OverlayDOM;

	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;

	side?: Side;
	align?: Align;
	sideOffset?: number;

	strategy?: Strategy;
	middleware?: Middleware[];

	closeOnEscape?: boolean;
	closeOnOutsidePress?: boolean;
	modal?: boolean;

	virtualRect?: Rect;
	virtualContextElement?: Element | null;
}>;

export type TriggerProps = HTMLAttributes<HTMLElement> & { asChild?: boolean, className?: string };

export type AnchorProps = HTMLAttributes<HTMLElement> & { asChild?: boolean };

export type PortalProps = PropsWithChildren<{
    /** optional override for portal root */
    container?: HTMLElement | null;
}>;

export type ContentProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>> & {
	asChild?: boolean;
	side?: Side;
	align?: Align;
	sideOffset?: number;
};