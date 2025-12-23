import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@haitch/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@haitch/ui";

export function AccordionCard() {
	return (
		<Card className="col-span-4">
			<CardHeader>
				<CardTitle>Accordion Component</CardTitle>
				<CardDescription>
					An accordion is a vertically stacked list of items that can be expanded or collapsed to reveal or hide content associated with
					them.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Accordion type="single" className="w-full">
					<AccordionItem value="item-1">
						<AccordionTrigger>Section 1</AccordionTrigger>
						<AccordionContent>
							<p className="text-sm text-muted-foreground">
								This is the content for section 1. It can include text, images, or any other elements you want to display when the
								section is expanded.
							</p>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item-2">
						<AccordionTrigger>Section 2</AccordionTrigger>
						<AccordionContent>
							<p className="text-sm text-muted-foreground">
								This is the content for section 2. Accordions help organize content and improve user experience by allowing users to
								focus on one section at a time.
							</p>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</CardContent>
		</Card>
	);
}
