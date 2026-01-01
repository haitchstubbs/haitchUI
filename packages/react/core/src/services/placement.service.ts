import { type Align, type FloatingPlacement, type FloatingReference, type Side } from "../types/portal.types.js";

export class Placement {
	static fromSideAlign(side: Side, align: Align): FloatingPlacement {
		if (align === "center") return side;
		return `${side}-${align}` as FloatingPlacement;
	}
	static side(p: FloatingPlacement): Side {
		return p.split("-")[0] as Side;
	}
	static align(p: FloatingPlacement): Align {
		const parts = p.split("-");
		return (parts[1] as Align) ?? "center";
	}
	static virtualPoint(x: number, y: number): FloatingReference {
		return {
			getBoundingClientRect() {
				return {
					x,
					y,
					width: 0,
					height: 0,
					top: y,
					left: x,
					right: x,
					bottom: y,
				} as DOMRect;
			},
		};
	}
}
