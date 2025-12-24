"use client";

import * as React from "react";
import { cn } from "../lib/cn";

import * as Primitive from "@haitch/react-context-menu";

import {
  IconChevronRight,
  IconCheck,
  IconCircleFilled,
} from "@tabler/icons-react";

/* -------------------------------------------------------------------------------------------------
 * Root / Trigger / Content
 * ------------------------------------------------------------------------------------------------- */

const ContextMenuRoot = Primitive.Root

const ContextMenuTrigger = React.forwardRef<HTMLElement, Primitive.ContextMenuTriggerProps>(
  function ContextMenuTrigger({ className, ...props }, ref) {
    return (
      <Primitive.Trigger
        ref={ref}
        className={className}
        {...props}
      />
    );
  }
);

const ContextMenuContent = React.forwardRef<HTMLDivElement, Primitive.ContextMenuContentProps>(
  function ContextMenuContent({ className, ...props }, ref) {
    return (
      <Primitive.Content
        ref={ref}
        className={cn(
          "z-50 min-w-48 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      />
    );
  }
);

/* -------------------------------------------------------------------------------------------------
 * Item / Label / Separator / Shortcut
 * ------------------------------------------------------------------------------------------------- */

const ContextMenuItem = React.forwardRef<HTMLDivElement, React.ComponentPropsWithRef<typeof Primitive.Item>>(
  function ContextMenuItem(
    { className, inset, variant, ...props },
    ref
  ) {
    return (
      <Primitive.Item
        ref={ref}
        inset={inset}
        variant={variant}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
          "focus:bg-accent focus:text-accent-foreground",
          "data-disabled:pointer-events-none data-disabled:opacity-50",
          inset && "pl-8",
          variant === "destructive" &&
            "text-destructive focus:bg-destructive/10 focus:text-destructive",
          className
        )}
        {...props}
      />
    );
  }
);

const ContextMenuLabel = React.forwardRef<HTMLDivElement, Primitive.ContextMenuLabelProps>(
  function ContextMenuLabel({ className, inset, ...props }, ref) {
    return (
      <Primitive.Label
        ref={ref}
        inset={inset}
        className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
        {...props}
      />
    );
  }
);

const ContextMenuSeparator = React.forwardRef<HTMLDivElement, Primitive.ContextMenuSeparatorProps>(
  function ContextMenuSeparator({ className, ...props }, ref) {
    return (
      <Primitive.Separator
        ref={ref}
        className={cn("-mx-1 my-1 h-px bg-border", className)}
        {...props}
      />
    );
  }
);

const ContextMenuShortcut = React.forwardRef<HTMLSpanElement, Primitive.ContextMenuShortcutProps>(
  function ContextMenuShortcut({ className, ...props }, ref) {
    return (
      <Primitive.Shortcut
        ref={ref}
        className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
        {...props}
      />
    );
  }
);

/* -------------------------------------------------------------------------------------------------
 * Checkbox / Radio
 * ------------------------------------------------------------------------------------------------- */

const ContextMenuCheckboxItem = React.forwardRef<HTMLDivElement, Primitive.ContextMenuCheckboxItemProps>(
  function ContextMenuCheckboxItem({ className, children, checked, ...props }, ref) {
    return (
      <Primitive.CheckboxItem
        ref={ref}
        checked={checked}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
          "focus:bg-accent focus:text-accent-foreground",
          "data-disabled:pointer-events-none data-disabled:opacity-50",
          className
        )}
        {...props}
      >
        <span className="absolute left-2 inline-flex h-3.5 w-3.5 items-center justify-center">
          {/* primitive sets data-state: checked/unchecked/indeterminate */}
          <IconCheck className="hidden h-4 w-4 data-[state=checked]:block" />
          <span className="hidden h-2 w-2 rounded-xs bg-current data-[state=indeterminate]:block" />
        </span>

        {/* Ensure icon visibility tracks state via data attrs on the root */}
        <span className="contents" data-state={checked === "indeterminate" ? "indeterminate" : checked ? "checked" : "unchecked"}>
          {children}
        </span>
      </Primitive.CheckboxItem>
    );
  }
);


const ContextMenuRadioGroup = Primitive.RadioGroup;
const ContextMenuRadioItem = React.forwardRef<HTMLDivElement, Primitive.ContextMenuRadioItemProps>(
  function ContextMenuRadioItem({ className, children, ...props }, ref) {
    return (
      <Primitive.RadioItem
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
          "focus:bg-accent focus:text-accent-foreground",
          "data-disabled:pointer-events-none data-disabled:opacity-50",
          className
        )}
        {...props}
      >
        <span className="absolute left-2 inline-flex h-3.5 w-3.5 items-center justify-center">
          <IconCircleFilled className="h-2.5 w-2.5 opacity-0 data-[state=checked]:opacity-100" />
        </span>

        {children}
      </Primitive.RadioItem>
    );
  }
);

/* -------------------------------------------------------------------------------------------------
 * Submenu
 * ------------------------------------------------------------------------------------------------- */

const ContextMenuSub = Primitive.Sub;

const ContextMenuSubTrigger = React.forwardRef<HTMLDivElement, React.ComponentPropsWithRef<typeof Primitive.SubTrigger>>(
  function ContextMenuSubTrigger({ className, inset, children, ...props }, ref) {
    return (
      <Primitive.SubTrigger
        ref={ref}
        inset={inset}
        className={cn(
          "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
          "focus:bg-accent focus:text-accent-foreground",
          "data-disabled:pointer-events-none data-disabled:opacity-50",
          inset && "pl-8",
          className
        )}
        {...props}
      >
        {children}
        <IconChevronRight className="ml-auto h-4 w-4" />
      </Primitive.SubTrigger>
    );
  }
);

const ContextMenuSubContent = React.forwardRef<HTMLDivElement, Primitive.ContextMenuSubContentProps>(
  function ContextMenuSubContent({ className, ...props }, ref) {
    return (
      <Primitive.SubContent
        ref={ref}
        className={cn(
          "z-50 min-w-48 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      />
    );
  }
);

/* -------------------------------------------------------------------------------------------------
 * Canonical shadcn export shape
 * ------------------------------------------------------------------------------------------------- */

const ContextMenuPortal = ({ children }: { children: React.ReactNode }) => children;

// Optional: match shadcn naming
export {
  ContextMenuRoot as ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuRadioGroup,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
};
