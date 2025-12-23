"use client";

import * as React from "react";
import {
  FloatingFocusManager,
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  useTransitionStyles,
  type Middleware,
  type Placement,
  type Strategy,
} from "@floating-ui/react";

import type { Rect } from "@haitch/react-rect";
import type { VirtualElement } from "@haitch/react-virtual-element";
import { useOverlayDOMManager, type OverlayDOM } from "@haitch/react-overlay"; // adjust path
import { Slot } from "@haitch/react-slot"; // adjust path to your Slot (or keep in core)
import { composeRefs } from "@haitch/react-compose-refs"; // adjust

export type Side = "top" | "right" | "bottom" | "left";
export type Align = "start" | "center" | "end";

function placementFromSideAlign(side: Side, align: Align): Placement {
  if (align === "center") return side;
  return `${side}-${align}` as Placement;
}
function sideFromPlacement(p: Placement): Side {
  return p.split("-")[0] as Side;
}
function alignFromPlacement(p: Placement): Align {
  return (p.split("-")[1] as Align) ?? "center";
}

function useControllableState(opts: {
  value?: boolean;
  defaultValue?: boolean;
  onChange?: (next: boolean) => void;
}) {
  const [uncontrolled, setUncontrolled] = React.useState(opts.defaultValue ?? false);
  const isControlled = typeof opts.value === "boolean";
  const value = isControlled ? (opts.value as boolean) : uncontrolled;

  const setValue = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolled(next);
      opts.onChange?.(next);
    },
    [isControlled, opts.onChange]
  );

  return [value, setValue] as const;
}

type PopoverContextValue = {
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

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) throw new Error("Popover components must be used within <Popover.Root>.");
  return ctx;
}

/** ---------------- Root ---------------- */

export type RootProps = React.PropsWithChildren<{
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

export function Root(props: RootProps) {
  const parent = useOverlayDOMManager();
  const manager = React.useMemo(() => parent.fork(props.dom), [parent, props.dom]);
  const dom = manager.dom;

  const [open, setOpen] = useControllableState({
    value: props.open,
    defaultValue: props.defaultOpen,
    onChange: props.onOpenChange,
  });

  const [contentOverrides, setContentOverrides] = React.useState<{
    side?: Side;
    align?: Align;
    sideOffset?: number;
  }>({});

  const placement = React.useMemo(() => {
    const side = contentOverrides.side ?? props.side ?? "bottom";
    const align = contentOverrides.align ?? props.align ?? "center";
    return placementFromSideAlign(side, align);
  }, [contentOverrides.side, contentOverrides.align, props.side, props.align]);

  const middleware = React.useMemo(() => {
    const m: Middleware[] = [];
    const resolvedOffset = contentOverrides.sideOffset ?? props.sideOffset ?? 4;
    m.push(offset(resolvedOffset));
    m.push(flip());
    m.push(shift({ padding: 8 }));
    if (props.middleware?.length) m.push(...props.middleware);
    return m;
  }, [contentOverrides.sideOffset, props.sideOffset, props.middleware]);

  const floating = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    strategy: props.strategy ?? "absolute",
    middleware,
    whileElementsMounted: autoUpdate,
  });

  // Virtual reference support
  React.useEffect(() => {
    if (!props.virtualRect) return;
    const ve: VirtualElement = dom.createVirtualElement(props.virtualRect, {
      contextElement: props.virtualContextElement,
    });
    floating.refs.setReference(ve as any);
  }, [props.virtualRect, props.virtualContextElement, dom, floating.refs]);

  const closeOnEscape = props.closeOnEscape ?? true;
  const closeOnOutsidePress = props.closeOnOutsidePress ?? true;

  const isOutside = React.useCallback(
    (event: Event) =>
      dom.isEventOutside(event, [
        floating.refs.reference.current as any,
        floating.refs.floating.current as any,
      ]),
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

  const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    setPortalRoot(dom.getPortalContainer());
  }, [dom]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(floating.context, {
    duration: { open: 120, close: 100 },
    initial: { opacity: 0, transform: "scale(0.95)" },
    open: { opacity: 1, transform: "scale(1)" },
    close: { opacity: 0, transform: "scale(0.95)" },
  });

  const value = React.useMemo<PopoverContextValue>(
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

export type TriggerProps = React.HTMLAttributes<HTMLElement> & { asChild?: boolean };

export const Trigger = React.forwardRef<HTMLElement, TriggerProps>(function Trigger(
  { asChild, children, ...props },
  forwardedRef
) {
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

export type AnchorProps = React.HTMLAttributes<HTMLElement> & { asChild?: boolean };

export const Anchor = React.forwardRef<HTMLElement, AnchorProps>(function Anchor(
  { asChild, children, ...props },
  forwardedRef
) {
  const ctx = usePopoverContext();
  const mergedRef = composeRefs(forwardedRef, ctx.refs.setReference as any);

  const anchorProps = {
    ...props,
    ref: mergedRef,
  };

  return asChild ? <Slot {...(anchorProps as any)}>{children}</Slot> : <span {...(anchorProps as any)}>{children}</span>;
});

/** ---------------- Portal ---------------- */

export type PortalProps = React.PropsWithChildren<{
  /** optional override for portal root */
  container?: HTMLElement | null;
}>;

export function Portal({ container, children }: PortalProps) {
  const ctx = usePopoverContext();
  return <FloatingPortal root={container ?? ctx.portalRoot}>{children}</FloatingPortal>;
}

/** ---------------- Content ---------------- */

export type ContentProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  side?: Side;
  align?: Align;
  sideOffset?: number;
};

export const Content = React.forwardRef<HTMLDivElement, ContentProps>(function Content(
  { asChild, children, style, side, align, sideOffset, ...props },
  forwardedRef
) {
  const ctx = usePopoverContext();

  React.useEffect(() => {
    ctx.setContentOverrides({ side, align, sideOffset });
    return () => ctx.setContentOverrides({});
  }, [side, align, sideOffset, ctx]);

  if (!ctx.isMounted) return null;

  const placementSide = sideFromPlacement(ctx.placement);
  const resolvedAlign = align ?? alignFromPlacement(ctx.placement);

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
      transform: [
        ctx.floatingStyles.transform,
        ctx.transitionStyles.transform,
        style?.transform,
      ]
        .filter(Boolean)
        .join(" "),
    },
  } as React.HTMLAttributes<HTMLDivElement>);

  const node = asChild
    ? <Slot {...(floatingProps as any)}>{children}</Slot>
    : <div {...floatingProps}>{children}</div>;

  return ctx.modal ? (
    <FloatingFocusManager context={ctx.floatingContext} modal>
      {node}
    </FloatingFocusManager>
  ) : (
    node
  );
});
