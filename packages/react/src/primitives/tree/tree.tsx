"use client";

import * as React from "react";
import { Slot } from "@/primitives/slot/index.js";

import {
	TreeItemContext,
	TreeRootContext,
	useTreeItemContext,
	useTreeItemState,
	useTreeRootContext,
	useTreeRootState,
	useTreeRowInteractions,
} from "./tree.hooks.js";
import type {
	TreeItemActionsProps,
	TreeItemButtonProps,
	TreeItemCheckboxProps,
	TreeContentProps,
	TreeItemIconProps,
	TreeItemProps,
	TreeItemLinkProps,
	TreeRootProps,
	TreeRowProps,
	TreeItemTitleProps,
} from "./tree.types.js";

export type { TreeSelectionMode, TreeTabBehavior } from "./tree.types.js";
export type {
	TreeRootProps,
	TreeItemProps,
	TreeRowProps,
	TreeContentProps,
	TreeItemTitleProps,
	TreeItemActionsProps,
	TreeItemCheckboxProps,
	TreeItemButtonProps,
	TreeItemIconProps,
	TreeItemLinkProps,
} from "./tree.types.js";

/* -------------------------------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------------------------------- */

function TreeRoot(props: TreeRootProps) {
	const {
		// tree-only props (DO NOT forward to DOM)
		selectionMode,
		tabBehavior,
		selectedValue,
		defaultSelectedValue,
		onSelectedValueChange,
		selectedValues,
		defaultSelectedValues,
		onSelectedValuesChange,
		expandedValues,
		defaultExpandedValues,
		onExpandedValuesChange,
		activeValue,
		defaultActiveValue,
		onActiveValueChange,

		// DOM props
		...domProps
	} = props;

	const { rootRef, ctx } = useTreeRootState({
		selectionMode,
		tabBehavior,
		selectedValue,
		defaultSelectedValue,
		onSelectedValueChange,
		selectedValues,
		defaultSelectedValues,
		onSelectedValuesChange,
		expandedValues,
		defaultExpandedValues,
		onExpandedValuesChange,
		activeValue,
		defaultActiveValue,
		onActiveValueChange,
	});

	return (
		<TreeRootContext.Provider value={ctx}>
			<div
				{...domProps}
				ref={rootRef}
				role="tree"
				// whatever else you set here…
			/>
		</TreeRootContext.Provider>
	);
}

/* -------------------------------------------------------------------------------------------------
 * Item
 * ------------------------------------------------------------------------------------------------- */

function TreeItem({ value, disabled = false, children }: TreeItemProps) {
	const ctx = useTreeItemState({ value, disabled });
	return <TreeItemContext.Provider value={ctx}>{children}</TreeItemContext.Provider>;
}

/* -------------------------------------------------------------------------------------------------
 * Row (focusable treeitem)
 * ------------------------------------------------------------------------------------------------- */

const TreeRow = React.forwardRef<HTMLDivElement, TreeRowProps>(function Row({ onAction, onToggleExpand, onKeyDown, onClick, ...props }, ref) {
	const root = useTreeRootContext();
	const item = useTreeItemContext();

	const selected = root.isSelected(item.value);
	const expanded = root.isExpanded(item.value);

	const {
		tabIndex,
		onFocus,
		onKeyDown: handleKeyDownRow,
		onClick: handleClickRow,
	} = useTreeRowInteractions({
		root,
		item,
		onAction,
		onToggleExpand,
		onKeyDown,
		onClick,
		tabIndexProp: props.tabIndex,
	});

	return (
		<div
			{...props}
			ref={ref}
			role="treeitem"
			id={item.itemId}
			aria-level={item.level}
			aria-selected={selected ? true : undefined}
			aria-expanded={item.expandable ? expanded : undefined}
			aria-controls={item.expandable ? item.groupId : undefined}
			aria-disabled={item.disabled ? "true" : undefined}
			data-disabled={item.disabled ? "" : undefined}
			data-treeitem="true"
			data-value={item.value}
			data-state={item.expandable ? (expanded ? "open" : "closed") : undefined}
			tabIndex={tabIndex}
			onFocus={onFocus}
			onClick={handleClickRow}
			onKeyDown={handleKeyDownRow}
		/>
	);
});

