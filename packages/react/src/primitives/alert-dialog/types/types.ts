import type { OverlayDOM } from "@/primitives/overlay";

type AlertContainer = Element | null;
type AsChild = { asChild?: boolean };
export type AlertDialogContextValue = {
	open: boolean;
	setOpen: (next: boolean) => void;

	disabled: boolean;

	titleId: string;
	descriptionId: string;
	contentId: string;

	triggerRef: React.RefObject<HTMLElement | null>;
	contentRef: React.RefObject<HTMLDivElement | null>;
	cancelRef: React.RefObject<HTMLElement | null>;
	lastActiveElementRef: React.RefObject<HTMLElement | null>;

	portalRoot: HTMLElement | null;
	dom: OverlayDOM;

	isMounted: boolean;
	transitionStyles: React.CSSProperties;
};

export type AlertDialogRootProps = {
	dom?: OverlayDOM;

	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;

	disabled?: boolean;

	children: React.ReactNode;
};

export type AlertDialogTriggerProps = React.HTMLAttributes<HTMLElement> & AsChild;

export type AlertDialogPortalProps = {
	container?: AlertContainer
	children: React.ReactNode;
};

export type AlertDialogContentProps = Omit<React.ComponentPropsWithoutRef<"div">, "role"> & {
	forceMount?: boolean;
	container?: AlertContainer
};

export type AlertDialogHeaderProps = React.ComponentPropsWithoutRef<"div">;

export type AlertDialogFooterProps = React.ComponentPropsWithoutRef<"div">;

export type AlertDialogTitleProps = React.ComponentPropsWithoutRef<"h2"> & AsChild;

export type AlertDialogDescriptionProps = React.ComponentPropsWithoutRef<"p"> & AsChild;

export type AlertDialogActionProps = React.HTMLAttributes<HTMLElement> & AsChild;

export type AlertDialogCancelProps = React.HTMLAttributes<HTMLElement> & AsChild;
