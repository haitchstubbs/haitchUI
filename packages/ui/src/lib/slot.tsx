import * as React from "react";
import { composeRefs } from "@haitch-ui/react";

type AnyProps = Record<string, unknown>;

function isWhitespaceText(node: unknown): node is string {
	return typeof node === "string" && node.trim() === "";
}

function isIgnorableChild(node: unknown): boolean {
	// Ignore whitespace-only text nodes (common with formatted JSX)
	// NOTE: We intentionally do NOT ignore numbers/other strings.
	return isWhitespaceText(node);
}

function getSingleChildElement(children: React.ReactNode): React.ReactElement {
	const arr = React.Children.toArray(children).filter((c) => !isIgnorableChild(c));

	if (arr.length !== 1) {
		throw new Error("Slot expects a single valid React element child. " + `Received ${arr.length} non-whitespace children.`);
	}

	const only = arr[0];

	if (!React.isValidElement(only)) {
		throw new Error("Slot expects a single valid React element child.");
	}

	// Disallow fragments explicitly: you can't safely attach props/ref to a fragment.
	if (only.type === React.Fragment) {
		throw new Error("Slot child must be a single element, not a React.Fragment.");
	}

	return only;
}

export const Slot = React.forwardRef<HTMLElement, { children: React.ReactNode } & AnyProps>(function Slot(props, forwardedRef) {
	const { children, ...slotProps } = props;

	const child = getSingleChildElement(children as React.ReactNode);

	// IMPORTANT: ref is on the element, not in props
	// ReactElement has a reserved `ref` field (not in props) for host/class components.
	// For forwardRef components, it's still on element.ref in practice.
	const childRef = (child.props as any)?.ref ?? (child as any)?.ref;

	const childProps: AnyProps = (child.props ?? {}) as AnyProps;

	// slot props win by default (matches your previous behavior)
	const mergedProps: AnyProps = { ...childProps, ...slotProps };

	// merge className (keep both if both exist)
	const childClassName = (childProps as any).className;
	const slotClassName = (slotProps as any).className;
	if (childClassName && slotClassName) {
		mergedProps.className = `${childClassName} ${slotClassName}`;
	}

	// merge style (shallow merge, slot wins on conflicts)
	const childStyle = (childProps as any).style;
	const slotStyle = (slotProps as any).style;
	if (childStyle && slotStyle) {
		mergedProps.style = { ...childStyle, ...slotStyle };
	}

	// compose common event handlers (if both exist)
	const events = [
		"onClick",
		"onMouseDown",
		"onMouseUp",
		"onPointerDown",
		"onPointerUp",
		"onMouseEnter",
		"onMouseLeave",
		"onFocus",
		"onBlur",
		"onKeyDown",
		"onKeyUp",
	] as const;

	for (const key of events) {
		const a = (childProps as any)[key];
		const b = (slotProps as any)[key];

		// If both exist, run child first then slot (matches your previous behavior)
		if (typeof a === "function" && typeof b === "function") {
			(mergedProps as any)[key] = (...args: unknown[]) => {
				a(...args);
				b(...args);
			};
		}
	}

	// compose refs (use child.ref, not child.props.ref)
	(mergedProps as any).ref = composeRefs(childRef, forwardedRef as any);

	return React.cloneElement(child, mergedProps as any);
});
