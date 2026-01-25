"use client";

export { Root as CollapsibleRoot } from "./root";
export { Trigger as CollapsibleTrigger } from "./trigger";
export { Content as CollapsibleContent } from "./content";

export { CollapsibleContext, useCollapsibleCtx as useCollapsibleContext } from "./context";
export type { CollapsibleCtx as CollapsibleContextValue } from "./context";

export type {
	RootProps as CollapsibleRootProps,
	TriggerProps as CollapsibleTriggerProps,
	ContentProps as CollapsibleContentProps,
} from "./types";
