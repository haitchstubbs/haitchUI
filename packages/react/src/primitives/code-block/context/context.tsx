"use client";

import { createTypedContext } from "@/utils/createTypedContext";
import * as React from "react";

export type CodeBlockCtx = {
	code: string;
	lang: string;
	highlightedHtml: string;

	expanded: boolean;
	setExpanded: (next: boolean | ((v: boolean) => boolean)) => void;

	copy: () => Promise<void>;
};

const { Context: CodeBlockContext, useContext: useCodeBlockContext } = createTypedContext<CodeBlockCtx, "CodeBlock">({
	name: "CodeBlock",
	errorMessage: (component) => `${component} must be used within CodeBlock.Root`,
});


function CodeBlockProvider({ value, children }: { value: CodeBlockCtx; children: React.ReactNode }) {
	return <CodeBlockContext.Provider value={value}>{children}</CodeBlockContext.Provider>;
}

export { useCodeBlockContext, CodeBlockProvider, CodeBlockContext };
