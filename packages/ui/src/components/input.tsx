
"use client";

import * as React from "react";
import { Slot } from "../lib/slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";


const inputVariants = cva(
    "flex w-full rounded-ui-radius border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "",
                error: "border-destructive text-destructive placeholder:text-destructive/60 focus-visible:ring-destructive",
            },
            size: {
                default: "",
                sm: "px-2 py-1 text-xs",
                lg: "px-4 py-3 text-base",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

type InputProps = React.ComponentPropsWithoutRef<"input"> &
    VariantProps<typeof inputVariants> & {
        asChild?: boolean;
    };

const allowedSizes = ["default", "sm", "lg"] as const;
type AllowedSize = typeof allowedSizes[number];

const Input = React.forwardRef<HTMLElement, InputProps>(function Input(
    { className, variant = "default", size = "default", asChild = false, ...props },
    ref
) {
    const Comp = asChild ? Slot : "input";

    // Ensure size is one of the allowed values
    const normalizedSize: AllowedSize =
        allowedSizes.includes(size as AllowedSize) ? (size as AllowedSize) : "default";

    return (
        <Comp
            ref={ref as any}
            data-slot="input"
            data-variant={variant}
            data-size={normalizedSize}
            className={cn(inputVariants({ variant, size: normalizedSize }), className)}
            {...props}
        />
    );
});

export { Input, inputVariants };