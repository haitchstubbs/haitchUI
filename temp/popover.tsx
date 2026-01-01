import * as PopoverPrimitive from "@haitch/react-popover";
import { forwardRef } from "react";
import { cn } from "../lib/cn";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = forwardRef<HTMLElement, PopoverPrimitive.TriggerProps>(
  function ContextMenuTrigger({ className, ...props }, ref) {
    return (
      <PopoverPrimitive.Trigger
        ref={ref}
        className={className}
        {...props}
      />
    );
  }
);

const PopoverContent = forwardRef<HTMLDivElement, PopoverPrimitive.ContentProps>(
  function PopoverContent({ className, ...props }, ref) {
    return (
      <PopoverPrimitive.Content
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

export { Popover, PopoverTrigger, PopoverContent };