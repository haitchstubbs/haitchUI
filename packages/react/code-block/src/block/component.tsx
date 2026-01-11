"use client";

import * as React from "react";
import { Slot } from "@haitch-ui/react-slot";
import { CodeBlockProvider, useCodeBlockContext } from "../context";

function cn(...classes: Array<string | undefined | false>) {
	return classes.filter(Boolean).join(" ");
}

type RootProps = {
	code: string;
	lang?: string;
	highlightedHtml: string;

	defaultExpanded?: boolean;
	expanded?: boolean;
	onExpandedChange?: (expanded: boolean) => void;

	asChild?: boolean;
	className?: string;
	children: React.ReactNode;
};

function useControllableState<T>({
	value,
	defaultValue,
	onChange,
}: {
	value: T | undefined;
	defaultValue: T;
	onChange?: (v: T) => void;
}) {
	const [uncontrolled, setUncontrolled] = React.useState<T>(defaultValue);
	const isControlled = value !== undefined;
	const state = isControlled ? (value as T) : uncontrolled;

	const setState = React.useCallback(
		(next: T | ((prev: T) => T)) => {
			const resolved = typeof next === "function" ? (next as (p: T) => T)(state) : next;
			if (!isControlled) setUncontrolled(resolved);
			onChange?.(resolved);
		},
		[isControlled, onChange, state]
	);

	return [state, setState] as const;
}

export function Root({
	code,
	lang = "tsx",
	highlightedHtml,
	defaultExpanded = false,
	expanded: expandedProp,
	onExpandedChange,
	asChild,
	className,
	children,
}: RootProps) {
	const [expanded, setExpanded] = useControllableState<boolean>({
		value: expandedProp,
		defaultValue: defaultExpanded,
		onChange: onExpandedChange,
	});

	const copy = React.useCallback(async () => {
		await navigator.clipboard.writeText(code);
	}, [code]);

	const Comp: any = asChild ? Slot : "div";

	return (
		<CodeBlockProvider
			value={{
				code,
				lang,
				highlightedHtml,
				expanded,
				setExpanded,
				copy,
			}}
		>
			<Comp
				data-slot="codeblock-root"
				data-expanded={expanded ? "" : undefined}
				className={cn("relative", className)}
			>
				{children}
			</Comp>
		</CodeBlockProvider>
	);
}

type CodeProps = {
	asChild?: boolean;
	className?: string;
	maxCollapsedHeightClassName?: string; // e.g. "max-h-64"
};

export function Code({ asChild, className, maxCollapsedHeightClassName = "max-h-64" }: CodeProps) {
	const { highlightedHtml, expanded } = useCodeBlockContext();
	const Comp: any = asChild ? Slot : "div";

	return (
		<Comp
			data-slot="codeblock-code"
			className={cn(!expanded && cn("overflow-hidden", maxCollapsedHeightClassName), className)}
			// Shiki gives trusted HTML you generate server-side.
			dangerouslySetInnerHTML={{ __html: highlightedHtml }}
		/>
	);
}

type CodeActionsProps = {
	asChild?: boolean;
	className?: string;
	children?: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

export function CodeActions({ asChild, className, children, ...props }: CodeActionsProps) {
	const Comp: any = asChild ? Slot : "div";

	return (
		<Comp
			data-slot="codeblock-actions"
			className={cn("absolute top-2 right-2 flex items-center gap-2", className)}
			{...props}
		>
			{children}
		</Comp>
	);
}

type CodeExpandProps = {
	asChild?: boolean;
	className?: string;
	children?: React.ReactNode;
	collapsedLabel?: React.ReactNode;
	expandedLabel?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function CodeExpand({
	asChild,
	className,
	collapsedLabel = "Expand",
	expandedLabel = "Collapse",
	children,
	...props
}: CodeExpandProps) {
	const { expanded, setExpanded } = useCodeBlockContext();
	const Comp: any = asChild ? Slot : "button";

	return (
		<Comp
			type={asChild ? undefined : "button"}
			data-slot="codeblock-expand"
			className={cn(className)}
			onClick={(e: React.MouseEvent) => {
				props.onClick?.(e as any);
				if (!e.defaultPrevented) setExpanded((v) => !v);
			}}
			{...props}
		>
			{children ?? (expanded ? expandedLabel : collapsedLabel)}
		</Comp>
	);
}

type CodeCopyProps = {
	asChild?: boolean;
	className?: string;
	children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function CodeCopy({ asChild, className, children = "Copy", ...props }: CodeCopyProps) {
	const { copy } = useCodeBlockContext();
	const Comp: any = asChild ? Slot : "button";

	return (
		<Comp
			type={asChild ? undefined : "button"}
			data-slot="codeblock-copy"
			className={cn(className)}
			onClick={(e: React.MouseEvent) => {
				props.onClick?.(e as any);
				if (!e.defaultPrevented) void copy();
			}}
			{...props}
		>
			{children}
		</Comp>
	);
}
