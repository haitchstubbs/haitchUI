import { useCallback, useEffect, useMemo, useState } from "react";
import type { Align, Side } from "./popover.types";
import { autoUpdate, flip, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole, useTransitionStyles, type Middleware, type Placement, type Strategy, type UseFloatingReturn } from "@floating-ui/react";
import type { OverlayDOM, RectLike } from "../../types/types";
import { Popover } from "./popover.service";

export function useControllableOpen({
	open,
	defaultOpen,
	onOpenChange,
}: {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}) {
	const [uncontrolled, setUncontrolled] = useState(defaultOpen ?? false);

	const controlled = open !== undefined;
	const value = controlled ? open : uncontrolled;

	const setValue = useCallback(
		(next: boolean) => {
			if (!controlled) setUncontrolled(next);
			onOpenChange?.(next);
		},
		[controlled, onOpenChange]
	);

	return { open: value, setOpen: setValue };
}

export interface PopoverFloatingResult {
  floating: UseFloatingReturn;
  placement: Placement;
  isOutside: (event: Event) => boolean;
  click: ReturnType<typeof useClick>;
  dismiss: ReturnType<typeof useDismiss>;
  interactions: ReturnType<typeof useInteractions>;
  isMounted: boolean;
  transitionStyles: React.CSSProperties;
  floatingContext: UseFloatingReturn['context'];
  setContentOverrides: (overrides: {
	side?: Side;
	align?: Align;
	sideOffset?: number;
  }) => void;
}

export function usePopoverFloating(
  props: {
    open: boolean;
    setOpen: (open: boolean) => void;
    side?: Side;
    align?: Align;
    sideOffset?: number;
    strategy?: Strategy;
    middleware?: Middleware[];
    dom: OverlayDOM;
    virtualRect?: RectLike;
    virtualContextElement?: Element | null;
    closeOnEscape: boolean;
    closeOnOutsidePress: boolean;
  }
): PopoverFloatingResult {
	const [overrides, setOverrides] = useState<{
		side?: Side;
		align?: Align;
		sideOffset?: number;
	}>({});

	const placement = useMemo(() => {
		const side = overrides.side ?? props.side ?? "bottom";
		const align = overrides.align ?? props.align ?? "center";
		return Popover.placementFromSideAlign(side, align);
	}, [overrides, props.side, props.align]);

	const middleware = useMemo(() => {
		const m: Middleware[] = [];
		m.push(offset(overrides.sideOffset ?? props.sideOffset ?? 4));
		m.push(flip());
		m.push(shift({ padding: 8 }));
		if (props.middleware?.length) {
			m.push(...props.middleware);
		}
		return m;
	}, [overrides, props.sideOffset, props.middleware]);

	const floating = useFloating({
		open: props.open,
		onOpenChange: props.setOpen,
		placement,
		strategy: props.strategy ?? "absolute",
		middleware,
		whileElementsMounted: autoUpdate,
	});

	// Virtual element support
	useEffect(() => {
		if (!props.virtualRect) return;
		if (typeof props.dom.createVirtualElement === "function") {
			const ve = props.dom.createVirtualElement(props.virtualRect, {
				contextElement: props.virtualContextElement,
			});
			floating.refs.setReference(ve as any);
		}
	}, [props.virtualRect, props.virtualContextElement, props.dom]);

	const isOutside = useCallback(
		(event: Event) =>
			typeof props.dom.isEventOutside === "function"
				? props.dom.isEventOutside(event, [floating.refs.reference.current as any, floating.refs.floating.current as any])
				: false,
		[props.dom, floating.refs]
	);

	const click = useClick(floating.context);
	const dismiss = useDismiss(floating.context, {
		escapeKey: props.closeOnEscape,
		outsidePress: props.closeOnOutsidePress ? (event) => isOutside(event) : false,
	});
	const role = useRole(floating.context, { role: "dialog" });

	const interactions = useInteractions([click, dismiss, role]);

	const transition = useTransitionStyles(floating.context, {
		duration: { open: 120, close: 100 },
		initial: { opacity: 0, transform: "scale(0.95)" },
		open: { opacity: 1, transform: "scale(1)" },
		close: { opacity: 0, transform: "scale(0.95)" },
	});

	return {
        floating,
		floatingContext: floating.context,
        interactions,
        placement,
        isOutside,
        isMounted: transition.isMounted,
        transitionStyles: transition.styles,
        setContentOverrides: setOverrides,
        click,      // <-- Add this
        dismiss
	};
}
