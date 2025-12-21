"use client";
import * as React from "react";
import { Slot } from "../lib/slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";




const labelVariants = cva(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    {
        variants: {
            variant: {
                default: "text-foreground",
                muted: "text-muted-foreground",
                error: "text-destructive",
            },
            size: {
                default: "",
                sm: "text-xs",
                lg: "text-base",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

type LabelProps = React.ComponentPropsWithoutRef<"label"> &
    VariantProps<typeof labelVariants> & {
        asChild?: boolean;
    };

const Label = React.forwardRef<HTMLElement, LabelProps>(function Label(
    { className, variant = "default", size = "default", asChild = false, ...props },
    ref
) {
    const Comp = asChild ? Slot : "label";

    return (
        <Comp
            ref={ref as any}
            data-slot="label"
            data-variant={variant}
            data-size={size}
            className={cn(labelVariants({ variant, size, className }))}
            {...props}
        />
    );
});

export { Label, labelVariants };