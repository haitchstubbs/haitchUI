"use client";

import * as React from "react";

import {
	CodeBlock,
	CodeBlockHeader,
	CodeBlockHeaderText,
	CodeBlockTitle,
	CodeBlockHeaderActions,
	CodeBlockCopy,
	CodeBlockContent,
	CodeBlockCode,
	CodeBlockActions,
	CodeBlockExpand,
} from "../ui/code-block";
import { IconCopy } from "@tabler/icons-react";

interface MdxCodeBlockProps {
	code: string;
	highlightedHtml: string;
	lineCount: number;
	lang?: string;
}
export function MdxCodeBlock({ lang = "txt", ...props }: MdxCodeBlockProps) {
	const { code, highlightedHtml } = props;
	const [shouldExpand, setShouldExpand] = React.useState(props.lineCount > 15);
	const [isExpanded, setIsExpanded] = React.useState(false);

	return (
		<CodeBlock className="w-full" data-code-preview  code={code} highlightedHtml={highlightedHtml} expanded={isExpanded} onExpandedChange={setIsExpanded}>
			<CodeBlockHeader>
				<CodeBlockHeaderText>
					<CodeBlockTitle>.{lang}</CodeBlockTitle>
				</CodeBlockHeaderText>

				<CodeBlockHeaderActions>
					{shouldExpand && <CodeBlockExpand aria-label="Expand code">{isExpanded ? "Collapse" : "Expand"}</CodeBlockExpand>}
					<CodeBlockCopy aria-label="Copy code">
                        <IconCopy className="w-4 h-4" />
                    </CodeBlockCopy>
				</CodeBlockHeaderActions>
			</CodeBlockHeader>

			<CodeBlockContent className="flex flex-col items-center justify-center">
				<CodeBlockCode maxCollapsedHeightClassName="max-h-92" />
				{shouldExpand && !isExpanded && (
					<CodeBlockActions>
						<CodeBlockExpand aria-label="Expand code">Expand</CodeBlockExpand>
					</CodeBlockActions>
				)}
			</CodeBlockContent>
		</CodeBlock>
	);
}
