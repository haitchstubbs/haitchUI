"use client";

import * as React from "react";
import { Slot } from "@haitch-ui/react-slot";
import type { LabelProps } from "./types";

/**
 * A11y notes:
 * - Native <label> already forwards activation to the associated control (htmlFor or nested control).
 * - We add a small fallback: if the click originated from inside the label but the associated control
 *   is not focusable by default, we try to focus it.
 */
export const Root = React.forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { asChild = false, onMouseDown, onClick, ...props },
  ref
) {
  const Comp: any = asChild ? Slot : "label";

  return (
    <Comp
      ref={ref}
      data-slot="label"
      onMouseDown={(e: React.MouseEvent<HTMLLabelElement>) => {
        // Prevent text selection on double click; Radix does similar.
        // Only do this for primary button without modifiers.
        if (e.detail > 1 && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
          e.preventDefault();
        }
        onMouseDown?.(e);
      }}
      onClick={(e: React.MouseEvent<HTMLLabelElement>) => {
        onClick?.(e);
        if (e.defaultPrevented) return;

        // If htmlFor is set, browser handles it.
        // If it's not, and user used asChild/wrapped non-input,
        // we can try to focus the first focusable descendant.
        const target = e.currentTarget as HTMLElement;
        const htmlFor = (target as HTMLLabelElement).htmlFor;

        if (!htmlFor) {
          const focusable = target.querySelector<HTMLElement>(
            "input,textarea,select,button,[tabindex]:not([tabindex='-1'])"
          );
          focusable?.focus?.();
        }
      }}
      {...props}
    />
  );
});
