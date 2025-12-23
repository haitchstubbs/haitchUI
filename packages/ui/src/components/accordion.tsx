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
    const isControlled = controlledValue !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = React.useState<AccordionValue>(
        defaultValue ?? (type === "multiple" ? [] : null)
    );

    const value = isControlled ? controlledValue : uncontrolledValue;

    const setValue = React.useCallback(
        (next: AccordionValue) => {
            if (!isControlled) setUncontrolledValue(next);
            onValueChange?.(next);
        },
        [isControlled, onValueChange]
    );

    const ctx = React.useMemo(
        () => ({ value, setValue, type, disabled }),
        [value, setValue, type, disabled]
    );

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

export function AccordionItem({
    value,
    disabled,
    className,
    children,
}: AccordionItemProps) {
    const ctx = React.useContext(AccordionContext);
    if (!ctx) throw new Error("AccordionItem must be used within Accordion");

    const isOpen =
        ctx.type === "multiple"
            ? Array.isArray(ctx.value) && ctx.value.includes(value)
            : ctx.value === value;

    const isDisabled = ctx.disabled || disabled;

    return (
        <div
            data-accordion-item
            data-state={isOpen ? "open" : "closed"}
            aria-disabled={isDisabled}
            className={className}
        >
            <AccordionItemContext.Provider value={{ value, isOpen, isDisabled }}>
                {children}
            </AccordionItemContext.Provider>
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

        const handleClick = React.useCallback(
            (e: React.MouseEvent<HTMLButtonElement>) => {
                if (isDisabled) return;
                if (ctx.type === "multiple") {
                    const arr = Array.isArray(ctx.value) ? ctx.value : [];
                    if (isOpen) {
                        ctx.setValue(arr.filter((v) => v !== value));
                    } else {
                        ctx.setValue([...arr, value]);
                    }
                } else {
                    ctx.setValue(isOpen ? null : value);
                }
            },
            [ctx, value, isOpen, isDisabled]
        );

        const btnProps = {
            type: "button" as const,
            "aria-expanded": isOpen,
            "aria-controls": `accordion-content-${value}`,
            "data-state": isOpen ? "open" : "closed",
            disabled: isDisabled,
            className,
            onClick: handleClick,
            ref,
            ...props,
        };

        if (asChild) {
            return (
                <Slot {...btnProps}>{children}</Slot>
            );
        }

        return (
            <button {...btnProps} className={cn("flex items-center justify-between", btnProps.className)}>
                {children}
                {props.hasIcon !== false && (
                    <IconChevronDown
                        className={cn("ml-2 transition-transform duration-200 size-3", isOpen && "rotate-180")}
                    />
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
        const itemCtx = React.useContext(AccordionItemContext);
        if (!itemCtx) throw new Error("AccordionContent must be inside AccordionItem");
        const { value, isOpen, isDisabled } = itemCtx;

        const contentProps = {
            id: `accordion-content-${value}`,
            "aria-hidden": !isOpen,
            "data-state": isOpen ? "open" : "closed",
            hidden: !isOpen,
            className,
            ref,
            ...props,
        };

        if (asChild) {
            return <Slot {...contentProps}>{children}</Slot>;
        }

        return (
            <div {...contentProps}>
                {children}
            </div>
        );
    }
);

// Usage example (remove in production):
// <Accordion type="single" defaultValue="item-1">
//   <AccordionItem value="item-1">
//     <AccordionTrigger>Section 1</AccordionTrigger>
//     <AccordionContent>Content 1</AccordionContent>
//   </AccordionItem>
//   <AccordionItem value="item-2">
//     <AccordionTrigger>Section 2</AccordionTrigger>
//     <AccordionContent>Content 2</AccordionContent>
//   </AccordionItem>
// </Accordion>