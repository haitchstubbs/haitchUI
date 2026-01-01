import { forwardRef } from "react";
import type { TriggerProps } from "../types";
import { Slot } from "@haitch/react-slot";
import { useMergeRefs } from "@floating-ui/react";
import { useCtx } from "../context/useRootContext";

export const Trigger = forwardRef<HTMLElement, TriggerProps>(function Trigger({ asChild = false, ...props }, ref) {
	const menu = useCtx();
	const Comp = asChild ? Slot : ("button" as any);

	return (
		<Comp
			ref={useMergeRefs([menu.refs.setReference, ref])}
			role={menu.isNested ? "menuitem" : undefined}
			data-state={menu.isOpen ? "open" : "closed"}
			data-nested={menu.isNested ? "" : undefined}
			{...(asChild ? {} : { type: "button" })}
			{...menu.getReferenceProps(props as any)}
		/>
	);
});
