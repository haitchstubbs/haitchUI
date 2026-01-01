"use client";
import * as React from "react";
import { Slot } from "../lib/slot";

import { IconChevronDown } from "@tabler/icons-react";
import { cn } from "../lib/cn";

type AccordionSingleValue = string | null;
type AccordionMultipleValue = string[];
type AccordionValue = AccordionSingleValue | AccordionMultipleValue;

type AccordionBaseProps = {
	/** Controlled value for the open item(s) */
	value?: AccordionValue;
	/** Default value for uncontrolled mode */
	defaultValue?: AccordionValue;
	/** Callback when value changes */
	onValueChange?: (value: AccordionValue) => void;
	/** Allow multiple items open */
	type?: "single" | "multiple";
	/** Disable all interaction */
	disabled?: boolean;
	/** Tailwind classes */
	className?: string;
	/** Children */
	children: React.ReactNode;
};

const AccordionContext = React.createContext<{
	value: AccordionValue;
	setValue: (value: AccordionValue) => void;
	type: "single" | "multiple";
	disabled?: boolean;
	accordionId: string;
} | null>(null);

export function Accordion({
	value: controlledValue,
	defaultValue,
	onValueChange,
	type = "single",
	disabled,
	className,
	children,
}: AccordionBaseProps) {
	const accordionId = React.useId();

	const isControlled = controlledValue !== undefined;
	const [uncontrolledValue, setUncontrolledValue] = React.useState<AccordionValue>(defaultValue ?? (type === "multiple" ? [] : null));

	const value = isControlled ? controlledValue : uncontrolledValue;

	const setValue = React.useCallback(
		(next: AccordionValue) => {
			if (!isControlled) setUncontrolledValue(next);
			onValueChange?.(next);
		},
		[isControlled, onValueChange]
	);

	const ctx = React.useMemo(() => ({ value, setValue, type, disabled, accordionId }), [value, setValue, type, disabled, accordionId]);
	return (
		<AccordionContext.Provider value={ctx}>
			<div data-accordion className={className}>
				{children}
			</div>
		</AccordionContext.Provider>
	);
}

type AccordionItemProps = {
	value: string;
	disabled?: boolean;
	className?: string;
	children: React.ReactNode;
};

export function AccordionItem({ value, disabled, className, children }: AccordionItemProps) {
	const ctx = React.useContext(AccordionContext);
	if (!ctx) throw new Error("AccordionItem must be used within Accordion");

	const isOpen = ctx.type === "multiple" ? Array.isArray(ctx.value) && ctx.value.includes(value) : ctx.value === value;

	const isDisabled = ctx.disabled || disabled;

	return (
		<div data-accordion-item data-state={isOpen ? "open" : "closed"} aria-disabled={isDisabled} className={className}>
			<AccordionItemContext.Provider value={{ value, isOpen, isDisabled }}>{children}</AccordionItemContext.Provider>
		</div>
	);
}

const AccordionItemContext = React.createContext<{
	value: string;
	isOpen: boolean;
	isDisabled: boolean | undefined;
} | null>(null);

type AccordionTriggerProps = {
	asChild?: boolean;
	className?: string;
	hasIcon?: boolean;
	children: React.ReactNode;
};

export const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger({ asChild, className, children, ...props }, ref) {
    const ctx = React.useContext(AccordionContext);
    const itemCtx = React.useContext(AccordionItemContext);
    if (!ctx || !itemCtx) throw new Error("AccordionTrigger must be inside AccordionItem");

    const { value, isOpen, isDisabled } = itemCtx;

    const contentId = `accordion-content-${ctx.accordionId}-${value}`;
    const triggerId = `accordion-trigger-${ctx.accordionId}-${value}`;

    const handleClick = React.useCallback(() => {
      if (isDisabled) return;

      if (ctx.type === "multiple") {
        const arr = Array.isArray(ctx.value) ? ctx.value : [];
        ctx.setValue(isOpen ? arr.filter((v) => v !== value) : [...arr, value]);
      } else {
        ctx.setValue(isOpen ? null : value);
      }
    }, [ctx, isDisabled, isOpen, value]);

    const btnProps = {
      type: "button" as const,
      id: triggerId, // ✅ trigger gets its own id (optional but good)
      "aria-expanded": isOpen,
      "aria-controls": contentId, // ✅ points at content id
      disabled: isDisabled,
      "data-state": isOpen ? "open" : "closed",
      className,
      onClick: handleClick,
      ref,
      ...props,
    };

    if (asChild) return <Slot {...btnProps}>{children}</Slot>;

    return (
      <button {...btnProps} className={cn("flex items-center justify-between", btnProps.className)}>
        {children}
        {props.hasIcon !== false && (
          <IconChevronDown className={cn("ml-2 transition-transform duration-200 size-3", isOpen && "rotate-180")} />
        )}
      </button>
    );
  }
);

type AccordionContentProps = {
	asChild?: boolean;
	className?: string;
	children: React.ReactNode;
};

export const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  function AccordionContent({ asChild, className, children, ...props }, ref) {
    const ctx = React.useContext(AccordionContext);
    const itemCtx = React.useContext(AccordionItemContext);
    if (!ctx || !itemCtx) throw new Error("AccordionContent must be inside AccordionItem");

    const { value, isOpen } = itemCtx;

    const contentId = `accordion-content-${ctx.accordionId}-${value}`;
    const triggerId = `accordion-trigger-${ctx.accordionId}-${value}`;

    const contentProps = {
      id: contentId,
      role: "region",                // ✅ optional but improves SR experience
      "aria-labelledby": triggerId,  // ✅ links region to trigger
      "aria-hidden": !isOpen,
      hidden: !isOpen,
      "data-state": isOpen ? "open" : "closed",
      className,
      ref,
      ...props,
    };

    if (asChild) return <Slot {...contentProps}>{children}</Slot>;

    return <div {...contentProps}>{children}</div>;
  }
);