/* -------------------------------------------------------------------------------------------------
 * Content (role=group)
 * ------------------------------------------------------------------------------------------------- */

const TreeContent = React.forwardRef<HTMLDivElement, TreeContentProps>(function Content({ forceMount, children, ...props }, ref) {
	const root = useTreeRootContext();
	const item = useTreeItemContext();

	React.useEffect(() => {
		item.registerContent();
	}, [item]);

	const expanded = root.isExpanded(item.value);

	if (!forceMount && !expanded) return null;

	// If forceMounted but collapsed, mark it as hidden so SR + keyboard utils ignore descendants.
	const hidden = !expanded;

	return (
		<div
			{...props}
			ref={ref}
			role="group"
			id={item.groupId}
			hidden={hidden || undefined}
			aria-hidden={hidden ? "true" : undefined}
			data-slot="tree-content"
		>
			{children}
		</div>
	);
});

/* -------------------------------------------------------------------------------------------------
 * Row sub-primitives (headless slots) - REF-LESS to avoid polymorphic ref type conflicts
 * ------------------------------------------------------------------------------------------------- */

function TreeItemTitle({ asChild, textValue, ...props }: TreeItemTitleProps) {
	const Comp = asChild ? Slot : "span";

	return (
		<Comp
			{...(props as React.HTMLAttributes<HTMLElement>)}
			data-slot="tree-title"
			data-tree-title-marker={textValue ? "true" : undefined}
			data-text-value={textValue ? textValue.trim().toLowerCase() : undefined}
		/>
	);
}

function TreeItemActions({ asChild, ...props }: TreeItemActionsProps) {
	const Comp = asChild ? Slot : "span";
	return <Comp {...(props as React.HTMLAttributes<HTMLElement>)} data-slot="tree-actions" />;
}

function TreeItemIcon({ asChild, ...props }: TreeItemIconProps) {
	const Comp = asChild ? Slot : "span";
	return <Comp {...(props as React.HTMLAttributes<HTMLElement>)} data-slot="tree-icon" />;
}

function TreeItemButton({ asChild, type, ...props }: TreeItemButtonProps) {
	if (asChild) {
		return <Slot {...(props as unknown as React.HTMLAttributes<HTMLElement>)} data-slot="tree-button" />;
	}
	return <button {...props} type={type ?? "button"} data-slot="tree-button" />;
}

function TreeItemLink({ asChild, ...props }: TreeItemLinkProps) {
	if (asChild) {
		return <Slot {...(props as unknown as React.HTMLAttributes<HTMLElement>)} data-slot="tree-link" />;
	}
	return <a {...props} data-slot="tree-link" />;
}

function TreeItemCheckbox({ asChild, onChange, onClick, ...props }: TreeItemCheckboxProps) {
	const root = useTreeRootContext();
	const item = useTreeItemContext();

	const checked = root.isSelected(item.value);

	const toggle = () => {
		if (root.selectionMode === "multiple") root.toggleSelect(item.value);
		else root.select(item.value);
	};

	if (asChild) {
		return (
			<Slot
				{...(props as unknown as React.HTMLAttributes<HTMLElement>)}
				data-slot="tree-checkbox"
				onClick={(e: React.MouseEvent) => {
					e.preventDefault();
					e.stopPropagation();
					toggle();
					onClick?.(e as unknown as React.MouseEvent<HTMLInputElement>);
				}}
			/>
		);
	}

	return (
		<input
			{...props}
			data-slot="tree-checkbox"
			type="checkbox"
			checked={checked}
			onChange={(e) => {
				onChange?.(e);
				toggle();
			}}
			onClick={(e) => {
				e.stopPropagation();
				onClick?.(e);
			}}
		/>
	);
}

/* -------------------------------------------------------------------------------------------------
 * Exports
 * ------------------------------------------------------------------------------------------------- */

export { TreeRoot, TreeItem, TreeRow, TreeContent, TreeItemTitle, TreeItemActions, TreeItemCheckbox, TreeItemButton, TreeItemIcon, TreeItemLink };
