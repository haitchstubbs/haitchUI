'use client';
import { Kbd, KbdGroup } from "@haitch/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@haitch/ui";

export function KbdCard() {
	return (
		<Card className="h-fit">
			<CardHeader>
				<CardTitle>Badge</CardTitle>
				<CardDescription>Badges are small count and labeling components.</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4 items-center">
				<div className="flex flex-col items-center gap-4">
					<KbdGroup>
						<Kbd>⌘</Kbd>
						<Kbd>⇧</Kbd>
						<Kbd>⌥</Kbd>
						<Kbd>⌃</Kbd>
					</KbdGroup>
					<KbdGroup>
						<Kbd>Ctrl</Kbd>
						<span>+</span>
						<Kbd>B</Kbd>
					</KbdGroup>
				</div>
			</CardContent>
		</Card>
	);
}
