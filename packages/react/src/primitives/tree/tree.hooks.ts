"use client";
import * as React from "react";

import type { TreeRootProps, TreeItemContextValue, TreeRootContextValue, TreeToggleCommand } from "./tree.types.js";
import { isPrintableKey } from "./utils/dom/isPrintableKey/isPrintableKey.js";
import { nextIndex } from "./utils/dom/nextIndex/nextIndex.js";
import { findByValue } from "./utils/dom/findByValue/findByValue.js";
import { isDisabled } from "./utils/dom/isDisabled/isDisabled.js";
import { focusEl } from "./utils/dom/focusEl/focusEl.js";
import { containsActiveElement } from "./utils/dom/containActiveElement/index.js";
import { getAllExpandableTreeItemEls } from "./utils/dom/getAllExpandableTreeItems/getAllExpandableTreeItemEls.js";
import { isInHiddenGroup } from "./utils/dom/isInHiddenGroup/index.js";
import { getVisibleTreeItemEls } from "./utils/dom/getVisibleTreeItemEls/index.js";
import { firstChildTreeItem } from "./utils/dom/firstChildTreeItem/firstChildTreeItem.js";
import { parentTreeItem } from "./utils/dom/parentTreeItem/parentTreeItem.js";
import { focusTypeahead } from "./utils/typeahead/focusTypeahead/focusTypeahead.js";
import { addToggleListener } from "./utils/events/addToggleListener/addToggleListener.js";

const TreeRootContext = React.createContext<TreeRootContextValue | null>(null);
const TreeItemContext = React.createContext<TreeItemContextValue | null>(null);

function useTreeRootContext() {
	const ctx = React.useContext(TreeRootContext);
	if (!ctx) throw new Error("Tree primitives must be used within <Tree.Root>.");
	return ctx;
}

function useTreeItemContext() {
	const ctx = React.useContext(TreeItemContext);
	if (!ctx) throw new Error("Tree.Item primitives must be used within <Tree.Item>.");
	return ctx;
}

function useTreeToggle() {
	const root = useTreeRootContext();

	return React.useCallback(
		(cmd: TreeToggleCommand) => {
			switch (cmd.type) {
				case "expand":
					root.setExpanded(cmd.item, true);
					return;

				case "collapse":
					root.setExpanded(cmd.item, false);
					return;

				case "expandBelow":
					root.expandBelow(cmd.item, { includeSelf: cmd.includeSelf ?? true });
					return;

				case "collapseBelow":
					root.collapseBelow(cmd.item, { includeSelf: cmd.includeSelf ?? true });
					return;

				case "expandAll":
					root.expandAll();
					return;

				case "collapseAll":
					root.collapseAll();
					return;

				default: {
					// Exhaustive check
					const _exhaustive: never = cmd;
					return _exhaustive;
				}
			}
		},
		[root]
	);
}

function isInteractiveTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;

	// Anything that should handle its own clicks should not cause row selection.
	// This covers native controls + common ARIA patterns + "asChild" triggers.
	return Boolean(
		target.closest(
			[
				"button",
				"a",
				"input",
				"select",
				"textarea",
				"[role='button']",
				"[role='checkbox']",
				"[role='switch']",
				"[role='radio']",
				"[role='combobox']",
				"[role='menuitem']",
				"[role='menuitemcheckbox']",
				"[role='menuitemradio']",
				"[data-prevent-tree-row-select='true']",
			].join(",")
		)
	);
}

function getPrimaryAction(rowEl: HTMLElement | null): HTMLElement | null {
	if (!rowEl) return null;

	// Prefer explicit marker
	const marked = rowEl.querySelector<HTMLElement>('[data-tree-primary-action="true"]');
	if (marked) return marked;

	// Fallback: first link in the row (optional)
	return rowEl.querySelector<HTMLElement>('a,[role="link"]');
}
function getGroupElementForValue(treeEl: HTMLElement | null, value: string): HTMLElement | null {
	const rowEl = findByValue(treeEl, value);
	if (!rowEl) return null;

	const groupId = rowEl.getAttribute("aria-controls");
	if (!groupId) return null;

	return document.getElementById(groupId);
}

function getDescendantValues(treeEl: HTMLElement | null, value: string): string[] {
	const groupEl = getGroupElementForValue(treeEl, value);
	if (!groupEl) return [];

	// Only treeitems inside this group's subtree
	const els = Array.from(groupEl.querySelectorAll<HTMLElement>('[role="treeitem"][data-value]'));
	return els.map((el) => el.getAttribute("data-value")).filter(Boolean) as string[];
}

