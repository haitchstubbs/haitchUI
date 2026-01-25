import { Children, Fragment, isValidElement } from "react";
import { isIgnorableChild } from "./isIgnorableChild";

export function getSingleChildElement(children: React.ReactNode): React.ReactElement {
	const arr = Children.toArray(children).filter((c) => !isIgnorableChild(c));

	if (arr.length !== 1) {
		throw new Error("Slot expects a single valid React element child. " + `Received ${arr.length} non-whitespace children.`);
	}

	const only = arr[0];

	if (!isValidElement(only)) {
		throw new Error("Slot expects a single valid React element child.");
	}

	// Disallow fragments explicitly: you can't safely attach props/ref to a fragment.
	if (only.type === Fragment) {
		throw new Error("Slot child must be a single element, not a React.Fragment.");
	}

	return only;
}