import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { Positioning } from "../types";
import {
	autoUpdate,
	flip,
	offset,
	safePolygon,
	shift,
	useClick,
	useDismiss,
	useFloating,
	useFloatingNodeId,
	useFloatingParentNodeId,
	useFloatingTree,
	useHover,
	useInteractions,
	useListNavigation,
	useRole,
	useTypeahead,
	type VirtualElement,
} from "@floating-ui/react";
import { shallowEqual } from "../lib/shallowEqual";
import { toPlacement } from "../lib/toPlacement";
import type { Ctx } from "../context/types";

function virtualPoint(x: number, y: number, contextElement?: Element | null): VirtualElement {
	return {
		getBoundingClientRect: () => new DOMRect(x, y, 0, 0),
		// Floating UI uses this (if present) to resolve scroll containers, etc.
		contextElement: contextElement ?? undefined,
	};
}

export function useMenuInstance({
	open,
	defaultOpen = false,
	onOpenChange,
	modal = true,
	defaultPlacement,
}: {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	modal?: boolean;
	defaultPlacement: { root: Positioning; nested: Positioning };
}) {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
	const isOpen = open ?? uncontrolledOpen;

	const setIsOpen = useCallback(
		(next: boolean | ((prev: boolean) => boolean)) => {
			const value = typeof next === "function" ? next(isOpen) : next;
			onOpenChange?.(value);
			if (open === undefined) setUncontrolledOpen(value);
		},
		[isOpen, onOpenChange, open]
	);

	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const elementsRef = useRef<Array<HTMLElement | null>>([]);
	const labelsRef = useRef<Array<string | null>>([]);

	const tree = useFloatingTree();
	const reactId = useId();
	const nodeId = useFloatingNodeId() ?? reactId;
	const parentId = useFloatingParentNodeId();
	const isNested = parentId != null;

	const [positioning, setPositioningState] = useState<Positioning>(() => (isNested ? defaultPlacement.nested : defaultPlacement.root));

	useEffect(() => {
		setPositioningState((prev) => {
			const next = isNested ? defaultPlacement.nested : defaultPlacement.root;
			return shallowEqual(prev, next) ? prev : next;
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isNested]);

	const setPositioning = useCallback((next: Partial<Positioning>) => {
		setPositioningState((prev) => {
			const merged = { ...prev, ...next };
			return shallowEqual(prev, merged) ? prev : merged;
		});
	}, []);

	const placement = toPlacement(positioning.side, positioning.align);

	// Context menus should not "drift" with page scroll: fixed strategy.
	const strategy = useMemo(() => {
		// submenus can remain default; root context menus should be fixed.
		if (!isNested) return "fixed" as const;
		return "absolute" as const;
	}, [isNested]);

	const { floatingStyles, refs, context, isPositioned } = useFloating<HTMLElement>({
		nodeId,
		open: isOpen,
		onOpenChange: setIsOpen,
		placement,
		strategy,
		middleware: [
			offset({
				mainAxis: positioning.sideOffset,
				alignmentAxis: positioning.alignOffset,
			}),
			flip(),
			shift({ padding: positioning.collisionPadding }),
		],
		whileElementsMounted: autoUpdate,
		transform: false,
	});

	const hover = useHover(context, {
		enabled: isNested,
		delay: { open: 75 },
		handleClose: safePolygon({ blockPointerEvents: true }),
	});

	// Disable click-to-open for root when acting as context menu.
	const click = useClick(context, {
		enabled: false,
		event: "mousedown",
		toggle: !isNested,
		ignoreMouse: isNested,
	});

	const role = useRole(context, { role: "menu" });

	const dismiss = useDismiss(context, {
		bubbles: true,
		// Context menus should close on any pointerdown outside (including right click).
		outsidePressEvent: "pointerdown",
	});

	const listNavigation = useListNavigation(context, {
		listRef: elementsRef,
		activeIndex,
		nested: isNested,
		onNavigate: setActiveIndex,
		focusItemOnHover: true,
	});

	const typeahead = useTypeahead(context, {
		listRef: labelsRef,
		onMatch: isOpen ? setActiveIndex : undefined,
		activeIndex,
	});

	const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([hover, click, role, dismiss, listNavigation, typeahead]);

	// NEW: open at a screen point via a virtual reference (pointer coords)
	const openAtPoint = useCallback(
		(triggerEl: HTMLElement, x: number, y: number) => {
			refs.setReference(triggerEl);
			refs.setPositionReference(virtualPoint(x, y, triggerEl));
			setIsOpen(true);
		},
		[refs, setIsOpen]
	);

	useEffect(() => {
		if (!tree) return;

		function handleTreeClick() {
			setIsOpen(false);
		}

		function onSubOpen(event: { nodeId: string; parentId: string | null }) {
			if (event.nodeId !== nodeId && event.parentId === parentId) {
				setIsOpen(false);
			}
		}

		tree.events.on("click", handleTreeClick);
		tree.events.on("menuopen", onSubOpen);

		return () => {
			tree.events.off("click", handleTreeClick);
			tree.events.off("menuopen", onSubOpen);
		};
	}, [tree, nodeId, parentId, setIsOpen]);

	useEffect(() => {
		if (isOpen && tree) {
			tree.events.emit("menuopen", { parentId, nodeId });
		}
	}, [tree, isOpen, nodeId, parentId]);

	const ctx: Ctx = {
		isOpen,
		setIsOpen,
		activeIndex,
		setActiveIndex,
		modal: !!modal,
		refs,
		floatingStyles,
		context,
		getReferenceProps,
		getFloatingProps,
		getItemProps,
		elementsRef,
		labelsRef,
		isNested,
		nodeId,
		parentId,
		tree,
		positioning,
		setPositioning,

		// NEW
		openAtPoint,
		isPositioned,
	};

	return ctx;
}
