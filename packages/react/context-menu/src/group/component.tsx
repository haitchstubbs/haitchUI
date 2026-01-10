import { forwardRef, type HTMLAttributes } from "react";

export const Group = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Group({ className, ...props }, ref) {
	return <div ref={ref} role="group" data-slot="dropdown-menu-group" className={className} {...props} />;
});