function useTreeRootState(
	props: Pick<
		TreeRootProps,
		| "selectionMode"
		| "tabBehavior"
		| "selectedValue"
		| "defaultSelectedValue"
		| "onSelectedValueChange"
		| "selectedValues"
		| "defaultSelectedValues"
		| "onSelectedValuesChange"
		| "expandedValues"
		| "defaultExpandedValues"
		| "onExpandedValuesChange"
		| "activeValue"
		| "defaultActiveValue"
		| "onActiveValueChange"
	>
): { rootRef: React.RefObject<HTMLDivElement | null>; ctx: TreeRootContextValue } {
	const selectionMode = props.selectionMode ?? "single";
	const tabBehavior = props.tabBehavior ?? "roam";

	const rootRef = React.useRef<HTMLDivElement | null>(null);

	const selectedValue = props.selectedValue;
	const defaultSelectedValue = props.defaultSelectedValue ?? null;
	const onSelectedValueChange = props.onSelectedValueChange;

	const selectedValues = props.selectedValues;
	const defaultSelectedValues = props.defaultSelectedValues ?? [];
	const onSelectedValuesChange = props.onSelectedValuesChange;

	const expandedValues = props.expandedValues;
	const defaultExpandedValues = props.defaultExpandedValues ?? [];
	const onExpandedValuesChange = props.onExpandedValuesChange;

	const controlledActiveValue = props.activeValue;
	const defaultActiveValue = props.defaultActiveValue ?? null;
	const onActiveValueChange = props.onActiveValueChange;

	const isMultiple = selectionMode === "multiple";

	const [uncontrolledSelectedSingle, setUncontrolledSelectedSingle] = React.useState<string | null>(defaultSelectedValue);
	const [uncontrolledSelectedMulti, setUncontrolledSelectedMulti] = React.useState<Set<string>>(() => new Set(defaultSelectedValues));

	const selectedSet: Set<string> = React.useMemo(() => {
		if (isMultiple) {
			if (Array.isArray(selectedValues)) return new Set(selectedValues);
			return uncontrolledSelectedMulti;
		}

		const v = typeof selectedValue === "string" ? selectedValue : uncontrolledSelectedSingle;
		return v ? new Set([v]) : new Set();
	}, [isMultiple, selectedValues, uncontrolledSelectedMulti, selectedValue, uncontrolledSelectedSingle]);

	const commitSelected = React.useCallback(
		(next: Set<string>) => {
			if (isMultiple) {
				if (!Array.isArray(selectedValues)) setUncontrolledSelectedMulti(new Set(next));
				onSelectedValuesChange?.(Array.from(next));
			} else {
				const v = next.values().next().value ?? null;
				if (typeof selectedValue !== "string") setUncontrolledSelectedSingle(v);
				onSelectedValueChange?.(v);
			}
		},
		[isMultiple, selectedValues, onSelectedValuesChange, selectedValue, onSelectedValueChange]
	);

	const [uncontrolledExpanded, setUncontrolledExpanded] = React.useState<Set<string>>(() => new Set(defaultExpandedValues));

	const expandedSet = React.useMemo(() => {
		return Array.isArray(expandedValues) ? new Set(expandedValues) : uncontrolledExpanded;
	}, [expandedValues, uncontrolledExpanded]);

	const commitExpanded = React.useCallback(
		(next: Set<string>) => {
			if (!Array.isArray(expandedValues)) setUncontrolledExpanded(new Set(next));
			onExpandedValuesChange?.(Array.from(next));
		},
		[expandedValues, onExpandedValuesChange]
	);

	// ✅ Active (roving) controlled/uncontrolled
	const [uncontrolledActive, setUncontrolledActive] = React.useState<string | null>(defaultActiveValue);

	const activeValue = typeof controlledActiveValue === "string" ? controlledActiveValue : uncontrolledActive;

	const setActiveValue = React.useCallback(
		(v: string) => {
			if (typeof controlledActiveValue !== "string") setUncontrolledActive(v);
			onActiveValueChange?.(v);
		},
		[controlledActiveValue, onActiveValueChange]
	);

	const focusValue = React.useCallback(
		(v: string) => {
			const el = findByValue(rootRef.current, v);
			if (!el) return;
			if (isDisabled(el)) return;

			setActiveValue(v);
			queueMicrotask(() => focusEl(el));
		},
		[setActiveValue]
	);

	const isSelected = React.useCallback((v: string) => selectedSet.has(v), [selectedSet]);

	const select = React.useCallback(
		(v: string, opts?: { additive?: boolean }) => {
			const additive = Boolean(opts?.additive);

			if (!isMultiple) {
				commitSelected(new Set([v]));
				return;
			}

			const next = new Set(selectedSet);

			if (!additive) {
				next.clear();
				next.add(v);
			} else {
				next.add(v);
			}

			commitSelected(next);
		},
		[isMultiple, selectedSet, commitSelected]
	);

	const toggleSelect = React.useCallback(
		(v: string) => {
			if (!isMultiple) {
				commitSelected(new Set([v]));
				return;
			}
			const next = new Set(selectedSet);
			if (next.has(v)) next.delete(v);
			else next.add(v);
			commitSelected(next);
		},
		[isMultiple, selectedSet, commitSelected]
	);

	const isExpanded = React.useCallback((v: string) => expandedSet.has(v), [expandedSet]);

	const setExpanded = React.useCallback(
		(v: string, next: boolean) => {
			const set = new Set(expandedSet);
			if (next) set.add(v);
			else set.delete(v);

			// If collapsing while focus is inside descendants, move focus back to controller.
			if (!next) {
				const treeEl = rootRef.current;
				const rowEl = findByValue(treeEl, v);
				const groupId = rowEl?.getAttribute("aria-controls");
				const groupEl = groupId ? document.getElementById(groupId) : null;

				if (groupEl && containsActiveElement(groupEl)) {
					setActiveValue(v);
					queueMicrotask(() => focusEl(rowEl));
				}
			}

			commitExpanded(set);
		},
		[expandedSet, commitExpanded, setActiveValue]
	);

	const toggleExpanded = React.useCallback(
		(v: string) => {
			setExpanded(v, !expandedSet.has(v));
		},
		[expandedSet, setExpanded]
	);

	const collapseAll = React.useCallback(() => {
		// If active focus is inside any expanded subtree, best-effort move to current active row
		// (or first visible) after collapse.
		const treeEl = rootRef.current;

		commitExpanded(new Set());
	}, [commitExpanded]);

	const expandAll = React.useCallback(() => {
		const treeEl = rootRef.current;
		if (!treeEl) return;

		const allExpandableEls = getAllExpandableTreeItemEls(treeEl);
		const allValues = allExpandableEls.map((el) => el.getAttribute("data-value")).filter(Boolean) as string[];

		commitExpanded(new Set(allValues));
	}, [commitExpanded]);

	const collapseBelow = React.useCallback(
		(value: string, opts?: { includeSelf?: boolean }) => {
			const treeEl = rootRef.current;

			const descendants = new Set(getDescendantValues(treeEl, value));
			const next = new Set(expandedSet);

			// Remove descendants from expanded set
			for (const v of descendants) next.delete(v);

			// Optionally also collapse the node itself
			if (opts?.includeSelf) next.delete(value);

			// If focus is currently inside the collapsed subtree, move it to the controlling row.
			const groupEl = getGroupElementForValue(treeEl, value);
			if (groupEl && containsActiveElement(groupEl)) {
				setActiveValue(value);
				const rowEl = findByValue(treeEl, value);
				queueMicrotask(() => focusEl(rowEl));
			}

			commitExpanded(next);
		},
		[expandedSet, commitExpanded, setActiveValue]
	);

	const expandBelow = React.useCallback(
		(value: string, opts?: { includeSelf?: boolean }) => {
			const treeEl = rootRef.current;
			const descendants = getDescendantValues(treeEl, value);
			const next = new Set(expandedSet);
			if (opts?.includeSelf) next.add(value);
			for (const v of descendants) next.add(v);
			commitExpanded(next);
		},
		[expandedSet, commitExpanded]
	);

	// ✅ Initialize roving focus target
	React.useEffect(() => {
		if (tabBehavior !== "roam") return;
		if (activeValue != null) return;

		const treeEl = rootRef.current;
		const visible = getVisibleTreeItemEls(treeEl, { includeDisabled: false });

		const firstSelected = (() => {
			for (const v of selectedSet) {
				const el = findByValue(treeEl, v);
				if (el && !isInHiddenGroup(el) && !isDisabled(el)) return v;
			}
			return null;
		})();

		const fallback = visible[0]?.getAttribute("data-value") ?? null;
		const initial = firstSelected ?? fallback;

		if (initial) setActiveValue(initial);
	}, [tabBehavior, activeValue, selectedSet, setActiveValue]);

	const ctx = React.useMemo<TreeRootContextValue>(
		() => ({
			selectionMode,
			tabBehavior,

			selected: selectedSet,
			isSelected,
			select,
			toggleSelect,

			isExpanded,
			setExpanded,
			toggleExpanded,

			activeValue,
			setActiveValue,
			focusValue,

			expandAll,
			expandBelow,
			collapseAll,
			collapseBelow,

			rootRef,
		}),
		[
			selectionMode,
			tabBehavior,
			selectedSet,
			isSelected,
			select,
			toggleSelect,
			isExpanded,
			setExpanded,
			toggleExpanded,
			activeValue,
			setActiveValue,
			focusValue,
		]
	);

	return { rootRef, ctx };
}

