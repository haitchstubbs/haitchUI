import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { IconSquareRoundedCheckFilled, IconAlertSquareRoundedFilled, IconGhost2Filled } from "@tabler/icons-react";
export function AlertCard() {
	return (
		<Card className="h-fit">
			<CardHeader>
				<CardTitle>Alerts</CardTitle>
				<CardDescription>Alert component with variants</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="grid w-full max-w-xl items-start gap-4">
					<Alert>
						<IconAlertSquareRoundedFilled />
						<AlertTitle>Success! Your changes have been saved</AlertTitle>
						<AlertDescription>This is an alert with icon, title and description.</AlertDescription>
					</Alert>
					<Alert>
						<IconGhost2Filled />
						<AlertTitle>This Alert has a title and an icon. No description.</AlertTitle>
					</Alert>
					<Alert variant="destructive">
						<IconSquareRoundedCheckFilled />
						<AlertTitle>Unable to process your payment.</AlertTitle>
						<AlertDescription>
							<p>Please verify your billing information and try again.</p>
							<ul className="list-inside list-disc text-sm">
								<li>Check your card details</li>
								<li>Ensure sufficient funds</li>
								<li>Verify billing address</li>
							</ul>
						</AlertDescription>
					</Alert>
				</div>
			</CardContent>
		</Card>
	);
}
