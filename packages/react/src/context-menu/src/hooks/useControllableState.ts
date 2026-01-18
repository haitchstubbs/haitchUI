import { useCallback, useState } from "react";

export function useControllableState<T>({
	value,
	defaultValue,
	onChange,
}: {
	value: T | undefined;
	defaultValue: T | undefined;
	onChange?: (value: T) => void;
}) {
	const [uncontrolled, setUncontrolled] = useState<T | undefined>(defaultValue);
	const isControlled = value !== undefined;
	const state = (isControlled ? value : uncontrolled) as T | undefined;

	const setState = useCallback(
		(next: T) => {
			onChange?.(next);
			if (!isControlled) setUncontrolled(next);
		},
		[onChange, isControlled]
	);

	return [state, setState] as const;
}
