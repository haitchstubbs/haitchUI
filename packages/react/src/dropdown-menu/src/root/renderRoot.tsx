import { FloatingList, FloatingNode } from "@floating-ui/react";
import { RootContext } from "../context/rootContext";
import { useMenuInstance } from "./instance";
import type { RootProps } from "./types";

function RenderRoot({ open, defaultOpen = false, onOpenChange, modal = true, children }: RootProps) {
	const ctx = useMenuInstance({
		open,
		defaultOpen,
		onOpenChange,
		modal,
		defaultPlacement: {
			root: { side: "bottom", align: "start", sideOffset: 4, alignOffset: 0, collisionPadding: 8 },
			nested: { side: "right", align: "start", sideOffset: 0, alignOffset: -4, collisionPadding: 8 },
		},
	});

	return (
		<FloatingNode id={ctx.nodeId}>
			<RootContext.Provider value={ctx}>
				<FloatingList elementsRef={ctx.elementsRef} labelsRef={ctx.labelsRef}>
					{children}
				</FloatingList>
			</RootContext.Provider>
		</FloatingNode>
	);
}

export { RenderRoot };
