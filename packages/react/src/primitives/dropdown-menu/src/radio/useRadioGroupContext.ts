import { useContext } from "react";
import { RadioGroupContext } from "./context";

export function useRadioGroupCtx() {
	const ctx = useContext(RadioGroupContext);
	if (!ctx) throw new Error("RadioItem must be used within <RadioGroup />");
	return ctx;
}
