"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";

import {
	CodeBlock,
	CodeBlockHeader,
	CodeBlockHeaderText,
	CodeBlockTitle,
	CodeBlockHeaderActions,
	CodeBlockContent,
	CodeBlockCode,
	CodeBlockActions,
	CodeBlockCopy,
	CodeBlockExpand,
} from "../../components/ui/code-block";
import { IconBrandTypescript, IconCopy } from "@tabler/icons-react";
import { Separator } from "../../components/ui/separator";
import { Card, CardContent } from "../../components/ui/card";

export default function CodeBlockDemoCard({
	code,
	highlightedHtml,
	children,
}: {
	code: string;
	highlightedHtml: string;
	children?: React.ReactNode;
}) {
	return (
		<div data-code-preview  className="flex flex-col gap-0 w-full">
			<Card className="bg-background rounded-b-none p-12 rounded-t-lg w-full">
				<CardContent className="min-h-106 p-0 flex items-center justify-center w-full">{children}</CardContent>
			</Card>
			<CodeBlock
				data-code-preview
				code={code}
				highlightedHtml={highlightedHtml}
				expanded={true}
				className="rounded-t-none border border-border border-t-0 rounded-b-lg overflow-clip"
			>
				<CodeBlockContent className="relative w-full">
					<Button asChild variant="ghost" className="h-7 w-7 aspect-square absolute top-4 right-4 z-10">
						<CodeBlockCopy className="aspect-square">
							<IconCopy />
						</CodeBlockCopy>
					</Button>
					<CodeBlockCode className="w-full bg-sidebar" maxCollapsedHeightClassName="max-h-96" scrollable />
				</CodeBlockContent>
			</CodeBlock>
		</div>
	);
}
