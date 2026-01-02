import { forwardRef, type HTMLAttributes } from "react";

export const Shortcut = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function Shortcut({ className, ...props }, ref) {
    return <span ref={ref} aria-hidden="true" data-slot="dropdown-menu-shortcut" className={className} {...props} />;
});