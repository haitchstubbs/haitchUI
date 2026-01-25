import type { Placement } from "@floating-ui/react";

export interface TooltipOptions {
  initialOpen?: boolean;
  placement?: Placement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showArrow?: boolean;

  sideOffset?: number;
  collisionPadding?: number;
  delay?: number;
}

export type RuntimeOptions = {
  sideOffset: number;
  collisionPadding: number;
  delay: number;
};