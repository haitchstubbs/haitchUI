import { createContext, useContext } from "react";
import { PopoverContextValue } from "./types.js";

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
	const ctx = useContext(PopoverContext);
	if (!ctx) throw new Error("Popover components must be used within <Popover.Root>.");
	return ctx;
}

export { usePopoverContext, PopoverContext };