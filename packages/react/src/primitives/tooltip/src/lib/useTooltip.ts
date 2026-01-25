import { autoUpdate, useFloating, type Placement } from "@floating-ui/react";
import { useMemo, useRef } from "react";

import type { TooltipOptions } from "./types";
import { normalizeTooltipOptions } from "./defaults";
import { useControllableOpen } from "./useControllableOpen";
import { useRuntimeOptions } from "./useRuntimeOptions";
import { buildTooltipMiddleware } from "./middleware";
import { useTooltipInteractions } from "./interactions";

export function useTooltip(options?: TooltipOptions) {
  const o = normalizeTooltipOptions(options);

  const { open, setOpen, isControlled } = useControllableOpen({
    initialOpen: o.initialOpen,
    open: o.open,
    onOpenChange: o.onOpenChange,
  });

  const arrowRef = useRef<SVGSVGElement | null>(null);

  const { opts, setOptions } = useRuntimeOptions({
    sideOffset: o.sideOffset,
    collisionPadding: o.collisionPadding,
    delay: o.delay,
  });

  const middleware = useMemo(
    () =>
      buildTooltipMiddleware({
        placement: o.placement as Placement,
        showArrow: o.showArrow,
        arrowRef,
        opts,
      }),
    [o.placement, o.showArrow, opts.sideOffset, opts.collisionPadding]
  );

  const data = useFloating({
    placement: o.placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware,

    // ✅ recommended: avoid transform positioning being clobbered by transform animations
    transform: false,
  });

  const interactions = useTooltipInteractions({
    context: data.context,
    enabled: !isControlled,
    delay: opts.delay,
  });

  return useMemo(
    () => ({
      open,
      setOpen,
      arrowRef,
      setOptions,
      ...interactions,
      ...data, // includes isPositioned
    }),
    [open, setOpen, interactions, data, setOptions]
  );
}