import { forwardRef } from "react";
import type { SubTriggerProps } from "../types";
import { useCtx } from "../context/useRootContext";
import { useSubCtx } from "./useSubContext";
import { useListItem, useMergeRefs } from "@floating-ui/react";
import { Slot } from "@/slot/src";
import { composeEventHandlers } from "../lib/composeEventHandlers";

export const SubTrigger = forwardRef<HTMLElement, SubTriggerProps>(function SubTrigger({ asChild = false, disabled, children, ...props }, ref) {
	const parent = useCtx();
	const sub = useSubCtx();

	const label = disabled ? null : typeof children === "string" ? children : null;
	const listItem = useListItem({ label });
	const isActive = listItem.index === parent.activeIndex;

	const Comp = asChild ? Slot : ("button" as any);

	const focusFirstSubItem = () => {
		// Let the submenu mount, then focus first item
		queueMicrotask(() => {
			requestAnimationFrame(() => {
				sub.elementsRef.current[0]?.focus?.();
			});
		});
	};

	const openSub = () => {
		sub.setIsOpen(true);
		sub.setActiveIndex(0);
		focusFirstSubItem();
	};

	const closeSub = () => {
		sub.setIsOpen(false);
		(sub.refs.reference.current as HTMLElement | null)?.focus?.();
	};

	// Parent roving tabindex behavior (treat as a menuitem in parent list)
	const parentItemProps = parent.getItemProps({
		onClick: composeEventHandlers((props as any).onClick, (e: React.MouseEvent<HTMLElement>) => {
			if (disabled) return;
			e.preventDefault();
			openSub();
		}),
		onKeyDown: composeEventHandlers((props as any).onKeyDown, (e: React.KeyboardEvent<HTMLElement>) => {
			if (disabled) return;

			if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				openSub();
			}

			if (e.key === "ArrowLeft" && sub.isOpen) {
				e.preventDefault();
				closeSub();
			}
		}),
	} as any);

	// Submenu reference props (hover-to-open for mouse, etc.)
	const subRefProps = sub.getReferenceProps({} as any);

	return (
		<Comp
			{...props}
			{...parentItemProps}
			{...subRefProps}
			ref={useMergeRefs([listItem.ref, sub.refs.setReference, ref])}
			role="menuitem"
			aria-haspopup="menu"
			aria-expanded={sub.isOpen}
			tabIndex={isActive ? 0 : -1}
			data-disabled={disabled ? "" : undefined}
			data-state={sub.isOpen ? "open" : "closed"}
			{...(asChild ? {} : { type: "button", disabled })}
		>
			{children}
		</Comp>
	);
});
