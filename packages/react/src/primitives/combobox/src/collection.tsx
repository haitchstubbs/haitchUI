"use client";

import * as React from "react";
import { useComboboxContext } from "./context";
import type { CollectionProps } from "./types";

export function Collection(props: CollectionProps) {
	useComboboxContext("Combobox.Collection");
	if (typeof props.children === "function") return null;
	return <>{props.children ?? null}</>;
}

