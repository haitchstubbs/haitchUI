import * as React from "react";
import type { HTMLAttributes } from "react";

// server function (your shiki wrapper)
import { highlight } from "@haitch-ui/react-code-block/server";
import { MdxCodeBlock } from "./code-block";

type PreProps = HTMLAttributes<HTMLPreElement>;

export async function MdxCodeBlockPre(props: PreProps) {
	const { children } = props;

	// MDX produces: <pre><code class="language-ts">...</code></pre>
	const codeElement = React.Children.toArray(children).find((child): child is React.ReactElement => React.isValidElement(child));

	if (!codeElement) return <pre data-code-preview  {...props} />;

	const codeProps = codeElement.props as {
		className?: string;
		children?: React.ReactNode;
	};

	const className = codeProps.className ?? "";
	const lang = extractLang(className) ?? "tsx";
	const rawCode = getNodeText(codeProps.children).replace(/\n$/, "");

	const highlightedHtml = await highlight(rawCode, lang, true);
	if (!highlightedHtml) return null;

	return <MdxCodeBlock data-code-preview code={rawCode} highlightedHtml={highlightedHtml} lang={lang} lineCount={rawCode.split("\n").length} />;
}

function extractLang(className: string): string | null {
	// common MDX patterns: language-ts, language-tsx, lang-ts, etc.
	return className.match(/language-([\w-]+)/)?.[1] ?? className.match(/lang(?:uage)?-([\w-]+)/)?.[1] ?? null;
}

function isElementWithChildren(node: React.ReactNode): node is React.ReactElement<{ children?: React.ReactNode }> {
	return React.isValidElement(node);
}

function getNodeText(node: React.ReactNode): string {
	if (node == null) return "";
	if (typeof node === "string" || typeof node === "number") return String(node);
	if (Array.isArray(node)) return node.map(getNodeText).join("");
	if (isElementWithChildren(node)) return getNodeText(node.props.children);
	return "";
}
