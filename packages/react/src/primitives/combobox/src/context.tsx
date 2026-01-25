"use client";

import * as React from "react";
import type { FloatingContext } from "@floating-ui/react";
import type { Alignment, Middleware as FloatingMiddleware, Placement as FloatingPlacement, Side } from "@floating-ui/react";
import type { Combobox, ComboboxAlign, ComboboxValue } from "./types";

export type ItemRecord = {
	value: ComboboxValue;
	disabled: boolean;
	textValue: string;
	ref: React.MutableRefObject<HTMLElement | null>;
};

export type RootCtx = {
	disabled: boolean;
	modal: boolean;
	multiple: boolean;

	open: boolean;
	setOpen: (open: boolean, details: Combobox.Root.ChangeEventDetails) => void;

	value: ComboboxValue | ComboboxValue[] | null;
	setValue: (value: ComboboxValue | ComboboxValue[] | null, details: Combobox.Root.ChangeEventDetails) => void;

	inputValue: string;
	setInputValue: (value: string, details: Combobox.Root.ChangeEventDetails) => void;

	activeIndex: number;
	setActiveIndex: (index: number) => void;

	listboxId: string;

	// Floating UI
	placement: FloatingPlacement;
	side: Side;
	align: ComboboxAlign;
	floatingStrategy: "absolute" | "fixed";
	middleware: FloatingMiddleware[];
	setPositionerOverrides: (overrides: {
		placement?: FloatingPlacement;
		side?: Side;
		align?: ComboboxAlign;
		sideOffset?: number;
		alignOffset?: number;
		collisionPadding?: number;
	}) => void;
	refs: {
		reference: (node: HTMLElement | null) => void;
		floating: (node: HTMLElement | null) => void;
	};
	setAnchorElement: (node: HTMLElement | null) => void;
	floatingContext: FloatingContext;
	floatingStyles: React.CSSProperties;
	getReferenceProps: (userProps?: Record<string, any>) => Record<string, any>;
	getFloatingProps: (userProps?: Record<string, any>) => Record<string, any>;
	isMounted: boolean;
	transitionStyles: React.CSSProperties;

	// Portals
	portalRoot: HTMLElement | null;

	// Items registry
	registerItem: (record: ItemRecord) => () => void;
	getItems: () => ItemRecord[];
	notifyItemsChanged: () => void;

	// Refs
	inputRef: React.MutableRefObject<HTMLInputElement | null>;
	suppressOpenOnFocusRef: React.MutableRefObject<boolean>;

	// Derived
	isEmpty: boolean;

	// Keyboard (bound to Input)
	onKeyDown: (event: React.KeyboardEvent) => void;
};

const ComboboxContext = React.createContext<RootCtx | null>(null);

export function useComboboxContext(component: string) {
	const ctx = React.useContext(ComboboxContext);
	if (!ctx) throw new Error(`${component} must be used within <Combobox.Root>`);
	return ctx;
}

export function ComboboxProvider(props: { value: RootCtx; children: React.ReactNode }) {
	return <ComboboxContext.Provider value={props.value}>{props.children}</ComboboxContext.Provider>;
}
