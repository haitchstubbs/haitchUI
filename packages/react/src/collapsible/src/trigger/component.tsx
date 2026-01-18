"use client";

import * as React from "react";
import { Slot } from "@/slot/src";
import { useCollapsibleCtx } from "../context";
import type { TriggerProps } from "../types";

function dataState(open: boolean) {
  return open ? "open" : "closed";
}

export const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(function Trigger(
  { asChild = false, onClick, ...props },
  ref
) {
  const c = useCollapsibleCtx();
  const Comp: any = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      id={c.triggerId}
      type={asChild ? undefined : "button"}
      data-slot="collapsible-trigger"
      data-state={dataState(c.open)}
      data-disabled={c.disabled ? "" : undefined}
      aria-controls={c.contentId}
      aria-expanded={c.open}
      disabled={!asChild ? c.disabled : undefined}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (c.disabled) return;
        c.setOpen(!c.open);
        onClick?.(e);
      }}
      {...props}
    />
  );
});
