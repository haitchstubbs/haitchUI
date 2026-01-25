"use client";

import * as React from "react";
import { FloatingPortal } from "@floating-ui/react";
import { useComboboxContext } from "./context";
import type { PortalProps } from "./types";

export function Portal({ container, children }: PortalProps) {
  const ctx = useComboboxContext("Combobox.Portal");
  const root = container ?? ctx.portalRoot;
  return <FloatingPortal root={root ?? undefined}>{children}</FloatingPortal>;
}
