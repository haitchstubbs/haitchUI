import { FloatingPortal } from "@floating-ui/react";
import type { PortalProps } from "../types";
import { useCtx } from "../context/useRootContext";

export function Portal({ children, container }: PortalProps) {
	const menu = useCtx();

	const uiRootFromDocument =
		typeof document !== "undefined" ? (document.querySelector(".ui-root") as HTMLElement | null) : null;

	const fallback =
		((menu.refs.reference.current as HTMLElement | null)?.closest(".ui-root") as HTMLElement | null) ??
		uiRootFromDocument ??
		undefined;

	const root = container ?? fallback;
	return <FloatingPortal root={root ?? undefined}>{children}</FloatingPortal>;
}
