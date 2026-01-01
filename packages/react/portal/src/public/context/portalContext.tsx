"use client";

import * as React from "react";
import { DOM } from "../managers/dom";
import type { OverlayDOM, ResolvedDOM } from "../../internal/types";
import type { OverlayDOMContextValue } from "../managers/dom";

const OverlayDOMContext = React.createContext<OverlayDOMContextValue | null>(null);

function getDefaultManager(): DOM {
	// IMPORTANT:
	// Don't touch `document` here. Next will execute client components during its
	// Client Component SSR pass. Creating the manager is safe; `document` is only
	// needed when DOM methods are actually invoked.
	return DOM.default();
}

export function OverlayDOMProvider(props: { dom?: OverlayDOM; children: React.ReactNode }) {
	const parent = React.useContext(OverlayDOMContext);

	const baseManager = React.useMemo(() => {
		return parent?.manager ?? getDefaultManager();
	}, [parent?.manager]);

	const manager = React.useMemo(() => baseManager.fork(props.dom), [baseManager, props.dom]);
	const value = React.useMemo<OverlayDOMContextValue>(() => ({ manager, dom: manager.dom }), [manager]);

	return <OverlayDOMContext.Provider value={value}>{props.children}</OverlayDOMContext.Provider>;
}

export function useOverlayDOM(): ResolvedDOM {
	const ctx = React.useContext(OverlayDOMContext);
	if (!ctx) throw new Error("[haitch/react-overlay] useOverlayDOM must be used within <OverlayDOMProvider>.");
	return ctx.dom;
}

export function useOverlayDOMManager(): DOM {
	const ctx = React.useContext(OverlayDOMContext);
	if (!ctx) throw new Error("[haitch/react-overlay] useOverlayDOMManager must be used within <OverlayDOMProvider>.");
	return ctx.manager;
}
