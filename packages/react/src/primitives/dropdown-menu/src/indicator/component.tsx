import { forwardRef, type HTMLAttributes } from "react";
import { useIndicatorState } from "./useIndicatorState";

export const ItemIndicator = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement> & { forceMount?: boolean }>(
    function ItemIndicator({ forceMount = false, children, ...props }, ref) {
        const state = useIndicatorState();
        if (!forceMount && !state?.checked) return null;

        return (
            <span ref={ref} data-slot="dropdown-menu-item-indicator" aria-hidden="true" {...props}>
                {children}
            </span>
        );
    }
);