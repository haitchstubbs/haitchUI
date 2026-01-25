import { flip, offset, shift, type Middleware, type Placement } from "@floating-ui/react";
import type { Side, Align } from "./types.js";

class PopoverUtils {
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
	static resolveMiddleware(sideOffsetProp: number | undefined, sideOffsetOverride: number | undefined, middleware: Middleware[] | undefined): Middleware[] {
		const m: Middleware[] = [];
		const resolvedOffset = sideOffsetOverride ?? sideOffsetProp ?? 4;
		m.push(offset(resolvedOffset));
		m.push(flip());
		m.push(shift({ padding: 8 }));
		if (middleware?.length) m.push(...middleware);
		return m;
	}
}

export { PopoverUtils };
