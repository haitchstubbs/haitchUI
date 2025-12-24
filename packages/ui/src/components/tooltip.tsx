"use client";

import * as React from "react";
import {
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  type Placement,
  type Strategy,
  type Middleware,
} from "@floating-ui/react";

import type { Rect } from "@haitch/react-rect";
import type { VirtualElement } from "@haitch/core";
import { useOverlayDOMManager, type OverlayDOM } from "@haitch/react-overlay";
import { Slot } from "../lib/slot";
import { composeRefs } from "../lib/compose-refs";

type TooltipContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;

  // floating-ui
  refs: ReturnType<typeof useFloating>["refs"];
  floatingStyles: React.CSSProperties;
  getReferenceProps: ReturnType<typeof useInteractions>["getReferenceProps"];
  getFloatingProps: ReturnType<typeof useInteractions>["getFloatingProps"];

  // dom/env
  portalRoot: HTMLElement | null;
};

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

function useTooltipContext() {
  const ctx = React.useContext(TooltipContext);
  if (!ctx) throw new Error("Tooltip components must be used within <Tooltip>.");
  return ctx;
}

type TooltipProps = {
  dom?: OverlayDOM;

  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  placement?: Placement;
  strategy?: Strategy;

  offset?: number;
  flip?: boolean;
  shift?: boolean;
  middleware?: Middleware[];

  openDelay?: number;
  closeDelay?: number;

  closeOnEscape?: boolean;

  /**
   * For canvas/webgl triggers: provide a rect (screen coords) and optional contextElement.
   * If set, this overrides the reference element.
   */
  virtualRect?: Rect;
  virtualContextElement?: Element | null;
};

function useControllableOpen(opts: Pick<TooltipProps, "open" | "defaultOpen" | "onOpenChange">) {
  const [uncontrolled, setUncontrolled] = React.useState<boolean>(opts.defaultOpen ?? false);
  const controlled = typeof opts.open === "boolean";
  const open = controlled ? (opts.open as boolean) : uncontrolled;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!controlled) setUncontrolled(next);
      opts.onOpenChange?.(next);
    },
    [controlled, opts]
  );

  return { open, setOpen };
}

export function Tooltip(props: React.PropsWithChildren<TooltipProps>): React.ReactElement {
  const parentManager = useOverlayDOMManager();
  const manager = React.useMemo(() => parentManager.fork(props.dom), [parentManager, props.dom]);
  const dom = manager.dom;

  const { open, setOpen } = useControllableOpen(props);

  const middleware = React.useMemo(() => {
    const m: Middleware[] = [];
    m.push(offset(props.offset ?? 6));
    if (props.flip ?? true) m.push(flip());
    if (props.shift ?? true) m.push(shift({ padding: 8 }));
    if (props.middleware?.length) m.push(...props.middleware);
    return m;
  }, [props.offset, props.flip, props.shift, props.middleware]);

  const floating = useFloating({
    open,
    onOpenChange: setOpen,
    placement: props.placement ?? "top",
    strategy: props.strategy ?? "absolute",
    middleware,
    whileElementsMounted: autoUpdate,
  });

  // Virtual reference support (canvas/webgl)
  React.useEffect(() => {
    if (!props.virtualRect) return;
    const ve: VirtualElement = dom.createVirtualElement(props.virtualRect, { contextElement: props.virtualContextElement });
    floating.refs.setReference(ve as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.virtualRect, props.virtualContextElement, dom]);

  const hover = useHover(floating.context, {
    delay: { open: props.openDelay ?? 400, close: props.closeDelay ?? 100 },
    move: false,
  });

  const focus = useFocus(floating.context);
  const dismiss = useDismiss(floating.context, {
    escapeKey: props.closeOnEscape ?? true,
  });
  const role = useRole(floating.context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(() => {
    if (typeof document === "undefined") return null;
    return dom.getPortalContainer();
  });
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    setPortalRoot(dom.getPortalContainer());
  }, [dom]);

  const value = React.useMemo<TooltipContextValue>(
    () => ({
      open,
      setOpen,
      refs: floating.refs,
      floatingStyles: floating.floatingStyles,
      getReferenceProps,
      getFloatingProps,
      portalRoot,
    }),
    [open, setOpen, floating.refs, floating.floatingStyles, getReferenceProps, getFloatingProps, portalRoot]
  );

  return <TooltipContext.Provider value={value}>{props.children}</TooltipContext.Provider>;
}

type TooltipTriggerProps = React.HTMLAttributes<HTMLElement> & {
  asChild?: boolean;
};

export const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(function TooltipTrigger(
  { asChild, children, ...props },
  forwardedRef
) {
  const ctx = useTooltipContext();

  const mergedRef = composeRefs(forwardedRef, ctx.refs.setReference as any);

  const triggerProps = ctx.getReferenceProps({
    ...props,
    ref: mergedRef,
  });

  if (asChild) {
    return <Slot {...(triggerProps as any)}>{children}</Slot>;
  }

  return <span {...(triggerProps as any)}>{children}</span>;
});

type TooltipContentProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
};

export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(function TooltipContent(
  { asChild, children, style, ...props },
  forwardedRef
) {
  if (typeof document === "undefined") return null;

  const ctx = useTooltipContext();
  const root = ctx.portalRoot ?? document.body;

  const floatingProps = ctx.getFloatingProps({
    ...props,
    ref: composeRefs(forwardedRef, ctx.refs.setFloating as any),
    style: { ...ctx.floatingStyles, ...style },
  });

  const node = asChild ? <Slot {...(floatingProps as any)}>{children}</Slot> : <div {...floatingProps}>{children}</div>;

  return <FloatingPortal root={root}>{node}</FloatingPortal>;
});
