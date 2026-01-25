import { forwardRef, type HTMLAttributes } from "react";

export const Separator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Separator({ className, ...props }, ref) {
	return <div ref={ref} role="separator" aria-orientation="horizontal" data-slot="dropdown-menu-separator" className={className} {...props} />;
});
