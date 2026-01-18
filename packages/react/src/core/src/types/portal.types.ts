import { type Placement, type VirtualElement, type Middleware, type ReferenceType } from "@floating-ui/react";

export type Side = "top" | "right" | "bottom" | "left";
export type Align = "start" | "center" | "end";

export type SelectedState = boolean | "indeterminate";

export type FloatingPlacement = Placement;
export type FloatingReference = VirtualElement;

export type FloatingMiddleware = Middleware;

export type { ReferenceType };
