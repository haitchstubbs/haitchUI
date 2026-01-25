import { FloatingPortal, type VirtualElement } from "@floating-ui/react";

import { useTooltipContext } from "../tooltip";

export type TooltipPortalProps = {
	children: React.ReactNode;
	container?: HTMLElement | null;
};

function isElement(v: unknown): v is Element {
	return typeof v === "object" && v !== null && (v as any).nodeType === 1;
}

export function getUiRootFromReference(ref: unknown): HTMLElement | undefined {
	// direct element
	if (isElement(ref)) {
		return (ref.closest(".ui-root") as HTMLElement | null) ?? undefined;
	}

	// virtual element: try contextElement
	const ve = ref as VirtualElement | null;
	const ctxEl = ve?.contextElement;
	if (isElement(ctxEl)) {
		return (ctxEl.closest(".ui-root") as HTMLElement | null) ?? undefined;
	}

	// document fallback
	if (typeof document !== "undefined") {
		return (document.querySelector(".ui-root") as HTMLElement | null) ?? undefined;
	}

	return undefined;
}

export function TooltipPortal({ children, container }: TooltipPortalProps) {
	const tooltip = useTooltipContext();

	const root = getUiRootFromReference(tooltip.refs.reference.current);
	return <FloatingPortal root={root ?? undefined}>{children}</FloatingPortal>;
}
