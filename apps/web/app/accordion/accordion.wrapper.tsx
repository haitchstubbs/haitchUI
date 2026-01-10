"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";

import {
	CodeBlock,
	CodeBlockHeader,
	CodeBlockHeaderText,
	CodeBlockTitle,
	CodeBlockDescription,
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
import AccordionDemo from "./accordion.component";

export default function AccordionWrapper({ code, highlightedHtml }: { code: string; highlightedHtml: string }) {
	const [expanded, setExpanded] = useState(false);
	return (
		<div>
			<Card className="bg-background border-b-0 rounded-b-none rounded-t-md h-124">
				<CardContent className="p-24">
					<AccordionDemo />
				</CardContent>
			</Card>
			<CodeBlock
				code={code}
				highlightedHtml={highlightedHtml}
				expanded={expanded}
				onExpandedChange={setExpanded}
				className="rounded-t-none border-t-0 rounded-b-md mt-0"
			>
				<CodeBlockHeader>
					<IconBrandTypescript className="w-4 h-4 text-muted-foreground" />
					<CodeBlockHeaderText>
						<CodeBlockTitle>Accordion Example</CodeBlockTitle>
					</CodeBlockHeaderText>

					<CodeBlockHeaderActions>
						<Button asChild variant="ghost" className=" w-fit px-2 py-1! h-fit">
							<CodeBlockExpand>{expanded ? "Collapse" : "Expand"}</CodeBlockExpand>
						</Button>

						<Separator orientation="vertical" />

						<Button asChild variant="ghost" className="h-7 w-7 aspect-square">
							<CodeBlockCopy className="aspect-square">
								<IconCopy />
							</CodeBlockCopy>
						</Button>
					</CodeBlockHeaderActions>
				</CodeBlockHeader>

				<CodeBlockContent className="flex flex-col items-center justify-evenly w-full mx-0 px-0">
					<CodeBlockCode className="w-full bg-sidebar" />

					{!expanded && (
						<CodeBlockActions className=" -mt-5 w-full bottom-0 border-none flex items-center justify-center ">
							<CodeBlockExpand>Expand</CodeBlockExpand>
						</CodeBlockActions>
					)}
				</CodeBlockContent>
			</CodeBlock>
		</div>
	);
}
