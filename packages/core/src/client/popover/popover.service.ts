import type { Placement } from "@floating-ui/react";
import type { Align, Side } from "./popover.types";

export class Popover {
	static placementFromSideAlign(side: Side, align: Align): Placement {
		if (align === "center") return side;
		return `${side}-${align}` as Placement;
	}
	static sideFromPlacement(p: Placement): Side {
		return p.split("-")[0] as Side;
	}
	static alignFromPlacement(p: Placement): Align {
		return (p.split("-")[1] as Align) ?? "center";
	}
}
