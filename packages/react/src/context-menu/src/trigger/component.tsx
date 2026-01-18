import * as React from "react";
import { forwardRef } from "react";
import type { TriggerProps } from "../types";
import { Slot } from "@/slot/src";
import { useMergeRefs } from "@floating-ui/react";
import { useCtx } from "../context/useRootContext";

export const Trigger = forwardRef<HTMLElement, TriggerProps>(function Trigger(
  { asChild = false, onContextMenu, onKeyDown, ...props },
  ref
) {
  const menu = useCtx();
  const Comp = asChild ? Slot : ("button" as any);

  const referenceProps = menu.getReferenceProps({
    ...(props as any),

    onContextMenu: (e: React.MouseEvent<HTMLElement>) => {
      // run user handler first (so they can opt out by preventing default)
      onContextMenu?.(e);
      if (e.defaultPrevented) return;

      e.preventDefault();
      menu.openAtPoint(e.currentTarget as HTMLElement, e.clientX, e.clientY);
    },

    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;

      if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
        e.preventDefault();
        const el = e.currentTarget as HTMLElement;
        const r = el.getBoundingClientRect();
        menu.openAtPoint(
          el,
          Math.round(r.left + r.width / 2),
          Math.round(r.top + r.height / 2)
        );
      }
    },
  } as any);

  return (
    <Comp
      ref={useMergeRefs([menu.refs.setReference, ref])}
      role={menu.isNested ? "menuitem" : undefined}
      data-state={menu.isOpen ? "open" : "closed"}
      data-nested={menu.isNested ? "" : undefined}
      {...(asChild ? {} : { type: "button" })}
      {...referenceProps}
    />
  );
});
