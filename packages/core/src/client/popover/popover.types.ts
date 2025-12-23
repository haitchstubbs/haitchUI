
import type { HTMLProps } from "react";
import type { Placement as FloatingPlacement, UseFloatingReturn } from "@floating-ui/react";

export type GetProps = (
  userProps?: HTMLProps<HTMLElement>
) => Record<string, unknown>;

export type Side = "top" | "right" | "bottom" | "left";
export type Align = "start" | "center" | "end";
export type Placement = FloatingPlacement;
export type FloatingRefs = UseFloatingReturn["refs"];

export type PopoverReferenceProps = ReturnType<GetProps>;
export type PopoverFloatingProps = ReturnType<GetProps>;

export type PopoverReferencePropsGetter = GetProps;
export type PopoverFloatingPropsGetter = GetProps;

