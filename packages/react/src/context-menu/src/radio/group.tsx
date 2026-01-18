import { useMemo } from "react";
import { useControllableState } from "../hooks/useControllableState";
import type { RadioGroupCtx, RadioGroupProps } from "../types";
import { RadioGroupContext } from "./context";

export function RadioGroup({ value, defaultValue, onValueChange, disabled, children }: RadioGroupProps) {
	const [v, setV] = useControllableState<string>({
		value,
		defaultValue,
		onChange: onValueChange,
	});

	const ctx = useMemo<RadioGroupCtx>(
		() => ({
			value: v,
			setValue: (next) => setV(next),
			disabled,
		}),
		[v, setV, disabled]
	);

	return (
		<RadioGroupContext.Provider value={ctx}>
			<div role="group" data-slot="dropdown-menu-radio-group">
				{children}
			</div>
		</RadioGroupContext.Provider>
	);
}
