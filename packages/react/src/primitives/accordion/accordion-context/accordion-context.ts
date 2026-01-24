"use client";

import * as React from "react";
import type { Direction, Orientation } from "../accordion-types";
import type { FloatingTreeType } from "@floating-ui/react";

export type AccordionType = "single" | "multiple";

export type AccordionRootCtx = {
	type: AccordionType;
	orientation: Orientation;
	dir: Direction;
	collapsible: boolean;
	disabled: boolean;

	// controlled state surface
	isItemOpen: (value: string) => boolean;
	toggleItem: (value: string) => void;
	openItem: (value: string) => void;
	closeItem: (value: string) => void;

	// ids
	getTriggerId: (value: string) => string;
	getContentId: (value: string) => string;

	// FloatingTree event channel
	tree: FloatingTreeType | null;
	nodeId: string;
};

export const AccordionRootContext = React.createContext<AccordionRootCtx | null>(null);

export function useAccordionRootCtx() {
	const ctx = React.useContext(AccordionRootContext);
	if (!ctx) throw new Error("Accordion components must be wrapped in <Root />");
	return ctx;
}

export type AccordionItemCtx = {
	value: string;
	open: boolean;
	disabled: boolean;
	triggerId: string;
	contentId: string;
};

export const AccordionItemContext = React.createContext<AccordionItemCtx | null>(null);

export function useAccordionItemCtx() {
	const ctx = React.useContext(AccordionItemContext);
	if (!ctx) throw new Error("Accordion components must be wrapped in <Item />");
	return ctx;
}
