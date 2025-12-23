import { NativeSelect, NativeSelectOption } from "@haitch/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@haitch/ui";

export function NativeSelectCard() {
	return (
		<Card className="h-fit">
			<CardHeader>
				<CardTitle>Badge</CardTitle>
				<CardDescription>Badges are small count and labeling components.</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4 items-center">
				<NativeSelect>
					<NativeSelectOption value="">Select status</NativeSelectOption>
					<NativeSelectOption value="todo">Todo</NativeSelectOption>
					<NativeSelectOption value="in-progress">In Progress</NativeSelectOption>
					<NativeSelectOption value="done">Done</NativeSelectOption>
					<NativeSelectOption value="cancelled">Cancelled</NativeSelectOption>
				</NativeSelect>
			</CardContent>
		</Card>
	);
}
