"use client";

import * as React from "react";

export type CollapsibleCtx = {
  open: boolean;
  setOpen: (next: boolean) => void;
  disabled: boolean;

  // ids for aria
  contentId: string;
  triggerId: string;
};

export const CollapsibleContext = React.createContext<CollapsibleCtx | null>(null);

export function useCollapsibleCtx() {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx) throw new Error("Collapsible components must be wrapped in <Root />");
  return ctx;
}
