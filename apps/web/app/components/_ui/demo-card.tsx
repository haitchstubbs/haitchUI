"use client";

import { Button } from "../../../components/ui/button";

import { CodeBlock, CodeBlockContent, CodeBlockCode, CodeBlockCopy } from "../../../components/ui/code-block";
import { IconCopy } from "@tabler/icons-react";
import { Card, CardContent } from "../../../components/ui/card";

export default function DemoCard({ code, highlightedHtml, children }: { code: string; highlightedHtml: string; children?: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-0 h-fit">
			<Card className="bg-background rounded-b-none p-12 rounded-t-lg">
				<CardContent className="p-0 flex shrink-0 items-center justify-center">{children}</CardContent>
			</Card>
			<CodeBlock
				code={code}
				highlightedHtml={highlightedHtml}
				expanded={true}
				className="rounded-t-none border border-border border-t-0 rounded-b-lg overflow-clip"
			>
				<CodeBlockContent className="relative">
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
