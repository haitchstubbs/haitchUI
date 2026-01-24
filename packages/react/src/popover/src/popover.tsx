"use client";

/** React Imports */
import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import {
	// Types
	type Alignment as Align,
	type Side,
	type Middleware as FloatingMiddleware,
	type ReferenceType,
	// Hooks
	autoUpdate,
	useDismiss,
	useFloating,
	useInteractions,
	useRole,
	useClick,
	useTransitionStyles,
	// Components
	FloatingPortal,
	FloatingFocusManager,
} from "@floating-ui/react";

/** Primitive Imports */
import { useOverlayDOMManager } from "@haitch-ui/react/overlay";
import { Slot } from "@/slot/src/index.js";
import { composeRefs } from "@/compose-refs/src/index.js";
import type { VirtualElement } from "@/virtual-element/src/index.js";

/** Local Imports for Popover */
import { useControllableState } from "./hooks.js"; // adjust path
import { PopoverUtils } from "./util.js";
import { PopoverContext, usePopoverContext } from "./context.js";
import type { PopoverContextValue, RootProps, TriggerProps, AnchorProps, PortalProps, ContentProps } from "./types.js"; // adjust path

function Root(props: RootProps) {
	const parent = useOverlayDOMManager();
	const manager = useMemo(() => parent.fork(props.dom), [parent, props.dom]);
	const dom = manager.dom;

	const [open, setOpen] = useControllableState({
		value: props.open,
		defaultValue: props.defaultOpen,
		onChange: props.onOpenChange,
	});

	const [contentOverrides, setContentOverrides] = useState<{
		side?: Side;
		align?: Align | "center";
		sideOffset?: number;
	}>({});

	const placement = useMemo(() => {
		const side = contentOverrides.side ?? props.side ?? "bottom";
		const align = contentOverrides.align ?? props.align ?? "center";
		return PopoverUtils.placementFromSideAlign(side, align);
	}, [contentOverrides.side, contentOverrides.align, props.side, props.align]);

	const middleware = useMemo(() => {
		const m: FloatingMiddleware[] = PopoverUtils.resolveMiddleware(contentOverrides.sideOffset, props.sideOffset, props.middleware);
		return m;
	}, [contentOverrides.sideOffset, props.sideOffset, props.middleware]);

	const floating = useFloating({
		open,
		onOpenChange: setOpen,
		placement,
		strategy: props.strategy ?? "absolute",
		middleware,
		whileElementsMounted: autoUpdate,
		transform: false
	});

	// Virtual reference support
	useEffect(() => {
		if (!props.virtualRect) return;
		const ve: VirtualElement = dom.createVirtualElement(props.virtualRect, {
			contextElement: props.virtualContextElement,
		});
		floating.refs.setReference(ve as ReferenceType);
	}, [props.virtualRect, props.virtualContextElement, dom, floating.refs]);

	const closeOnEscape = props.closeOnEscape ?? true;
	const closeOnOutsidePress = props.closeOnOutsidePress ?? true;

	const isOutside = useCallback(
		(event: Event) =>
			dom.isEventOutside(event, [
				floating.refs.reference.current,
				floating.refs.floating.current,
			].filter((el): el is Element => el instanceof Element)
			),
		[dom, floating.refs]
	);

	const click = useClick(floating.context);
	const dismiss = useDismiss(floating.context, {
		escapeKey: closeOnEscape,
		outsidePressEvent: "pointerdown",
		outsidePress: closeOnOutsidePress ? (event) => isOutside(event) : false,
	});
	const role = useRole(floating.context, { role: "dialog" });

	const interactions = useInteractions([click, dismiss, role]);

	const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
	useEffect(() => {
		setPortalRoot(dom.getPortalContainer());
	}, [dom]);

	const { isMounted, styles: transitionStyles } = useTransitionStyles(floating.context, {
		duration: { open: 120, close: 100 },
		initial: { opacity: 0, transform: "scale(0.95)" },
		open: { opacity: 1, transform: "scale(1)" },
		close: { opacity: 0, transform: "scale(0.95)" },
	});

	const value = useMemo<PopoverContextValue>(
		() => ({
			open,
			setOpen,
			placement,
			refs: floating.refs,
			floatingStyles: floating.floatingStyles,
			getReferenceProps: interactions.getReferenceProps,
			getFloatingProps: interactions.getFloatingProps,
			portalRoot,
			modal: props.modal ?? false,
			isMounted,
			transitionStyles,
			setContentOverrides,
			floatingContext: floating.context,
			isOutside,
		}),
		[
			open,
			setOpen,
			placement,
			floating.refs,
			floating.floatingStyles,
			interactions.getReferenceProps,
			interactions.getFloatingProps,
			portalRoot,
			props.modal,
			isMounted,
			transitionStyles,
			isOutside,
		]
	);

	return <PopoverContext.Provider value={value}>{props.children}</PopoverContext.Provider>;
}

