"use client";

import * as React from "react";
import { IconCheck, IconMinus } from "@tabler/icons-react";
import { cn } from "../../lib/util";
type CheckboxProps = Omit<React.ComponentPropsWithoutRef<"button">, "defaultChecked" | "checked" | "onChange" | "type"> & {
	/**
	 * Controls the checkbox state (controlled mode).
	 * When provided, `onCheckedChange` is required for updates.
	 */
	checked?: boolean;

	/**
	 * Indeterminate state (visual only).
	 */
	indeterminate?: boolean;

	/**
	 * Initial state (uncontrolled mode).
	 */
	defaultChecked?: boolean;

	/**
	 * Called whenever the checked state changes.
	 */
	onCheckedChange?: (checked: boolean) => void;

	/**
	 * Standard checkbox props (forwarded to the hidden input)
	 */
	name?: string;
	value?: string;
	required?: boolean;
	form?: string;
	id?: string;
	autoFocus?: boolean;
};

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
	{
		className,
		checked,
		defaultChecked,
		disabled,
		required,
		name,
		value,
		indeterminate,
		form,
		id,
		autoFocus,
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledBy,
		"aria-describedby": ariaDescribedBy,
		"aria-invalid": ariaInvalid,
		onCheckedChange,
		onClick,
		onKeyDown,
		...buttonProps
	},
	buttonRef
) {
	const inputRef = React.useRef<HTMLInputElement | null>(null);
	const controlledCheckedRef = React.useRef<boolean>(false);

	const isControlled = typeof checked === "boolean";

	const [uncontrolledChecked, setUncontrolledChecked] = React.useState<boolean>(defaultChecked ?? false);
	const isChecked = isControlled ? (checked as boolean) : uncontrolledChecked;

	if (isControlled) {
		controlledCheckedRef.current = checked as boolean;
	}

	const isIndeterminate = !!indeterminate && !isChecked;

	React.useEffect(() => {
		if (inputRef.current) inputRef.current.indeterminate = isIndeterminate;
	}, [isIndeterminate]);

	// Keep uncontrolled state in sync if defaultChecked changes (rare but nice)
	React.useEffect(() => {
		if (!isControlled && typeof defaultChecked === "boolean") {
			setUncontrolledChecked(defaultChecked);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [defaultChecked]);

	const setChecked = React.useCallback(
		(next: boolean) => {
			if (!isControlled) setUncontrolledChecked(next);
			onCheckedChange?.(next);
		},
		[isControlled, onCheckedChange]
	);

	return (
		<span data-slot="checkbox-root" className="inline-flex items-center">
			{/* Native checkbox for semantics, label compatibility, and forms */}
			<input
				ref={inputRef}
				id={id}
				name={name}
				value={value}
				form={form}
				required={required}
				disabled={disabled}
				autoFocus={autoFocus}
				type="checkbox"
				className="peer sr-only"
				checked={isControlled ? checked : undefined}
				defaultChecked={!isControlled ? defaultChecked : undefined}
				aria-label={ariaLabel}
				aria-labelledby={ariaLabelledBy}
				aria-describedby={ariaDescribedBy}
				aria-invalid={ariaInvalid}
				onClick={(e) => {
					if (!isControlled) return;
					e.preventDefault();
					e.stopPropagation();
					e.currentTarget.checked = controlledCheckedRef.current;
					(e.nativeEvent as any)?.stopImmediatePropagation?.();
					onCheckedChange?.(!(checked as boolean));

					queueMicrotask(() => {
						if (inputRef.current) inputRef.current.checked = controlledCheckedRef.current;
					});
				}}
				onChange={(e) => {
					// For native interactions: label click, keyboard, programmatic clicks, etc.
					if (isControlled) return;
					setChecked(e.currentTarget.checked);
				}}
			/>

			{/* Visible UI control. Not the semantic checkbox. */}
			<button
				{...buttonProps}
				ref={buttonRef}
				type="button"
				// The input is the accessible control; this is the visual surface.
				aria-hidden="true"
				tabIndex={-1}
				disabled={disabled}
				data-state={isChecked ? "checked" : "unchecked"}
				data-slot="checkbox"
				className={cn(
					// Base styling
					"border-input dark:bg-input/10 size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none",
					// State styling via data-state (your existing pattern)
					"data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary dark:data-[state=checked]:bg-primary",
					// Focus styling driven by the REAL input
					"peer-focus-visible:border-ring peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px]",
					// Invalid styling driven by the REAL input (if you use aria-invalid on the input externally)
					"peer-aria-invalid:ring-destructive/20 dark:peer-aria-invalid:ring-destructive/40 peer-aria-invalid:border-destructive",
					// Disabled styling driven by prop
					"disabled:cursor-not-allowed disabled:opacity-50",
					// Indeterminate styling
					"data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground data-[state=indeterminate]:border-primary",
					className
				)}
				onClick={(event) => {
					onClick?.(event);
					if (event.defaultPrevented || disabled) return;

					// Prevent label default activation from also toggling the input (double toggle)
					// when the checkbox is wrapped in a <label>.
					event.preventDefault();

					// Delegate the real toggle to the input so native change events fire.
					inputRef.current?.click();
				}}
				onKeyDown={(e) => {
					// Since button is not focusable (tabIndex=-1), this usually won't run,
					// but keep it for completeness in case someone focuses it programmatically.
					onKeyDown?.(e);
					if (e.defaultPrevented || disabled) return;

					if (e.key === " " || e.key === "Enter") {
						e.preventDefault();
						inputRef.current?.click();
					}
				}}
			>
				<span data-slot="checkbox-indicator" className="grid place-content-center text-current transition-none  ">
					{isIndeterminate ? (
						<IconMinus className="size-3.5" />
					) : isChecked ? (
						<IconCheck className="size-3.5" />
					) : null}
				</span>
			</button>
		</span>
	);
});

export { Checkbox };
