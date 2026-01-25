"use client";

export { Root as AccordionRoot } from "./accordion-root";
export { Item as AccordionItem } from "./accordion-item";
export { Header as AccordionHeader } from "./accordion-header";
export { Trigger as AccordionTrigger } from "./accordion-trigger";
export { Content as AccordionContent } from "./accordion-content";

export type {
	RootProps as AccordionRootProps,
	RootSingleProps as AccordionRootSingleProps,
	RootMultipleProps as AccordionRootMultipleProps,
	ItemProps as AccordionItemProps,
	HeaderProps as AccordionHeaderProps,
	TriggerProps as AccordionTriggerProps,
	ContentProps as AccordionContentProps,
	Orientation as AccordionOrientation,
	Direction as AccordionDirection,
} from "./accordion-types";

export {
	AccordionItemContext,
	AccordionRootContext,
	useAccordionItemContext,
	useAccordionRootContext,
} from "./accordion-context";
export type { AccordionItemCtx as AccordionItemContextValue, AccordionRootCtx as AccordionRootContextValue } from "./accordion-context";
