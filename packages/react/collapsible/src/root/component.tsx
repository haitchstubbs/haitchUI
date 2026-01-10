"use client";

import * as React from "react";
import { Slot } from "@haitch/react-slot";
import { useControllableState } from "../hooks";
import { CollapsibleContext } from "../context";
import type { RootProps } from "../types";

function dataState(open: boolean) {
  return open ? "open" : "closed";
}

export const Root = React.forwardRef<HTMLElement, RootProps>(function Root(
  { asChild = false, defaultOpen = false, open: openProp, onOpenChange, disabled = false, ...props },
  ref
) {
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const triggerId = React.useId();
  const contentId = React.useId();

  const Comp: any = asChild ? Slot : "div";

  const ctx = React.useMemo(
    () => ({
      open,
      setOpen: (next: boolean) => {
        if (disabled) return;
        setOpen(next);
      },
      disabled,
      triggerId,
      contentId,
    }),
    [open, setOpen, disabled, triggerId, contentId]
  );

  return (
    <CollapsibleContext.Provider value={ctx}>
      <Comp
        ref={ref as any}
        data-slot="collapsible"
        data-state={dataState(open)}
        data-disabled={disabled ? "" : undefined}
        {...props}
      />
    </CollapsibleContext.Provider>
  );
});
