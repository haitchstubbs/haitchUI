import { useContext } from "react";
import { SubContext } from "./context";

export function useSubCtx() {
	const ctx = useContext(SubContext);
	if (!ctx) throw new Error("SubTrigger/SubContent must be wrapped in <Sub />");
	return ctx;
}
