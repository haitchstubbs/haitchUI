import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Collapsible, CollapsibleContent, CollapsibleTrigger } from "@haitch/ui";
import { IconSelector } from "@tabler/icons-react";

export function CollapsibleCard() {
	return (
		<Card className="col-span-4">
			<CardHeader>
				<CardTitle>Collapsible Component</CardTitle>
				<CardDescription>
					An accordion is a vertically stacked list of items that can be expanded or collapsed to reveal or hide content associated with
					them.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Collapsible className="flex w-87.5 flex-col gap-2">
					<CollapsibleTrigger asChild>
						<Button variant="default">
							<h4 className="text-sm font-semibold">This is a @haitch/ui Collapsible component</h4>
							<IconSelector />
							<span className="sr-only">Toggle</span>
						</Button>
					</CollapsibleTrigger>
					<div className="rounded-md border px-4 py-2 text-sm">It has no dependencies</div>
					<CollapsibleContent className="flex flex-col gap-2">
						<div className="rounded-md border px-4 py-2 text-sm">Supports DOM, Shadow DOM</div>
						<div className="rounded-md border px-4 py-2 text-sm">Accessible and customizable</div>
					</CollapsibleContent>
				</Collapsible>
			</CardContent>
		</Card>
	);
}
