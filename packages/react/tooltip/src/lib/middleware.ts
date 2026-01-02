// lib/middleware.ts
import { arrow, flip, offset, shift, type Middleware, type Placement } from "@floating-ui/react";
import type { RuntimeOptions } from "./types";

export function buildTooltipMiddleware(params: {
  placement: Placement;
  showArrow: boolean;
  arrowRef: React.RefObject<SVGSVGElement  | null>;
  opts: RuntimeOptions;
}): Middleware[] {
  const { placement, showArrow, arrowRef, opts } = params;

  const list: (Middleware | undefined)[] = [
    offset(opts.sideOffset),
    showArrow ? arrow({ element: arrowRef }) : undefined,
    flip({
      crossAxis: placement.includes("-"),
      fallbackAxisSideDirection: "start",
      padding: opts.collisionPadding,
    }),
    shift({ padding: opts.collisionPadding }),
  ];

  return list.filter(Boolean) as Middleware[];
}
