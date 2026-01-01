import { forwardRef } from "react";
import type { SubContentProps } from "../types";
import { useSubCtx } from "./useSubContext";
import { FloatingFocusManager, FloatingList, FloatingPortal, useMergeRefs } from "@floating-ui/react";
import { RootContext } from "../context/rootContext";
import { composeEventHandlers } from "../lib/composeEventHandlers";

export const SubContent = forwardRef<HTMLDivElement, SubContentProps>(function SubContent(
	{ portal = true, modal = false, children, ...props },
	ref
) {
	const sub = useSubCtx();
	const mergedRefs = useMergeRefs([sub.refs.setFloating, ref]);
	if (!sub.isOpen) return null;

	// Make nested items use *sub* ctx
	const node = (
		<FloatingFocusManager context={sub.context} modal={modal} initialFocus={-1} returnFocus={false}>
			<RootContext.Provider value={sub}>
				<FloatingList elementsRef={sub.elementsRef} labelsRef={sub.labelsRef}>
					<div
						ref={mergedRefs as React.Ref<HTMLDivElement>}
						style={sub.floatingStyles}
						{...sub.getFloatingProps({
							...props,
							onKeyDown: composeEventHandlers((props as any).onKeyDown, (e: React.KeyboardEvent<HTMLDivElement>) => {
								if (e.key === "ArrowLeft" || e.key === "Escape") {
									e.preventDefault();
									sub.setIsOpen(false);
									(sub.refs.reference.current as HTMLElement | null)?.focus?.();
								}
							}),
						} as any)}
					>
						{children}
					</div>
				</FloatingList>
			</RootContext.Provider>
		</FloatingFocusManager>
	);

	if (!portal) return node;

	const uiRootFromDocument = typeof document !== "undefined" ? document.querySelector(".ui-root") : null;
	const foundRoot = (sub.refs.reference.current as HTMLElement | null)?.closest(".ui-root") ?? uiRootFromDocument ?? undefined;
	const root = foundRoot instanceof HTMLElement ? foundRoot : undefined;

	return <FloatingPortal root={root}>{node}</FloatingPortal>;
});
