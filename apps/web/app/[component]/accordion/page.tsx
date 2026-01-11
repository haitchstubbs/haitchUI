import { highlight } from "@haitch-ui/react-code-block/server";
import { Separator } from "../../../components/ui/separator";
import DemoCard from "../../components/_ui/demo-card";
import { code, Component, wrapper } from "./code";
import {
	CodeBlock,
	CodeBlockCode,
	CodeBlockContent,
	CodeBlockCopy,
	CodeBlockExpand,
	CodeBlockHeader,
	CodeBlockHeaderActions,
	CodeBlockHeaderText,
	CodeBlockTitle,
} from "../../../components/ui/code-block";
import { Button } from "../../../components/ui/button";
import { IconBrandTypescript, IconCopy } from "@tabler/icons-react";

export default async function Page() {
	const highlightedCode = await highlight(code, "tsx");

	const npmScript = `npm install @haitch-ui/react-accordion \n # or yarn add @haitch-ui/react-accordion \n # or pnpm add @haitch-ui/react-accordion`;
	const bash = await highlight(npmScript, "bash", false);

	const highlightedWrapper = await highlight(wrapper, "tsx");

	if (!highlightedCode) return null;
	return (
		<section className="pt-10 max-w-3xl mx-auto flex flex-col gap-10">
			<div className="flex flex-col gap-8">
				<div>
					<h1 className="text-3xl font-bold mb-6">Accordion Component</h1>
					<p className="mb-8 text-lg text-muted-foreground">
						This is an example of an accordion component with multiple items that can be expanded and collapsed.
					</p>
					<Separator />
				</div>

				<DemoCard code={code} highlightedHtml={highlightedCode}>
					<Component />
				</DemoCard>
			</div>
			<Separator />
			<div className="flex flex-col gap-6">
				<h1 className="text-2xl font-bold">Installation</h1>
				<p className="text-muted-foreground">To install the Accordion component, run the following command in your project directory:</p>
				<CodeBlock code={npmScript} highlightedHtml={bash} expanded={true} className="rounded-lg border border-border overflow-clip">
					<CodeBlockContent className="relative">
						<Button asChild variant="ghost" className="h-7 w-7 aspect-square absolute top-4 right-4 z-10">
							<CodeBlockCopy className="aspect-square">
								<IconCopy />
							</CodeBlockCopy>
						</Button>
						<CodeBlockCode className="w-full bg-sidebar" maxCollapsedHeightClassName="max-h-96" scrollable />
					</CodeBlockContent>
				</CodeBlock>
				<h2 className="text-2xl font-bold">Usage</h2>
				<p className="text-muted-foreground">
					Create the accordion by using the <code>Accordion</code> component as the root, and nest <code>AccordionItem</code>,{" "}
					<code>AccordionTrigger</code>, and <code>AccordionContent</code> components to define each accordion item.
				</p>
				<CodeBlock
					code={wrapper}
					highlightedHtml={highlightedWrapper}
					className="rounded-lg border border-border overflow-clip"
				>
					<CodeBlockHeader>
						<IconBrandTypescript className="w-4 h-4 text-muted-foreground" />
						<CodeBlockHeaderText>
							<CodeBlockTitle>Accordion Example</CodeBlockTitle>
						</CodeBlockHeaderText>

						<CodeBlockHeaderActions>
							<Button asChild variant="ghost" className=" w-fit px-2 py-1! h-fit">
								<CodeBlockExpand>Expand/Collapse</CodeBlockExpand>
							</Button>

							<Separator orientation="vertical" />

							<Button asChild variant="ghost" className="h-7 w-7 aspect-square">
								<CodeBlockCopy className="aspect-square">
									<IconCopy />
								</CodeBlockCopy>
							</Button>
						</CodeBlockHeaderActions>
					</CodeBlockHeader>
					<CodeBlockContent className="relative">
						<CodeBlockCode className="w-full bg-sidebar" maxCollapsedHeightClassName="max-h-96" />
					</CodeBlockContent>
				</CodeBlock>
			</div>
		</section>
	);
}
