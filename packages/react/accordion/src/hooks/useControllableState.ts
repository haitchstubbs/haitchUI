"use client";

import * as React from "react";

export function useControllableState<T>(params: {
	value?: T;
	defaultValue: T;
	onChange?: (value: T) => void;
}) {
	const { value, defaultValue, onChange } = params;

	const [uncontrolled, setUncontrolled] = React.useState<T>(defaultValue);
	const isControlled = value !== undefined;

	const state = (isControlled ? value : uncontrolled) as T;

	const setState = React.useCallback(
		(next: T | ((prev: T) => T)) => {
			const resolved = typeof next === "function" ? (next as any)(state) : next;
			onChange?.(resolved);
			if (!isControlled) setUncontrolled(resolved);
		},
		[isControlled, onChange, state]
	);

	return [state, setState] as const;
}
