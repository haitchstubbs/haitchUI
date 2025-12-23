import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@haitch/ui";
import DemoButton from "../wrappers/DemoButton";
import DemoButtonGroup from "../wrappers/DemoButtonGroup";

export function ButtonCard() {
	return (
		<Card className="h-fit">
			<CardHeader>
				<CardTitle>Buttons</CardTitle>
				<CardDescription>Single Buttons & Button Groups</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-2 items-center">
				<DemoButton />
				<DemoButtonGroup />
			</CardContent>
		</Card>
	);
}
