"use client";

import * as React from "react";
import { Slot } from "@haitch/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/util";

const buttonVariants = cva(
  [
    // layout
    "inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0",
    // typography
    "text-sm font-medium",
    // interaction
    "transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
    // icons
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    // focus (token-driven)
    "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
    // invalid (token-driven)
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/30 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // Buttons are “controls” → radius-sm by default
        default: "h-9 px-4 has-[>svg]:px-3 rounded-radius-sm",
        sm: "h-8 px-3 gap-1.5 has-[>svg]:px-2.5 rounded-radius-sm",
        lg: "h-10 px-6 has-[>svg]:px-4 rounded-radius-md",
        icon: "size-9 rounded-radius-sm",
        "icon-sm": "size-8 rounded-radius-sm",
        "icon-lg": "size-10 rounded-radius-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
    compoundVariants: [
      // link buttons should not look like controls
      { variant: "link", size: "default", className: "h-auto px-0 py-0 rounded-none" },
      { variant: "link", size: "sm", className: "h-auto px-0 py-0 rounded-none" },
      { variant: "link", size: "lg", className: "h-auto px-0 py-0 rounded-none" },
    ],
  }
);

type ButtonProps = React.ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLElement, ButtonProps>(function Button(
  { className, variant = "default", size = "default", asChild = false, ...props },
  ref
) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref as any}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});

export { Button, buttonVariants };
