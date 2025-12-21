"use client"

import { forwardRef, HTMLAttributes } from "react";




export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
    orientation?: "horizontal" | "vertical";
    decorative?: boolean;
}

const orientationStyles = {
    horizontal: "w-full h-px",
    vertical: "h-full w-px",
};

const baseStyles =
    "shrink-0 bg-border dark:bg-border/60";

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
    (
        {
            className,
            orientation = "horizontal",
            decorative = true,
            role,
            ...props
        },
        ref
    ) => (
        <div
            ref={ref}
            role={role ?? (decorative ? "separator" : undefined)}
            aria-orientation={orientation}
            className={[
                baseStyles,
                orientationStyles[orientation],
                className,
            ]
                .filter(Boolean)
                .join(" ")}
            {...props}
        />
    )
);

Separator.displayName = "Separator";