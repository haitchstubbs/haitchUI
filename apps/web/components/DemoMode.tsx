"use client";

import { DemoEmpty } from "./wrappers/DemoEmpty";
import DemoPopover from "./wrappers/DemoPopover";
import { ButtonCard } from "./cards/ButtonCard";
import WaterfallGrid from "./wrappers/WaterfallGrid";
import { AccordionCard } from "./cards/AccordionCard";
import { Separator, ThemeRoot } from "@haitch/ui";
import { AlertCard } from "./cards/AlertCard";
import { AvatarCard } from "./cards/AvatarCard";
import { BreadcumbCard } from "./cards/BreadcrumbCard";
import { BadgeCard } from "./cards/BadgeCard";
import { CarouselCard } from "./cards/CarouselCard";
import { ShadowRootHost } from "./doms/shadow";
import { CheckboxCard } from "./cards/CheckboxCard";
import { useTheme } from "@haitch/ui";
import { CollapsibleCard } from "./cards/CollapsibleCard";
import { ContextMenuCard } from "./cards/ContextMenuCard";
import { KbdCard } from "./cards/KbdCard";
import { CommandDialogDemo } from "./wrappers/CommandPrompt";
import { DialogCard } from "./cards/DialogCard";
import { ItemCard } from "./cards/ItemCard";
import { FieldCard } from "./cards/FieldCard";
import { NativeSelectCard } from "./cards/NativeSelectCard";

export default function DemoMode() {
	// repeat cards to fill space
	const theme = useTheme();
	const cards = [
		<AccordionCard />,
		<ButtonCard />,
		<DemoPopover />,
		<DemoEmpty />,
		<AlertCard />,
		<AvatarCard />,
		<BreadcumbCard />,
		<BadgeCard />,
		<CarouselCard />,
		<CheckboxCard />,
		<CollapsibleCard />,
		<ContextMenuCard />,
		<KbdCard />,
		<DialogCard />,
		<ItemCard />,
		<FieldCard />,
		<NativeSelectCard />,
	];

	return (
		<div className="text-sm font-medium text-white opacity-75 w-full h-full">
			{/** Create a nice pintrest style layout to showcase components */}
			<div className="flex flex-row h-full w-full relative">
				<div className="h-screen w-60 bg-sidebar border-r border-sidebar-border grow-0 shrink-0 p-6 flex flex-col gap-4 fixed">
					<h1 className="text-center text-xl font-bold">haitchUI</h1>
					<Separator />
					<CommandDialogDemo />
					<h2 className="font-lg border-b">Component Demos</h2>
				</div>
				<div className="ml-60 p-8 pb-24 grow">
					<div className="grid grid-cols-1 gap-4">
						<h2 className="font-lg border-b">Components (usage in React)</h2>
						<WaterfallGrid>
							{cards.map((card, index) => (
								<div key={index}>{card}</div>
							))}
						</WaterfallGrid>
						<Separator />
						<ShadowRootHost inheritDocumentStyles={true}>
							<ThemeRoot theme={theme.theme || "light"}>
								<h2 className="font-lg border-b">Components (usage in Shadow DOM)</h2>
								<WaterfallGrid>
									<CheckboxCard />
									<CollapsibleCard />
								</WaterfallGrid>
							</ThemeRoot>
						</ShadowRootHost>
					</div>
				</div>
			</div>
		</div>
	);
}
