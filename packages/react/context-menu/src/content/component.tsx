import { FloatingFocusManager, FloatingPortal, useMergeRefs } from "@floating-ui/react";
import { forwardRef, useLayoutEffect } from "react";
import type { ContentProps } from "../types";
import { useCtx } from "../context/useRootContext";
import { getUiRootFromReference } from "../portal";

export const Content = forwardRef<HTMLDivElement, ContentProps>(function Content(
	{ portal = true, modal, forceMount = false, side, align, sideOffset, alignOffset, collisionPadding, children, ...props },
	ref
) {
	const menu = useCtx();

	const mergedRefs = useMergeRefs([menu.refs.setFloating, ref]);

	useLayoutEffect(() => {
		menu.setPositioning({
			side: side ?? (menu.isNested ? "right" : "bottom"),
			align: align ?? "start",
			sideOffset: sideOffset ?? (menu.isNested ? 0 : 4),
			alignOffset: alignOffset ?? (menu.isNested ? -4 : 0),
			collisionPadding: collisionPadding ?? 8,
		});
	}, [menu, side, align, sideOffset, alignOffset, collisionPadding]);

	const shouldRender = forceMount || menu.isOpen;
	if (!shouldRender) return null;

	const computedSide = menu.context.placement.split("-")[0];
	const open = menu.isOpen && menu.isPositioned;
	const node = (
		<FloatingFocusManager context={menu.context} modal={modal ?? menu.modal} initialFocus={menu.isNested ? -1 : 0} returnFocus={!menu.isNested}>
			<div
				data-state={open ? "open" : "closed"}
				data-side={computedSide}
				data-slot="context-menu-content"
				ref={mergedRefs as React.Ref<HTMLDivElement>}
				style={{ ...menu.floatingStyles, opacity: menu.isOpen && !menu.isPositioned ? 0 : undefined }}
				{...menu.getFloatingProps(props as any)}
			>
				{children}
			</div>
		</FloatingFocusManager>
	);

	if (!portal) return node;

	const root = getUiRootFromReference(menu.refs.reference.current);

	return <FloatingPortal root={root}>{node}</FloatingPortal>;
});
