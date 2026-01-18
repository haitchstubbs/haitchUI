import { forwardRef, type HTMLAttributes } from "react";

export const Label = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Label({ className, ...props }, ref) {
	return <div ref={ref} role="presentation" data-slot="dropdown-menu-label" className={className} {...props} />;
});
