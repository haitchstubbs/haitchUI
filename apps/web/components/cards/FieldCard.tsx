import { Badge, BadgeCheckIcon } from "@haitch/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@haitch/ui";
import {
    Field,
    FieldGroup,
    FieldSet,
    FieldLegend,
    FieldLabel,
    FieldDescription,
    FieldSeparator
} from "@haitch/ui";
import { Input } from "@haitch/ui";
import { Textarea } from "@haitch/ui";
import { Checkbox } from "@haitch/ui";
import { Button } from "@haitch/ui";
export function FieldCard() {
	return (
		<Card className="h-fit">
			<CardHeader>
				<CardTitle>Badge</CardTitle>
				<CardDescription>Badges are small count and labeling components.</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4 items-center">
				<div className="w-full max-w-md">
					<form>
						<FieldGroup>
							<FieldSet>
								<FieldLegend>Payment Method</FieldLegend>
								<FieldDescription>All transactions are secure and encrypted</FieldDescription>
								<FieldGroup>
									<Field>
										<FieldLabel htmlFor="checkout-7j9-card-name-43j">Name on Card</FieldLabel>
										<Input id="checkout-7j9-card-name-43j" placeholder="Evil Rabbit" required />
									</Field>
									<Field>
										<FieldLabel htmlFor="checkout-7j9-card-number-uw1">Card Number</FieldLabel>
										<Input id="checkout-7j9-card-number-uw1" placeholder="1234 5678 9012 3456" required />
										<FieldDescription>Enter your 16-digit card number</FieldDescription>
									</Field>
									<div className="grid grid-cols-3 gap-4">
										<Field>
											<FieldLabel htmlFor="checkout-7j9-cvv">CVV</FieldLabel>
											<Input id="checkout-7j9-cvv" placeholder="123" required />
										</Field>
									</div>
								</FieldGroup>
							</FieldSet>
							<FieldSeparator />
							<FieldSet>
								<FieldLegend>Billing Address</FieldLegend>
								<FieldDescription>The billing address associated with your payment method</FieldDescription>
								<FieldGroup>
									<Field orientation="horizontal">
										<Checkbox id="checkout-7j9-same-as-shipping-wgm" defaultChecked />
										<FieldLabel htmlFor="checkout-7j9-same-as-shipping-wgm" className="font-normal">
											Same as shipping address
										</FieldLabel>
									</Field>
								</FieldGroup>
							</FieldSet>
							<FieldSet>
								<FieldGroup>
									<Field>
										<FieldLabel htmlFor="checkout-7j9-optional-comments">Comments</FieldLabel>
										<Textarea
											id="checkout-7j9-optional-comments"
											placeholder="Add any additional comments"
											className="resize-none"
										/>
									</Field>
								</FieldGroup>
							</FieldSet>
							<Field orientation="horizontal">
								<Button type="submit">Submit</Button>
								<Button variant="outline" type="button">
									Cancel
								</Button>
							</Field>
						</FieldGroup>
					</form>
				</div>
			</CardContent>
		</Card>
	);
}
