"use client";

import * as React from "react";
import * as TreePrimitive from "@haitch/react-tree";
import { IconChevronRight } from "@tabler/icons-react";

import { cn } from "../lib/cn";
import { Button } from "./button";

/**
 * Root
 */
function Tree({ className, children, ...props }: React.ComponentProps<typeof TreePrimitive.Root>) {
	return (
		<TreePrimitive.Root data-slot="tree" className={cn("text-foreground", className)} {...props}>
			{children}
		</TreePrimitive.Root>
	);
}

/**
 * Item
 */
function TreeItem({ children, ...props }: React.ComponentProps<typeof TreePrimitive.Item>) {
	return (
		<TreePrimitive.Item data-slot="tree-item" {...props}>
			{children}
		</TreePrimitive.Item>
	);
}

/**
 * Row (focusable treeitem)
 *
 * We keep this as your main interactive row. Buttons/links inside remain possible,
 * but the row itself is the focus target for roving tabindex.
 */
function TreeItemRow({ className, children, ...props }: React.ComponentProps<typeof TreePrimitive.Row>) {
	const root = TreePrimitive.useTreeRootContext();
	const item = TreePrimitive.useTreeItemContext();

	const active = root.activeValue === item.value;
	return (
		<TreePrimitive.Row
			data-slot="tree-item-row"
			data-active={active ? "true" : "false"}
			className={cn(
				"group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none",
				"hover:bg-accent/50 focus:bg-accent focus:text-accent-foreground",
				"data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
				className
			)}
			{...props}
		>
			{children}
		</TreePrimitive.Row>
	);
}

/**
 * Toggle button
 *
 * Handles expanding/collapsing tree items
 */
function TreeItemToggle({ className, onClick, "aria-label": ariaLabel, ...props }: React.ComponentProps<"button">) {
	const root = TreePrimitive.useTreeRootContext();
	const item = TreePrimitive.useTreeItemContext();

	// no children -> no toggle affordance
	if (!item.expandable) return null;

	const expanded = root.isExpanded(item.value);

	return (
		<button
			type="button"
			data-slot="tree-item-toggle"
			aria-label={ariaLabel ?? (expanded ? "Collapse" : "Expand")}
			aria-controls={item.groupId}
			aria-expanded={expanded}
			className={cn(
				"text-muted-foreground hover:text-foreground inline-flex size-6 shrink-0 items-center justify-center rounded-sm",
				"focus-visible:border-ring focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]",
				// rotate when the *row* is open (row has data-state)
				"group-data-[state=open]:rotate-90 transition-transform",
				className
			)}
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				root.toggleExpanded(item.value);
				onClick?.(e);
			}}
			{...props}
		>
			<IconChevronRight className="size-4" />
		</button>
	);
}

/**
 * Content (role=group)
 */
function TreeItemContent({ className, children, ...props }: React.ComponentProps<typeof TreePrimitive.Content>) {
	return (
		<TreePrimitive.Content data-slot="tree-item-content" className={cn("ml-4.75 border-l border-border pl-2", className)} {...props}>
			{children}
		</TreePrimitive.Content>
	);
}

/**
 * Title
 */
function TreeItemTitle({ className, children, ...props }: React.ComponentProps<typeof TreePrimitive.Title>) {
	return (
		<TreePrimitive.Title data-slot="tree-item-title" className={cn("min-w-0 flex-1 truncate", className)} {...props}>
			{children}
		</TreePrimitive.Title>
	);
}

/**
 * Actions container
 */
function TreeItemActions({ className, children, ...props }: React.ComponentProps<typeof TreePrimitive.Actions>) {
	return (
		<TreePrimitive.Actions data-slot="tree-item-actions" className={cn("ml-auto flex items-center gap-1", className)} {...props}>
			{children}
		</TreePrimitive.Actions>
	);
}

/**
 * Checkbox
 */
function TreeItemCheckbox({ className, children, ...props }: React.ComponentProps<typeof TreePrimitive.Checkbox>) {
	return (
		<TreePrimitive.Checkbox data-slot="tree-item-checkbox" className={cn("accent-primary size-4 shrink-0", className)} {...props}>
			{children}
		</TreePrimitive.Checkbox>
	);
}

/**
 * Button (headless primitive, styled here)
 */
function TreeItemButton({ className, children, ...props }: React.ComponentProps<typeof TreePrimitive.Button>) {
	return (
		<TreePrimitive.Button
			data-slot="tree-item-button"
			className={cn(
				"focus-visible:border-ring focus-visible:ring-ring/50 inline-flex items-center justify-center rounded-md px-2 py-1 text-sm outline-none focus-visible:ring-[3px] w-full",
				"hover:bg-accent hover:text-accent-foreground",
				className
			)}
			{...props}
		>
			{children}
		</TreePrimitive.Button>
	);
}

/**
 * Icon wrapper
 */
function TreeItemIcon({ className, children, ...props }: React.ComponentProps<typeof TreePrimitive.Icon>) {
	return (
		<TreePrimitive.Icon
			data-slot="tree-item-icon"
			className={cn("text-muted-foreground flex size-4 items-center justify-center", className)}
			{...props}
		>
			{children}
		</TreePrimitive.Icon>
	);
}

/**
 * Link (styled)
 */
function TreeItemLink({ className, ...props }: React.ComponentProps<typeof TreePrimitive.Link>) {
	return (
		<TreePrimitive.Link
			data-slot="tree-item-link"
			data-tree-primary-action="true"
			className={cn(
				"focus-visible:border-ring focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-md outline-none focus-visible:ring-[3px]",
				"text-primary hover:underline",
				className
			)}
			{...props}
		/>
	);
}

function useTreeToggle() {
	return TreePrimitive.useTreeToggle();
}

export type TreeToggleCommand = TreePrimitive.TreeToggleCommand;

export {
	Tree,
	TreeItem,
	TreeItemToggle,
	TreeItemRow,
	TreeItemContent,
	TreeItemTitle,
	TreeItemActions,
	TreeItemCheckbox,
	TreeItemButton,
	TreeItemIcon,
	TreeItemLink,
	useTreeToggle,
};
