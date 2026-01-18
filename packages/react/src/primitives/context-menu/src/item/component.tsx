import { useListItem, useMergeRefs } from "@floating-ui/react";
import { composeEventHandlers } from "../lib/composeEventHandlers";
import { useCtx } from "../context/useRootContext";

function makeSelectEvent() {
	return new Event("select", { cancelable: true });
}
import { forwardRef } from "react";
import type { ItemProps } from "../types";
import { Slot } from "@/primitives/slot/src";
export const Item = forwardRef<HTMLElement, ItemProps>(function Item(
	{ asChild = false, onSelect, textValue, disabled, closeOnSelect = true, children, ...props },
	ref
) {
	const menu = useCtx();

	const label = disabled ? null : (textValue ?? (typeof children === "string" ? children : null));
	const listItem = useListItem({ label });
	const isActive = listItem.index === menu.activeIndex;

	const Comp = asChild ? Slot : ("button" as any);

	const itemProps = menu.getItemProps({
		onClick: composeEventHandlers((props as any).onClick, (event: React.MouseEvent<HTMLElement>) => {
			if (disabled) {
				event.preventDefault();
				event.stopPropagation();
				return;
			}

			const selectEvent = makeSelectEvent();
			onSelect?.(selectEvent);

			const shouldClose = closeOnSelect && !selectEvent.defaultPrevented;
			if (shouldClose) menu.tree?.events.emit("click");
		}),
		onKeyDown: composeEventHandlers((props as any).onKeyDown, (event: React.KeyboardEvent<HTMLElement>) => {
			if (disabled) return;
			if (event.key !== "Enter" && event.key !== " ") return;

			event.preventDefault();

			const selectEvent = makeSelectEvent();
			onSelect?.(selectEvent);

			const shouldClose = closeOnSelect && !selectEvent.defaultPrevented;
			if (shouldClose) menu.tree?.events.emit("click");
		}),
	} as any);

	return (
		<Comp
			{...props}
			{...itemProps}
			ref={useMergeRefs([listItem.ref, ref])}
			role="menuitem"
			tabIndex={isActive ? 0 : -1}
			data-disabled={disabled ? "" : undefined}
			{...(asChild ? {} : { type: "button", disabled })}
		>
			{children}
		</Comp>
	);
});