/** ---------------- Trigger ---------------- */
const Trigger = forwardRef<HTMLElement, TriggerProps>(function Trigger({ asChild, children, ...props }, forwardedRef) {
	const ctx = usePopoverContext();
	const mergedRef = composeRefs(forwardedRef, ctx.refs.setReference as any);

	const triggerProps = ctx.getReferenceProps({
		...(props as any),
		ref: mergedRef,
		"data-state": ctx.open ? "open" : "closed",
	});

	return asChild ? <Slot {...(triggerProps as any)}>{children}</Slot> : <span {...(triggerProps as any)}>{children}</span>;
});

/** ---------------- Anchor ---------------- */
const Anchor = forwardRef<HTMLElement, AnchorProps>(function Anchor({ asChild, children, ...props }, forwardedRef) {
	const ctx = usePopoverContext();
	const mergedRef = composeRefs(forwardedRef, ctx.refs.setReference as any);

	const anchorProps = {
		...props,
		ref: mergedRef,
	};

	return asChild ? <Slot {...(anchorProps as any)}>{children}</Slot> : <span {...(anchorProps as any)}>{children}</span>;
});

/** ---------------- Portal ---------------- */
function Portal({ container, children }: PortalProps) {
	const ctx = usePopoverContext();
	return <FloatingPortal root={container ?? ctx.portalRoot}>{children}</FloatingPortal>;
}

/** ---------------- Content ---------------- */
const Content = forwardRef<HTMLDivElement, ContentProps>(function Content(
	{ asChild, children, style, side, align, sideOffset, ...props },
	forwardedRef
) {
	const ctx = usePopoverContext();

	useEffect(() => {
		ctx.setContentOverrides({ side, align, sideOffset });
		return () => ctx.setContentOverrides({});
	}, [side, align, sideOffset, ctx]);

	if (!ctx.isMounted) return null;

	const placementSide = PopoverUtils.sideFromPlacement(ctx.placement);
	const resolvedAlign = align ?? PopoverUtils.alignFromPlacement(ctx.placement);

	const floatingProps = ctx.getFloatingProps({
		...props,
		ref: composeRefs(forwardedRef, ctx.refs.setFloating as any),
		"data-state": ctx.open ? "open" : "closed",
		"data-side": placementSide,
		"data-align": resolvedAlign,
		style: {
			...ctx.floatingStyles,
			...ctx.transitionStyles,
			...style,
			transform: [ctx.floatingStyles.transform, ctx.transitionStyles.transform, style?.transform].filter(Boolean).join(" "),
		},
	} as React.HTMLAttributes<HTMLDivElement>);

	const node = asChild ? <Slot {...(floatingProps as any)}>{children}</Slot> : <div {...floatingProps}>{children}</div>;

	return ctx.modal ? (
		<FloatingFocusManager context={ctx.floatingContext} modal>
			{node}
		</FloatingFocusManager>
	) : (
		node
	);
});

export { Root, Trigger, Anchor, Portal, Content };
