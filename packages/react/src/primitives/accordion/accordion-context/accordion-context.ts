"use client";

import * as React from "react";
import type { Direction, Orientation } from "../accordion-types";
import type { FloatingTreeType } from "@floating-ui/react";
import { createTypedContext } from "@/utils/createTypedContext/createTypedContext";

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

export type AccordionItemCtx = {
	value: string;
	open: boolean;
	disabled: boolean;
	triggerId: string;
	contentId: string;
};

const {Context: AccordionRootContext, useContext: useAccordionRootContext } = createTypedContext<AccordionRootCtx, "AccordionRootContext">({
	name: "AccordionRootContext",
	errorMessage: "Accordion components must be wrapped in <Root />"
});

const {Context: AccordionItemContext, useContext: useAccordionItemContext } = createTypedContext<AccordionItemCtx, "AccordionItemContext">({
	name: "AccordionItemContext",
	errorMessage: "Accordion components must be wrapped in <Item />"
});


// TODO: Deprecate this in favor of useAccordionRootContext
function useAccordionRootCtx(component = "Accordion.Root") {
	return useAccordionRootContext(component);
}

// TODO: Deprecate this in favor of useAccordionItemContext
function useAccordionItemCtx(component = "Accordion.Item") {
	return useAccordionItemContext(component);
}

export {
	AccordionRootContext,
	useAccordionRootContext,
	useAccordionRootCtx,
	AccordionItemContext,
	useAccordionItemContext,
	useAccordionItemCtx,
};