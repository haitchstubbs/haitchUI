import type { Placement } from "@floating-ui/utils";
import type { Align, Side } from "../types";

export function toPlacement(side: Side, align: Align): Placement {
	if (align === "center") return side as Placement;
	return `${side}-${align}` as Placement;
}
