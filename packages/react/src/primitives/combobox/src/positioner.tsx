"use client";

import * as React from "react";
import { Slot } from "@/primitives/slot";
import { composeRefs } from "@/utils/compose-refs";
import { useComboboxContext } from "./context";
import type { PositionerProps } from "./types";

export const Positioner = React.forwardRef<HTMLDivElement, PositionerProps>(function Positioner(
	{ asChild, style, anchor, side, align, sideOffset, alignOffset, collisionPadding, placement, ...props },
	forwardedRef
) {
	const ctx = useComboboxContext("Combobox.Positioner");
	const Comp: any = asChild ? Slot : "div";

	React.useLayoutEffect(() => {
		if (!anchor) {
			ctx.setAnchorElement(null);
			return;
		}
		const node = typeof anchor === "object" && anchor !== null && "current" in anchor ? (anchor as any).current : anchor;
		ctx.setAnchorElement((node as HTMLElement | null) ?? null);
		return () => ctx.setAnchorElement(null);
	}, [ctx, anchor]);

	React.useEffect(() => {
		ctx.setPositionerOverrides({ side, align, sideOffset, alignOffset, collisionPadding, placement });
		return () => ctx.setPositionerOverrides({});
	}, [ctx, side, align, sideOffset, alignOffset, collisionPadding, placement]);

	const referenceEl = ctx.floatingContext.refs.reference.current;
	const anchorRect = referenceEl instanceof Element ? referenceEl.getBoundingClientRect() : null;

	return (
		<Comp
			{...props}
			ref={composeRefs(forwardedRef as any, ctx.refs.floating as any)}
			style={{
				...ctx.floatingStyles,
				...(style as any),
				["--transform-origin" as any]: "var(--floating-transform-origin, 0px 0px)",
				["--anchor-width" as any]: anchorRect ? `${anchorRect.width}px` : undefined,
				["--anchor-height" as any]: anchorRect ? `${anchorRect.height}px` : undefined,
			}}
		/>
	);
});

export namespace Positioner {
	export type Props = PositionerProps;
}
