"use client";


import { createContext, useContext, useMemo } from "react";
import { UI } from "./manager";
import type { OverlayDOM, OverlayDOMContextValue, ResolvedOverlayDOM } from "./types";
import type { ReactNode } from "react";

const DEFAULT_MANAGER = UI.default();
const DEFAULT_VALUE: OverlayDOMContextValue = {
  manager: DEFAULT_MANAGER,
  dom: DEFAULT_MANAGER.dom,
};

const OverlayDOMContext = createContext<OverlayDOMContextValue>(DEFAULT_VALUE);

export function OverlayDOMProvider(props: { dom?: OverlayDOM; children: ReactNode }) {
  const parent = useContext(OverlayDOMContext);

  const manager = useMemo(() => {
    // child overrides parent; parent chain is represented by parent.manager
    return parent.manager.fork(props.dom);
  }, [parent.manager, props.dom]);

  const value = useMemo<OverlayDOMContextValue>(() => ({ manager, dom: manager.dom }), [manager]);

  return <OverlayDOMContext.Provider value={value}>{props.children}</OverlayDOMContext.Provider>;
}

export function useOverlayDOM(): ResolvedOverlayDOM {
  return useContext(OverlayDOMContext).dom;
}

/**
 * Optional: expose the manager if you want to use helper methods
 * without passing dom around.
 */
export function useOverlayDOMManager(): UI {
  return useContext(OverlayDOMContext).manager;
}
