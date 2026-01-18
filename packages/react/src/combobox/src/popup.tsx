// src/popup.tsx
"use client";

import * as React from "react";
import { FloatingFocusManager } from "@floating-ui/react";
import { Slot } from "@/slot/src";
import { useComboboxContext } from "./context";
import type { PopupProps } from "./types";

export const Popup = React.forwardRef<HTMLDivElement, PopupProps>(function Popup(
  { asChild, forceMount, initialFocus = true, finalFocus = true, ...props },
  forwardedRef
) {
  const ctx = useComboboxContext("Combobox.Popup");
  const Comp: any = asChild ? Slot : "div";

  const mounted = forceMount ? true : (ctx.open || ctx.isMounted);
  const [startingStyle, setStartingStyle] = React.useState(false);
  React.useLayoutEffect(() => {
    if (!ctx.open) {
      setStartingStyle(false);
      return;
    }
    setStartingStyle(true);
    const raf = requestAnimationFrame(() => setStartingStyle(false));
    return () => cancelAnimationFrame(raf);
  }, [ctx.open]);

  const endingStyle = !ctx.open;

  if (!mounted) return null;

  const content = (
    <Comp
      ref={forwardedRef}
      {...ctx.getFloatingProps({
        ...props,
        id: ctx.listboxId,
        // these can stay, since getFloatingProps is Record<string, any>
        "data-open": ctx.open ? "" : undefined,
        "data-closed": !ctx.open ? "" : undefined,
        "data-starting-style": startingStyle ? "" : undefined,
        "data-ending-style": endingStyle ? "" : undefined,
        "data-align": ctx.align,
        "data-empty": ctx.isEmpty ? "" : undefined,
      })}
    />
  );

  if (!ctx.modal) return content;

  return (
    <FloatingFocusManager
      context={ctx.floatingContext}
      modal
      initialFocus={initialFocus ? -1 : undefined}
      returnFocus={finalFocus}
    >
      {content}
    </FloatingFocusManager>
  );
});
