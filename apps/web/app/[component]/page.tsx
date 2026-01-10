import { highlight } from "@haitch/react-code-block/server";
import { Separator } from "../../components/ui/separator";
import CodeBlockDemoCard from "../code-block/demo-with-card";

import { getPageContent } from "./_util/getPageContent";
import DemoCard from "../components/_ui/demo-card";

export default async function ComponentDocPage({ params }: { params: Promise<{ component: string }> }) {
	const { code, highlightedCode, error, Component } = await getPageContent({ params });
	const ComponentContent = Component ? <Component code={code} highlightedHtml={highlightedCode} /> : null;
	return (
		<section className="p-10">
			<div className="max-w-3xl mx-auto flex flex-col gap-8">
				<div>
					<h1 className="text-3xl font-bold mb-6">Code Block Example</h1>
					<p className="mb-8 text-lg text-muted-foreground">
						This is an example of a code block component with syntax highlighting, copy to clipboard, and expand/collapse functionality.
					</p>
					<Separator />
				</div>

				<DemoCard code={code} highlightedHtml={highlightedCode}>
					{ComponentContent}
				</DemoCard>
			</div>
		</section>
	);
}