function useTreeItemState({ value, disabled }: { value: string; disabled: boolean }): TreeItemContextValue {
	const parent = React.useContext(TreeItemContext);
	const level = (parent?.level ?? 0) + 1;

	const itemId = React.useId();
	const groupId = React.useId();

	const [expandable, setExpandable] = React.useState(false);

	const registerContent = React.useCallback(() => {
		setExpandable(true);
	}, []);

	return React.useMemo<TreeItemContextValue>(
		() => ({
			value,
			level,
			disabled,
			expandable,
			registerContent,
			itemId,
			groupId,
		}),
		[value, level, disabled, expandable, registerContent, itemId, groupId]
	);
}

function useTreeRowInteractions(args: {
	root: TreeRootContextValue;
	item: TreeItemContextValue;
	onAction?: (value: string) => void;
	onToggleExpand?: (value: string, nextExpanded: boolean) => void;
	onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
	onClick?: React.MouseEventHandler<HTMLDivElement>;
	tabIndexProp?: number;
}): {
	tabIndex: number | undefined;
	onFocus: React.FocusEventHandler<HTMLDivElement>;
	onKeyDown: React.KeyboardEventHandler<HTMLDivElement>;
	onClick: React.MouseEventHandler<HTMLDivElement>;
} {
	const { root, item, onAction, onToggleExpand, onKeyDown: onKeyDownProp, onClick: onClickProp } = args;

	const expanded = root.isExpanded(item.value);
	const isActive = root.tabBehavior === "roam" ? root.activeValue === item.value : false;

	const tabIndex = root.tabBehavior === "roam" ? (isActive ? 0 : -1) : (args.tabIndexProp ?? 0);

	const queryRef = React.useRef<{ buf: string; t: number | null }>({ buf: "", t: null });

	React.useEffect(() => {
		return () => {
			if (queryRef.current.t != null) window.clearTimeout(queryRef.current.t);
		};
	}, []);

	const handleToggleExpand = React.useCallback(() => {
		if (!item.expandable) return;
		const next = !root.isExpanded(item.value);
		root.setExpanded(item.value, next);
		onToggleExpand?.(item.value, next);
	}, [item.expandable, item.value, onToggleExpand, root]);

	const handleAction = React.useCallback(() => {
		onAction?.(item.value);
	}, [item.value, onAction]);

	const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = React.useCallback(
		(e) => {
			const treeEl = root.rootRef.current;
			const visible = getVisibleTreeItemEls(treeEl, { includeDisabled: false });
			const currentEl = findByValue(treeEl, item.value);
			const idx = currentEl ? visible.indexOf(currentEl) : -1;

			if (e.key === "ArrowDown") {
				e.preventDefault();
				const nextEl = visible[nextIndex(idx, 1, visible.length)];
				const v = nextEl?.getAttribute("data-value");
				if (v) root.focusValue(v);
				return;
			}

			if (e.key === "ArrowUp") {
				e.preventDefault();
				const nextEl = visible[nextIndex(idx, -1, visible.length)];
				const v = nextEl?.getAttribute("data-value");
				if (v) root.focusValue(v);
				return;
			}

			if (e.key === "Home") {
				e.preventDefault();
				const first = visible[0]?.getAttribute("data-value");
				if (first) root.focusValue(first);
				return;
			}

			if (e.key === "End") {
				e.preventDefault();
				const last = visible[visible.length - 1]?.getAttribute("data-value");
				if (last) root.focusValue(last);
				return;
			}

			if (e.key === "ArrowRight") {
				if (!treeEl || !currentEl) return;

				// APG: Right = expand closed node; if already open, move to first child.
				if (item.expandable && !expanded) {
					e.preventDefault();
					handleToggleExpand();
					return;
				}

				if (item.expandable && expanded) {
					e.preventDefault();
					const child = firstChildTreeItem(currentEl);
					const v = child?.getAttribute("data-value") ?? null;
					if (v) root.focusValue(v);
					return;
				}

				return;
			}

			if (e.key === "ArrowLeft") {
				if (!treeEl || !currentEl) return;

				// APG: Left = collapse open node; if already closed (or leaf), move to parent.
				if (item.expandable && expanded) {
					e.preventDefault();
					handleToggleExpand();
					return;
				}

				e.preventDefault();
				const parentTreeItemEl = parentTreeItem(currentEl);
				const v = parentTreeItemEl?.getAttribute("data-value");
				if (v) root.focusValue(v);
				return;
			}

			// Space: selection (APG)
			if (e.key === " ") {
				e.preventDefault();
				if (root.selectionMode === "multiple") root.toggleSelect(item.value);
				else root.select(item.value);
				return;
			}

			// Enter: activate/action (APG)
			if (e.key === "Enter") {
				e.preventDefault();

				// Reasonable default: in single mode, Enter also selects before action.
				if (root.selectionMode === "single") root.select(item.value);

				handleAction();
				return;
			}

			if (isPrintableKey(e)) {
				const s = queryRef.current;
				s.buf += e.key.toLowerCase();
				if (s.t != null) window.clearTimeout(s.t);
				s.t = window.setTimeout(() => {
					s.buf = "";
					s.t = null;
				}, 500);

				focusTypeahead(treeEl, s.buf);
				return;
			}

			onKeyDownProp?.(e);
		},
		[expanded, handleAction, handleToggleExpand, item.expandable, item.value, onKeyDownProp, root]
	);

	const onFocus: React.FocusEventHandler<HTMLDivElement> = React.useCallback(() => {
		if (root.tabBehavior === "roam") root.setActiveValue(item.value);
	}, [item.value, root]);

	const onClick: React.MouseEventHandler<HTMLDivElement> = React.useCallback(
		(e) => {
			if (item.disabled) {
				e.preventDefault();
				e.stopPropagation();
				return;
			}

			// If click originated from an interactive descendant, don't treat as row click.
			if (isInteractiveTarget(e.target)) {
				if (root.tabBehavior === "roam") root.setActiveValue(item.value);
				onClickProp?.(e);
				return;
			}

			// Otherwise, treat row click as:
			// 1) Activate primary action (link) if present
			// 2) Else, normal selection behavior
			const treeEl = root.rootRef.current;
			const rowEl = treeEl ? findByValue(treeEl, item.value) : null;

			if (root.tabBehavior === "roam") root.setActiveValue(item.value);

			const primary = getPrimaryAction(rowEl);

			if (primary) {
				// Clicking empty space in row should trigger the link/button
				// without turning the row-click into a selection click.
				(primary as HTMLElement).click();
				onClickProp?.(e);
				return;
			}

			// No primary action: fall back to selection rules
			if (root.selectionMode === "single") {
				root.select(item.value);
			}

			onClickProp?.(e);
		},
		[item.disabled, item.value, onClickProp, root]
	);

	React.useEffect(() => {
		const treeEl = root.rootRef.current;
		const rowEl = findByValue(treeEl, item.value);
		if (!rowEl) return;

		const remove = addToggleListener(rowEl, (ev) => {
			if (item.disabled) return;
			if (!item.expandable) return;

			ev.preventDefault?.();
			ev.stopPropagation?.();

			const next = !root.isExpanded(item.value);
			root.setExpanded(item.value, next);
			onToggleExpand?.(item.value, next);
		});

		return remove;
	}, [item.disabled, item.expandable, item.value, onToggleExpand, root]);

	return { tabIndex: item.disabled ? undefined : tabIndex, onFocus, onKeyDown, onClick };
}

export {
	TreeRootContext,
	TreeItemContext,
	useTreeRootContext,
	useTreeItemContext,
	useTreeRootState,
	useTreeItemState,
	useTreeRowInteractions,
	useTreeToggle,
};
