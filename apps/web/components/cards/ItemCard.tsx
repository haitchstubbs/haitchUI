import { IconRosetteDiscountCheckFilled, IconChevronRight } from "@tabler/icons-react";
import { Item,
    ItemContent,
    ItemTitle,
    ItemDescription,
    ItemActions,
    ItemMedia,
    Button
 } from "@haitch/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@haitch/ui";

export function ItemCard() {
	return (
		<Card className="h-fit">
			<CardHeader>
				<CardTitle>Badge</CardTitle>
				<CardDescription>Badges are small count and labeling components.</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4 items-center">
				<div className="flex w-full max-w-md flex-col gap-6">
					<Item variant="outline">
						<ItemContent>
							<ItemTitle>Basic Item</ItemTitle>
							<ItemDescription>A simple item with title and description.</ItemDescription>
						</ItemContent>
						<ItemActions>
							<Button variant="outline" size="sm">
								Action
							</Button>
						</ItemActions>
					</Item>
					<Item variant="outline" size="sm" asChild>
						<a href="#">
							<ItemMedia>
								<IconRosetteDiscountCheckFilled className="size-5" />
							</ItemMedia>
							<ItemContent>
								<ItemTitle>Your profile has been verified.</ItemTitle>
							</ItemContent>
							<ItemActions>
								<IconChevronRight className="size-4" />
							</ItemActions>
						</a>
					</Item>
				</div>
			</CardContent>
		</Card>
	);
}
