import * as React from "react";
import { composeRefs } from "./compose-refs";

type AnyProps = Record<string, unknown>;

export const Slot = React.forwardRef<HTMLElement, { children: React.ReactNode } & AnyProps>(
  function Slot(props, forwardedRef) {
    const { children, ...slotProps } = props;

    if (!React.isValidElement(children)) {
      throw new Error("Slot expects a single valid React element child.");
    }

    const child = children as React.ReactElement<any>;

    // IMPORTANT: ref is on the element, not in props
    const childRef = (child.props as any).ref ?? (child as any).ref;

    const childProps = child.props ?? {};
    const mergedProps: any = { ...childProps, ...slotProps };

    // merge className
    if (childProps.className && (slotProps as any).className) {
      mergedProps.className = `${childProps.className} ${(slotProps as any).className}`;
    }

    // merge style (optional but good)
    if (childProps.style && (slotProps as any).style) {
      mergedProps.style = { ...childProps.style, ...(slotProps as any).style };
    }

    // compose common event handlers (if both exist)
    const events = [
      "onClick",
      "onPointerDown",
      "onPointerUp",
      "onMouseEnter",
      "onMouseLeave",
      "onFocus",
      "onBlur",
    ] as const;

    for (const key of events) {
      const a = childProps[key];
      const b = (slotProps as any)[key];
      if (typeof a === "function" && typeof b === "function") {
        mergedProps[key] = (...args: any[]) => {
          a(...args);
          b(...args);
        };
      }
    }

    // compose refs (use child.ref, not child.props.ref)
    mergedProps.ref = composeRefs(childRef, forwardedRef as any);

    return React.cloneElement(child, mergedProps);
  }
);
