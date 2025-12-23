import { Card, CardContent, CardDescription, CardHeader, CardTitle, Label } from "@haitch/ui";
import { Checkbox } from "@haitch/ui";

export function CheckboxCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Checkbox Card</CardTitle>
				<CardDescription>This is a card component that showcases a checkbox.</CardDescription>
			</CardHeader>
			<CardContent>
				<Label className="flex items-center justify-start gap-2 w-full border border-input-foreground rounded-radius  select-none cursor-pointer p-3">
					<Checkbox name="checkbox-card" id="checkbox-card" />
					<span className="ml-2">Accept Terms and Conditions</span>
				</Label>
			</CardContent>
		</Card>
	);
}
