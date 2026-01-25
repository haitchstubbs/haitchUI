import type { Placement } from "@floating-ui/react";
import type { RuntimeOptions, TooltipOptions } from "./types";

export const DEFAULT_PLACEMENT: Placement = "top";

export const DEFAULT_RUNTIME_OPTIONS: RuntimeOptions = {
  sideOffset: 6,
  collisionPadding: 8,
  delay: 150,
};

export function normalizeTooltipOptions(opts: TooltipOptions | undefined) {
  const o = opts ?? {};
  return {
    initialOpen: o.initialOpen ?? false,
    placement: o.placement ?? DEFAULT_PLACEMENT,
    open: o.open,
    onOpenChange: o.onOpenChange,
    showArrow: o.showArrow ?? true,
    sideOffset: o.sideOffset ?? DEFAULT_RUNTIME_OPTIONS.sideOffset,
    collisionPadding: o.collisionPadding ?? DEFAULT_RUNTIME_OPTIONS.collisionPadding,
    delay: o.delay ?? DEFAULT_RUNTIME_OPTIONS.delay,
  };
}