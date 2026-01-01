// packages/ui/src/components/collapsible.tsx
"use client";

import * as React from "react";
import { Slot } from "../lib/slot";

type CollapsibleContextValue = {
  open: boolean;
  disabled: boolean;
  contentId: string;
  triggerId: string;
  setOpen: (next: boolean) => void;
};

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

function useCollapsibleContext(componentName: string): CollapsibleContextValue {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx) {
    throw new Error(`${componentName} must be used within <Collapsible />`);
  }
  return ctx;
}

export type CollapsibleProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
};

function Collapsible(props: CollapsibleProps) {
  const {
    open: openProp,
    defaultOpen,
    onOpenChange,
    disabled = false,
    className,
    children,
  } = props;

  const isControlled = openProp !== undefined;
  const [openUncontrolled, setOpenUncontrolled] = React.useState<boolean>(defaultOpen ?? false);
  const open = isControlled ? openProp : openUncontrolled;

  const contentId = React.useId();
  const triggerId = React.useId();

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (disabled) return;
      if (!isControlled) setOpenUncontrolled(next);
      onOpenChange?.(next);
    },
    [disabled, isControlled, onOpenChange]
  );

  const value = React.useMemo<CollapsibleContextValue>(
    () => ({
      open,
      disabled,
      contentId,
      triggerId,
      setOpen,
    }),
    [open, disabled, contentId, triggerId, setOpen]
  );

  return (
    <CollapsibleContext.Provider value={value}>
      <div data-slot="collapsible" className={className}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

type PrimitiveButtonProps = React.ComponentPropsWithoutRef<"button">;

export type CollapsibleTriggerProps = Omit<PrimitiveButtonProps, "type" | "disabled"> & {
  asChild?: boolean;
};

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  function CollapsibleTrigger({ asChild, onClick, ...props }, forwardedRef) {
    const { open, disabled, setOpen, contentId, triggerId } =
      useCollapsibleContext("CollapsibleTrigger");

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      setOpen(!open);
    };

    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        data-slot="collapsible-trigger"
        {...props}
        ref={forwardedRef}
        id={triggerId}
        type="button"
        aria-controls={contentId}
        aria-expanded={open}
        disabled={disabled}
        onClick={handleClick}
      />
    );
  }
);

type PrimitiveDivProps = React.ComponentPropsWithoutRef<"div">;

export type CollapsibleContentProps = PrimitiveDivProps & {
  asChild?: boolean;
  forceMount?: boolean;
};

const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  function CollapsibleContent({ asChild, forceMount = false, ...props }, forwardedRef) {
    const { open, contentId, triggerId } = useCollapsibleContext("CollapsibleContent");

    const mounted = forceMount || open;
    const Comp = asChild ? Slot : "div";

    if (!mounted) return null;

    return (
      <Comp
        data-slot="collapsible-content"
        {...props}
        ref={forwardedRef}
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        aria-hidden={open ? "false" : "true"}
        hidden={!open}
      />
    );
  }
);

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
