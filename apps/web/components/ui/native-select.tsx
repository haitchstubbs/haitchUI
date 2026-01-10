import * as React from "react";
import { IconChevronDown } from "@tabler/icons-react";

import { cn } from "../../lib/util";

type NativeSelectSize = "sm" | "default";

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
	size?: NativeSelectSize;
};

function NativeSelect({ className, size = "default", ...props }: NativeSelectProps) {
	return (
		<div
			data-slot="native-select-wrapper"
			data-size={size}
			className={cn(
				// layout
				"group/native-select relative inline-flex w-fit min-w-0",

				// disabled handling at wrapper level
				"has-[select:disabled]:opacity-50 has-[select:disabled]:cursor-not-allowed"
			)}
		>
			<select
				data-slot="native-select"
				data-size={size}
				className={cn(
					"peer block w-full min-w-0 appearance-none",
					"rounded-md border border-border bg-background text-foreground",
					"shadow-xs transition-[background-color,border-color,box-shadow] duration-150",
					"hover:bg-[#171717] focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px]",
					"h-9 px-3 pr-9 text-sm data-[size=sm]:h-8 data-[size=sm]:px-2.5 data-[size=sm]:pr-8 data-[size=sm]:text-[13px]",
					"disabled:pointer-events-none disabled:cursor-not-allowed",
					"aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/35",
					className
				)}
				{...props}
			/>

			{/* Icon */}
			<IconChevronDown
				data-slot="native-select-icon"
				aria-hidden="true"
				className={cn(
					"pointer-events-none absolute right-3 top-1/2 -translate-y-1/2",
					"size-4 text-muted-foreground/70",
					"transition-opacity",
					"group-has-[select:disabled]/native-select:opacity-40",
					// subtle brighten on hover
					"group-hover/native-select:text-muted-foreground"
				)}
			/>
		</div>
	);
}

/**
 * NOTE:
 * Styling <option>/<optgroup> is inconsistent across browsers/OS.
 * If you *do* keep these wrappers, keep them minimal.
 */
function NativeSelectOption(props: React.ComponentProps<"option">) {
	return <option data-slot="native-select-option" {...props} />;
}

function NativeSelectOptGroup(props: React.ComponentProps<"optgroup">) {
	return <optgroup data-slot="native-select-optgroup" {...props} />;
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
