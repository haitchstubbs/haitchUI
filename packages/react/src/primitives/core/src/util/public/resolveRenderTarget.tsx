import { Children, Fragment, isValidElement } from "react";
import { isWhitespaceText } from "../internal/isWhitespaceText";
import { getSingleChildElement } from "../internal/getSingleChildElement";

export interface InputProps {
	asChild?: boolean;
	defaultElement: React.ElementType;
	children: React.ReactNode;
}

export interface SlotProps {
	type: "slot";
	element: React.ReactElement;
}

export interface ElementProps {
	type: "native";
	elementType: React.ElementType;
}

export type ResolveRenderTargetOptions = InputProps;

export type ResolveRenderTargetResult = SlotProps | ElementProps;


export function resolveRenderTarget({ asChild, defaultElement, children }: ResolveRenderTargetOptions): ResolveRenderTargetResult {
	if (asChild) {
		return {
			type: "slot",
			element: getSingleChildElement(children), // throws if invalid
		};
	}

	return {
		type: "native",
		elementType: defaultElement,
	};
}
