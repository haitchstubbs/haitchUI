const code = `
import React from "react";
import { Button } from "@/components/ui/button";

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
} from "@/components/ui/code-block";

import { 
  IconBrandTypescript, 
  IconCopy, 
  IconLayoutBottombarCollapse 
} from "@tabler/icons-react";
 
import { Separator } from "@/components/ui/separator";

export default function CodeBlockDemo({ 
  code, 
  highlightedHtml 
}: { 
  code: string; 
  highlightedHtml: string 
}) {
	const [expanded, setExpanded] = React.useState(false);
	return (
		<CodeBlock 
			code={code} 
			highlightedHtml={highlightedHtml} 
			expanded={expanded} 
			onExpandedChange={setExpanded} 
			className="h-full"
		>
			<CodeBlockHeader>
				<IconBrandTypescript className="w-4 h-4 text-muted-foreground" />
				<CodeBlockHeaderText>
					<CodeBlockTitle>Accordion Example</CodeBlockTitle>
				</CodeBlockHeaderText>

				<CodeBlockHeaderActions>
					<Button asChild variant="ghost" className=" w-fit px-2 py-1! h-fit">
						<CodeBlockExpand>
							{expanded ? "Collapse" : "Expand"}
							</CodeBlockExpand>
					</Button>

					<Separator orientation="vertical" />

					<Button asChild variant="ghost" className="h-7 w-7 aspect-square">
						<CodeBlockCopy className="aspect-square">
							<IconCopy />
						</CodeBlockCopy>
					</Button>
				</CodeBlockHeaderActions>
			</CodeBlockHeader>

			<CodeBlockContent className="">
				<CodeBlockCode className="bg-sidebar" scrollable={false} />

				{!expanded && (
					<CodeBlockActions className="">
						<CodeBlockExpand>Expand</CodeBlockExpand>
					</CodeBlockActions>
				)}
			</CodeBlockContent>
		</CodeBlock>
	);
}`;

export default code;