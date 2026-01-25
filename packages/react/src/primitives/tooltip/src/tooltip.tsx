"use client";

import * as React from "react";
import { FloatingArrow, FloatingPortal, type FloatingArrowProps, type Placement } from "@floating-ui/react";
import { Slot } from "@/primitives/slot";
import { useTooltip as useTooltipInternal } from "./lib/useTooltip";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

function toPlacement(side: Side = "top", align: Align = "center"): Placement {
	if (align === "center") return side;
	return `${side}-${align}` as Placement;
}

type ProviderContextValue = {
	delayDuration: number;
};

const TooltipProviderContext = React.createContext<ProviderContextValue | null>(null);

export type TooltipProviderProps = {
	children: React.ReactNode;
	/**
	 * Delay before opening on hover/focus (ms).
	 * Mirrors shadcn/Radix "delayDuration".
	 */
	delayDuration?: number;
};

export function Provider({ children, delayDuration = 150 }: TooltipProviderProps) {
	return <TooltipProviderContext.Provider value={{ delayDuration }}>{children}</TooltipProviderContext.Provider>;
}

function useTooltipProvider() {
	return React.useContext(TooltipProviderContext);
}

type TooltipContextValue = ReturnType<typeof useTooltipInternal> & {
	__portalRoot: HTMLElement | null;
};

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

export function useTooltipContext() {
	const ctx = React.useContext(TooltipContext);
	if (!ctx) throw new Error("Tooltip components must be wrapped in <Tooltip />");
	return ctx;
}

export type TooltipProps = {
	children: React.ReactNode;

	/** Controlled/uncontrolled (shadcn-ish) */
	defaultOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;

	/** Placement (shadcn-ish) */
	side?: Side;
	align?: Align;

	/**
	 * Provide a portal root for the tooltip content.
	 * Defaults to document.body (FloatingPortal default) unless you override.
	 *
	 * Useful when your theme variables live on a specific root (e.g. .ui-root)
	 * or when using Shadow DOM.
	 */
	portalRoot?: HTMLElement | null;

	/**
	 * Optional: allow disabling portal entirely at the root level.
	 * (Content can also override via its own prop.)
	 */
	portalled?: boolean;
};

export function TooltipRoot({ children, defaultOpen, open, onOpenChange, side = "top", align = "center", portalRoot, portalled = true }: TooltipProps) {
	const provider = useTooltipProvider();

	const inferredPortalRoot = React.useMemo(() => {
		if (portalRoot !== undefined) return portalRoot;
		if (typeof document === "undefined") return null;

		// ✅ IMPORTANT: portal inside theme scope
		return (document.querySelector(".ui-root") as HTMLElement | null) ?? document.body;
	}, [portalRoot]);
	const tooltip = useTooltipInternal({
		initialOpen: defaultOpen ?? false,
		open,
		onOpenChange,
		placement: toPlacement(side, align),
		delay: provider?.delayDuration ?? 150,
	} as any);

	const value = React.useMemo(
		() => ({ ...tooltip, __portalRoot: portalled ? inferredPortalRoot : null }),
		[tooltip, inferredPortalRoot, portalled]
	);

	return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>;
}

export type TooltipTriggerProps = React.HTMLProps<HTMLElement> & { asChild?: boolean };

export const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(function TooltipTrigger({ asChild = false, ...props }, ref) {
	const tooltip = useTooltipContext();
	const Comp = asChild ? Slot : "span";

	const referenceProps = tooltip.getReferenceProps(props as any);

	// Merge refs without styling assumptions.
	return (
		<Comp
			{...referenceProps}
			ref={(node: any) => {
				tooltip.refs.setReference(node);
				if (typeof ref === "function") ref(node);
				else if (ref) (ref as any).current = node;
			}}
			data-slot="tooltip-trigger"
		/>
	);
});

export type TooltipContentProps = React.HTMLProps<HTMLDivElement> & {
  portalled?: boolean;
  sideOffset?: number;
  collisionPadding?: number;
  className?: string;
  children?: React.ReactNode;
};

export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  function TooltipContent(
    { portalled, className, sideOffset = 6, collisionPadding = 8, children, ...props },
    ref
  ) {
    const tooltip = useTooltipContext();

    useIsomorphicLayoutEffect(() => {
      tooltip.setOptions?.({ sideOffset, collisionPadding });
    }, [tooltip, sideOffset, collisionPadding]);

    if (!tooltip.open) return null;

    const floatingProps = tooltip.getFloatingProps({
      ...props,
    } as any);

    const computedSide = (tooltip.placement?.split("-")[0] ?? "top") as any;
    const open = tooltip.open && tooltip.isPositioned;
	const mergedClassNames = [floatingProps.className, className].filter(Boolean).join(' ');
    const node = (
      <div
        {...floatingProps}
        ref={(node) => {
          tooltip.refs.setFloating(node);
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as any).current = node;
        }}
        data-slot="tooltip-content"
        data-state={open ? "open" : "closed"}
        data-side={computedSide}
        className={mergedClassNames}
        style={{
          ...(tooltip.floatingStyles as React.CSSProperties),
          ...(floatingProps.style as React.CSSProperties),
          ...(props.style as React.CSSProperties),
          opacity: tooltip.open && !tooltip.isPositioned ? 0 : (props.style as any)?.opacity,
        }}
      >
        {children}
      </div>
    );

    const shouldPortal = portalled ?? Boolean(tooltip.__portalRoot);
    return shouldPortal && tooltip.__portalRoot ? (
      <FloatingPortal root={tooltip.__portalRoot}>{node}</FloatingPortal>
    ) : (
      node
    );
  }
);

export type TooltipArrowProps = Omit<Partial<FloatingArrowProps>, "ref"> & {
	style?: React.CSSProperties;
	className?: string;
};

export const TooltipArrow = React.forwardRef<SVGSVGElement, TooltipArrowProps>(function TooltipArrow(props, forwardedRef) {
	const { style, className, height, ...restProps } = props;
	const tooltip = useTooltipContext();
	return (
		<FloatingArrow
			ref={(node) => {
				tooltip.arrowRef.current = node;
				if (typeof forwardedRef === "function") forwardedRef(node);
				else if (forwardedRef) (forwardedRef as any).current = node;
			}}
			context={tooltip.context}
			className={className}
			style={{ ...style }}
			data-slot="tooltip-arrow"
			// Only pass height if it's a number
			{...(typeof height === "number" ? { height } : {})}
			{...restProps}
		/>
	);
});
