import { FloatingFocusManager, FloatingPortal, useMergeRefs } from "@floating-ui/react";
import { forwardRef, useLayoutEffect } from "react";
import type { ContentProps } from "../types";
import { useCtx } from "../context/useRootContext";

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

	const node = (
		<FloatingFocusManager context={menu.context} modal={modal ?? menu.modal} initialFocus={menu.isNested ? -1 : 0} returnFocus={!menu.isNested}>
			<div ref={mergedRefs as React.Ref<HTMLDivElement>} style={menu.floatingStyles} {...menu.getFloatingProps(props as any)}>
				{children}
			</div>
		</FloatingFocusManager>
	);

	if (!portal) return node;

	const uiRootFromDocument = typeof document !== "undefined" ? document.querySelector(".ui-root") : null;
	const foundRoot = (menu.refs.reference.current as HTMLElement | null)?.closest(".ui-root") ?? uiRootFromDocument ?? undefined;
	const root = foundRoot instanceof HTMLElement ? foundRoot : undefined;

	return <FloatingPortal root={root}>{node}</FloatingPortal>;
});
