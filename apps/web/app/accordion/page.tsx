import { highlight } from "@haitch-ui/react-code-block/server";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import AccordionDemo from "./accordion.component";
import AccordionWrapper from "./accordion.wrapper";
import { Separator } from "@haitch-ui/ui";

export default async function AccordionPage() {
	const code = accordionCode;
	const highlightedCode = await highlight(code, "tsx");
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
				<AccordionWrapper code={code} highlightedHtml={highlightedCode} />
			</div>
		</section>
	);
}

const accordionCode = `
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function AccordionDemo() {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue="item-1"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>Product Information</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            Our flagship product combines cutting-edge technology with sleek
            design. Built with premium materials, it offers unparalleled
            performance and reliability.
          </p>
          <p>
            Key features include advanced processing capabilities, and an
            intuitive user interface designed for both beginners and experts.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Shipping Details</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            We offer worldwide shipping through trusted courier partners.
            Standard delivery takes 3-5 business days, while express shipping
            ensures delivery within 1-2 business days.
          </p>
          <p>
            All orders are carefully packaged and fully insured. Track your
            shipment in real-time through our dedicated tracking portal.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Return Policy</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            We stand behind our products with a comprehensive 30-day return
            policy. If you&apos;re not completely satisfied, simply return the
            item in its original condition.
          </p>
          <p>
            Our hassle-free return process includes free return shipping and
            full refunds processed within 48 hours of receiving the returned
            item.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
`;
