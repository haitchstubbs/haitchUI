import { Badge, BadgeCheckIcon } from "@repo/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";

export function BadgeCard() {
	return (
		<Card className="h-fit">
			<CardHeader>
				<CardTitle>Badge</CardTitle>
				<CardDescription>Badges are small count and labeling components.</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4 items-center">
				<div className="flex w-full flex-wrap gap-2">
					<Badge>Badge</Badge>
					<Badge variant="secondary">Secondary</Badge>
					<Badge variant="destructive">Destructive</Badge>
					<Badge variant="outline">Outline</Badge>
				</div>
				<div className="flex w-full flex-wrap gap-2">
					<Badge variant="secondary" className="bg-blue-500 text-white dark:bg-blue-600">
						<BadgeCheckIcon />
						Verified
					</Badge>
					<Badge className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums">8</Badge>
					<Badge className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums" variant="destructive">
						99
					</Badge>
					<Badge className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums" variant="outline">
						20+
					</Badge>
				</div>
			</CardContent>
		</Card>
	);
}
