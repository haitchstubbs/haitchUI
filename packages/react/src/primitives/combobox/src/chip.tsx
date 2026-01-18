"use client";

import * as React from "react";
import { Slot } from "@/primitives/slot/src";
import { useComboboxContext } from "./context";
import type { ChipProps } from "./types";

type ChipCtx = { value: unknown };

const ComboboxChipContext = React.createContext<ChipCtx | null>(null);

export function useComboboxChipContext(component: string) {
	const ctx = React.useContext(ComboboxChipContext);
	if (!ctx) throw new Error(`${component} must be used within <Combobox.Chip>.`);
	return ctx;
}

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(function Chip({ asChild, value, ...props }, forwardedRef) {
	useComboboxContext("Combobox.Chip");
	const Comp: any = asChild ? Slot : "div";
	return (
		<ComboboxChipContext.Provider value={{ value }}>
			<Comp ref={forwardedRef} {...props} />
		</ComboboxChipContext.Provider>
	);
});
