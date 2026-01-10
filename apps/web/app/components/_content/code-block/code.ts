const primary = `"use client";

import { useState } from "react";
import { Button } from "../../../../components/ui/button";

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
} from "../../../../components/ui/code-block";
import { IconBrandTypescript, IconCopy } from "@tabler/icons-react";
import { Separator } from "../../../../components/ui/separator";

export function CodeBlockDemo({ code, highlightedHtml }: { code: string; highlightedHtml: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <CodeBlock 
        code={code} 
        highlightedHtml={highlightedHtml} 
        expanded={expanded} 
        onExpandedChange={setExpanded} 
        className=" border border-border rounded-lg overflow-clip"
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

        <CodeBlockContent className="h-fit">
          <CodeBlockCode className="bg-sidebar" maxCollapsedHeightClassName="h-80" scrollable={expanded && true} />

          {!expanded && (
            <CodeBlockActions className="-mt-10">
              <CodeBlockExpand>Expand</CodeBlockExpand>
            </CodeBlockActions>
          )}
        </CodeBlockContent>
      </CodeBlock>
    </>
  );
}`;

export {primary};
const code = {primary} as const satisfies Record<string, string>;
export default code;
