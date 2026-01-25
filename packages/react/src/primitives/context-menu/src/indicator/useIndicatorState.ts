import { useContext } from "react";
import { ItemIndicatorContext } from "./context";

export function useIndicatorState() {
	return useContext(ItemIndicatorContext);
}
