import { FloatingNode } from "@floating-ui/react";
import { SubContext } from "./context";
import { useMenuInstance } from "../root";
import type { SubProps } from "../types";
export function Sub({ children, open, defaultOpen, onOpenChange }: SubProps) {
	// Nested defaults: right-start with small negative align offset
	const subCtx = useMenuInstance({
		open,
		defaultOpen,
		onOpenChange,
		modal: false,
		defaultPlacement: {
			root: { side: "right", align: "start", sideOffset: 0, alignOffset: -4, collisionPadding: 8 },
			nested: { side: "right", align: "start", sideOffset: 0, alignOffset: -4, collisionPadding: 8 },
		},
	});

	return (
		<FloatingNode id={subCtx.nodeId}>
			<SubContext.Provider value={subCtx}>{children}</SubContext.Provider>
		</FloatingNode>
	);
}
