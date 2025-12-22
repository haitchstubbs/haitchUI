"use client";

import { DemoEmpty } from "./wrappers/DemoEmpty";
import DemoPopover from "./wrappers/DemoPopover";
import { ButtonCard } from "./cards/ButtonCard";
import WaterfallGrid from "./wrappers/WaterfallGrid";
import { AccordionCard } from "./cards/AccordionCard";
import { Separator } from "@repo/ui/components/separator";
import { AlertCard } from "./cards/AlertCard";
import { AvatarCard } from "./cards/AvatarCard";
import { BreadcumbCard } from "./cards/BreadcrumbCard";
import { BadgeCard } from "./cards/BadgeCard";


export default function DemoMode() {
	// repeat cards to fill space

	const cards = [<ButtonCard />, <DemoPopover />, <DemoEmpty />, <AlertCard />, <AvatarCard />, <BreadcumbCard />, <BadgeCard />];

	function repeatArray<T>(array: T[], times: number): T[] {
		let result: T[] = [];
		for (let i = 0; i < times; i++) {
			result = result.concat(array);
		}
		return result;
	}

	function randomizeArray<T>(array: T[]): T[] {
		return array
			.map((item) => ({ item, sort: Math.random() }))
			.sort((a, b) => a.sort - b.sort)
			.map(({ item }) => item);
	}
	return (
		<div className="text-sm font-medium text-white shadow-lg opacity-75 w-full">
			{/** Create a nice pintrest style layout to showcase components */}
			<div className="flex flex-row h-full w-full relative">
				<div className="h-screen w-60 bg-sidebar border-r border-sidebar-border grow-0 shrink-0 p-6 flex flex-col gap-4 fixed">
					<h1 className="text-center text-xl font-bold">haitchUI</h1>
					<Separator />
					<h2 className="font-lg border-b">Component Demos</h2>
				</div>
				<div className="ml-60 p-8 pb-24 grow">
					<WaterfallGrid>
						<AccordionCard />
						{cards.map((card, index) => (
							<div key={index}>{card}</div>
						))}
					</WaterfallGrid>
				</div>
			</div>
		</div>
	);
}
