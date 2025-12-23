"use client";

import * as React from "react";
import { UI } from "../lib/manager";
import type { OverlayDOM, OverlayDOMContextValue, ResolvedOverlayDOM } from "../types/types";

const OverlayDOMContext = React.createContext<OverlayDOMContextValue | null>(null);

function getDefaultManager(): UI {
	// IMPORTANT:
	// Don't touch `document` here. Next will execute client components during its
	// Client Component SSR pass. Creating the manager is safe; `document` is only
	// needed when DOM methods are actually invoked.
	return UI.default();
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

export function useOverlayDOM(): ResolvedOverlayDOM {
	const ctx = React.useContext(OverlayDOMContext);
	if (!ctx) throw new Error("[haitch/core] useOverlayDOM must be used within <OverlayDOMProvider>.");
	return ctx.dom;
}

export function useOverlayDOMManager(): UI {
	const ctx = React.useContext(OverlayDOMContext);
	if (!ctx) throw new Error("[haitch/core] useOverlayDOMManager must be used within <OverlayDOMProvider>.");
	return ctx.manager;
}
