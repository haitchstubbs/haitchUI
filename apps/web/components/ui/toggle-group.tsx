"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@haitch-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/util";
import { toggleVariants } from "./toggle";

const ToggleGroupContext = React.createContext<
	VariantProps<typeof toggleVariants> & {
		spacing?: number;
	}
>({
	size: "default",
	variant: "default",
	spacing: 0,
});

type ToggleRootProps = React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>;
type ToggleType = ToggleRootProps["type"]; // "single" | "multiple"

type ToggleGroupProps<T extends ToggleType> = Extract<ToggleRootProps, { type: T }> &
	VariantProps<typeof toggleVariants> & {
		spacing?: number;
	};

function ToggleGroup<T extends ToggleType>({ className, variant, size, spacing = 0, children, ...props }: ToggleGroupProps<T>) {
	return (
		<ToggleGroupPrimitive.Root
			{...props}
			data-type={props.type}
			data-slot="toggle-group"
			data-variant={variant}
			data-size={size}
			data-spacing={spacing}
			style={{ "--gap": spacing } as React.CSSProperties}
			className={cn(
				"group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=default]:data-[variant=outline]:shadow-xs",
				className
			)}
		>
			<ToggleGroupContext.Provider value={{ variant, size, spacing }}>{children}</ToggleGroupContext.Provider>
		</ToggleGroupPrimitive.Root>
	);
}

function ToggleGroupItem({
	className,
	children,
	variant,
	size,
	...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) {
	const context = React.useContext(ToggleGroupContext);

	return (
		<ToggleGroupPrimitive.Item
			data-slot="toggle-group-item"
			data-variant={context.variant || variant}
			data-size={context.size || size}
			data-spacing={context.spacing}
			className={cn(
				toggleVariants({
					variant: context.variant || variant,
					size: context.size || size,
				}),
				"w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10",
				"data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l",
				className
			)}
			{...props}
		>
			{children}
		</ToggleGroupPrimitive.Item>
	);
}

export { ToggleGroup, ToggleGroupItem };
