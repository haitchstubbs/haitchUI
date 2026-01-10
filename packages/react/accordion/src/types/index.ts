"use client";

import type * as React from "react";

export type Orientation = "vertical" | "horizontal";
export type Direction = "ltr" | "rtl";

export type RootSingleProps = {
	type: "single";
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	collapsible?: boolean;
};

export type RootMultipleProps = {
	type: "multiple";
	value?: string[];
	defaultValue?: string[];
	onValueChange?: (value: string[]) => void;
    collapsible?: boolean;
};

export type RootProps = (RootSingleProps | RootMultipleProps) & {
	asChild?: boolean;
	disabled?: boolean;
	orientation?: Orientation;
	dir?: Direction;
} & React.HTMLAttributes<HTMLElement>;

export type ItemProps = {
	asChild?: boolean;
	value: string;
	disabled?: boolean;
} & React.HTMLAttributes<HTMLElement>;

export type HeaderProps = {
	asChild?: boolean;
} & React.HTMLAttributes<HTMLElement>;

export type TriggerProps = {
	asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export type ContentProps = {
	asChild?: boolean;
	forceMount?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;
