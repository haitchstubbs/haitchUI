import { useCallback, useState } from "react";

function usePortalTrigger(opts: { value?: boolean; defaultValue?: boolean; onChange?: (next: boolean) => void }) {
	const [uncontrolled, setUncontrolled] = useState(opts.defaultValue ?? false);
	const isControlled = typeof opts.value === "boolean";
	const value = isControlled ? (opts.value as boolean) : uncontrolled;

	const setValue = useCallback(
		(next: boolean) => {
			if (!isControlled) setUncontrolled(next);
			opts.onChange?.(next);
		},
		[isControlled, opts.onChange]
	);

	return [value, setValue] as const;
}

export { usePortalTrigger };