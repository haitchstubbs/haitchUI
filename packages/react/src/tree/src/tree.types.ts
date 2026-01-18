"use client";

import type * as React from "react";

export type TreeSelectionMode = "single" | "multiple";
export type TreeTabBehavior = "roam" | "native";

export type TreeValue = string;

export type TreeRootContextValue = {
	selectionMode: TreeSelectionMode;
	tabBehavior: TreeTabBehavior;

	// selection
	selected: Set<TreeValue>;
	isSelected: (v: TreeValue) => boolean;
	select: (v: TreeValue, opts?: { additive?: boolean }) => void;
	toggleSelect: (v: TreeValue) => void;

	// expansion
	isExpanded: (v: TreeValue) => boolean;
	setExpanded: (v: TreeValue, next: boolean) => void;
	toggleExpanded: (v: TreeValue) => void;

	// focus/roving
	activeValue: TreeValue | null;
	setActiveValue: (v: TreeValue) => void;
	focusValue: (v: TreeValue) => void;

	// utilities
	expandAll: () => void;
	expandBelow: (value: TreeValue, opts?: { includeSelf?: boolean }) => void;
	collapseAll: () => void;
	collapseBelow: (value: TreeValue, opts?: { includeSelf?: boolean }) => void;

	// DOM
	rootRef: React.RefObject<HTMLDivElement | null>;
};

export type TreeItemContextValue = {
	value: TreeValue;
	level: number;
	disabled: boolean;
	registerContent: () => void;
	expandable: boolean;
	itemId: string;
	groupId: string;
};

export type RootProps = React.HTMLAttributes<HTMLDivElement> & {
	selectionMode?: TreeSelectionMode;
	tabBehavior?: TreeTabBehavior;

	// selection controlled/uncontrolled
	selectedValue?: string | null; // single
	defaultSelectedValue?: string | null;
	onSelectedValueChange?: (value: string | null) => void;

	selectedValues?: string[]; // multiple
	defaultSelectedValues?: string[];
	onSelectedValuesChange?: (values: string[]) => void;

	// expansion controlled/uncontrolled (optional)
	expandedValues?: string[];
	defaultExpandedValues?: string[];
	onExpandedValuesChange?: (values: string[]) => void;

	// active controlled/uncontrolled (optional)
	/** Controlled active (roving focus) value */
	activeValue?: string | null;
	/** Uncontrolled initial active value */
	defaultActiveValue?: string | null;
	/** Fired whenever active item changes (focus moves) */
	onActiveValueChange?: (value: string) => void;
};

export type ItemProps = React.PropsWithChildren<{
	value: string;
	disabled?: boolean;
}>;

export type RowProps = React.HTMLAttributes<HTMLDivElement> & {
	onAction?: (value: string) => void;
	onToggleExpand?: (value: string, nextExpanded: boolean) => void;
};

export type ContentProps = React.HTMLAttributes<HTMLDivElement> & {
	forceMount?: boolean;
};

export type TitleProps = React.HTMLAttributes<HTMLElement> & {
	asChild?: boolean;
	/**
	 * Optional stable string for typeahead.
	 * If provided, we attach it to the nearest treeitem as `data-text-value`.
	 */
	textValue?: string;
};

export type ActionsProps = React.HTMLAttributes<HTMLElement> & { asChild?: boolean };
export type IconProps = React.HTMLAttributes<HTMLElement> & { asChild?: boolean };
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean };
export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { asChild?: boolean };

/**
 * Checkbox is a headless convenience that toggles selection in multiple mode.
 * In single mode it selects.
 */
export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "defaultChecked"> & {
	asChild?: boolean;
};

export type TreeToggleCommand =
	| { type: "expand"; item: string }
	| { type: "collapse"; item: string }
	| { type: "expandBelow"; item: string; includeSelf?: boolean }
	| { type: "collapseBelow"; item: string; includeSelf?: boolean }
	| { type: "expandAll" }
	| { type: "collapseAll" };