import * as React from "react";
import { forwardRef } from "react";
import type { SubContentProps } from "../types";
import { useSubCtx } from "./useSubContext";
import {
	FloatingFocusManager,
	FloatingList,
	FloatingPortal,
	useMergeRefs,
} from "@floating-ui/react";
import { RootContext } from "../context/rootContext";
import { composeEventHandlers } from "../lib/composeEventHandlers";
import { getUiRootFromReference } from "../portal";

export const SubContent = forwardRef<HTMLDivElement, SubContentProps>(function SubContent(
	{ portal = true, modal = false, forceMount = false, children, ...props },
	ref
) {
	const sub = useSubCtx();
	const mergedRefs = useMergeRefs([sub.refs.setFloating, ref]);

	const shouldRender = forceMount || sub.isOpen;
	if (!shouldRender) return null;

	const computedSide = sub.context.placement.split("-")[0];
	const open = sub.isOpen && sub.isPositioned;

	// Make nested items use *sub* ctx
	const node = (
		<FloatingFocusManager
			context={sub.context}
			modal={modal}
			initialFocus={-1}
			returnFocus={false}
		>
			<RootContext.Provider value={sub}>
				<FloatingList elementsRef={sub.elementsRef} labelsRef={sub.labelsRef}>
					<div
						data-state={open ? "open" : "closed"}
						data-side={computedSide}
						data-slot="context-menu-sub-content"
						ref={mergedRefs as React.Ref<HTMLDivElement>}
						style={{
							...sub.floatingStyles,
							opacity: sub.isOpen && !sub.isPositioned ? 0 : undefined,
						}}
						{...sub.getFloatingProps({
							...props,
							onKeyDown: composeEventHandlers(
								(props as any).onKeyDown,
								(e: React.KeyboardEvent<HTMLDivElement>) => {
									if (e.key === "ArrowLeft" || e.key === "Escape") {
										e.preventDefault();
										sub.setIsOpen(false);
										(sub.refs.reference.current as HTMLElement | null)?.focus?.();
									}
								}
							),
						} as any)}
					>
						{children}
					</div>
				</FloatingList>
			</RootContext.Provider>
		</FloatingFocusManager>
	);

	if (!portal) return node;

	const root = getUiRootFromReference(sub.refs.reference.current);
	return <FloatingPortal root={root}>{node}</FloatingPortal>;
});
