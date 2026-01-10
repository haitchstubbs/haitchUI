"use client";

import { Checkbox } from "../../../../components/ui/checkbox";
import { Label } from "../../../../components/ui/label";
import { cn } from "../../../../lib/util";

export function Primary() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center gap-3">
				<Checkbox id="terms" />
				<Label htmlFor="terms">Accept terms and conditions</Label>
			</div>
			<div className="flex items-start gap-3">
				<Checkbox id="terms-2" defaultChecked />
				<div className="grid gap-2">
					<Label htmlFor="terms-2">Accept terms and conditions</Label>
					<p className="text-muted-foreground text-sm">By clicking this checkbox, you agree to the terms and conditions.</p>
				</div>
			</div>
			<div className="flex items-start gap-3">
				<Checkbox id="toggle" disabled />
				<Label htmlFor="toggle">Enable notifications</Label>
			</div>
			<Label
				className={cn(
					[
						"group cursor-pointer",
						"flex items-start gap-3 rounded-lg border border-border p-3",
						"bg-background text-foreground",

						// Smooth + clean transitions (no jank)
						"transition-[background-color,border-color,color,box-shadow] duration-150 ease-out",

						// Hover/active surface
						"hover:bg-accent/30",
						"active:bg-accent/70",

						// Focus ring when any child (input) is focused
						"focus-within:ring-2 focus-within:ring-ring/30 focus-within:ring-offset-2 focus-within:ring-offset-background",

						// Checked state surface + border (token-based)
						"has-[button[data-state=checked]]:bg-accent/60 hover:has-[button[data-state=checked]]:bg-accent/30 has-[button[data-state=checked]]:border-border/40",

						// Disabled visuals (whole row)
						"has-disabled:opacity-60 has-disabled:cursor-not-allowed",
					].join(" "),
					// Hover tint checkbox ONLY when unchecked + enabled
					"group-hover:[&_input:not(:disabled)~button[data-slot=checkbox]]:bg-accent/30",
					// Keyboard focus tint for the checkbox control
					"[&_input.peer:focus-visible+button[data-slot=checkbox]]:ring-2 [&_input.peer:focus-visible+button[data-slot=checkbox]]:ring-ring/40"
				)}
			>
				<Checkbox
					id="toggle-2"
					defaultChecked
					aria-labelledby="toggle-2-label"
					aria-describedby="toggle-2-description"
					className={cn(
						[
							// checkbox base should match the theme
							"transition-[background-color,border-color,color,box-shadow] duration-150 ease-out",

							// checked uses primary token (not hardcoded blue)
							"data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",

							// keep unchecked subtle and consistent
							"data-[state=unchecked]:border-border data-[state=unchecked]:bg-background",
						].join(" ")
					)}
				/>

				<div className="grid gap-1.5 font-normal">
					<p
						id="toggle-2-label"
						data-slot-checkbox-title
						className={cn(
							"text-sm font-medium leading-none",
							"transition-colors duration-150",
							// hover text tint only when enabled
							"group-hover:text-foreground/80 group-has-disabled:group-hover:text-foreground"
						)}
					>
						Enable notifications
					</p>

					<p
						id="toggle-2-description"
						data-slot-checkbox-description
						className={cn(
							"text-sm text-muted-foreground",
							"transition-colors duration-150",
							"group-hover:text-muted-foreground/80 group-has-disabled:group-hover:text-muted-foreground"
						)}
					>
						You can enable or disable notifications at any time.
					</p>
				</div>
			</Label>
		</div>
	);
}
