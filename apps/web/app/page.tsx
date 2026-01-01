"use client";

import { Item, ItemTitle, ItemDescription, ItemActions, ItemContent, ItemMedia } from "../components/ui/item";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuGroup,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
	DropdownMenuPortal,
	DropdownMenuShortcut,
} from "../components/ui/dropdown-menu";
import { Tooltip, TooltipArrow, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import { Button } from "../components/ui/button";
import { IconBadge, IconChevronRight, IconInfoCircleFilled, IconRosetteDiscountCheck } from "@tabler/icons-react";

export default function Home() {
	return (
		<main className="bg-background flex w-full items-center justify-center p-8 gap-6 min-h-screen overflow-y-auto flex-col">
			<section className="bg-background flex w-full items-center justify-center p-8 gap-6 min-h-[200vh] overflow-y-auto flex-col">
				{/* <DemoMode /> */}
				<Item variant="outline">
					<ItemContent>
						<ItemTitle>Basic Tooltip</ItemTitle>
						<ItemDescription>A simple tooltip that can be attached to anything</ItemDescription>
					</ItemContent>
					<ItemActions>
						<Tooltip side="bottom" align="start">
							<TooltipTrigger asChild>
								<Button variant="outline" size="icon">
									<IconInfoCircleFilled className="size-icon" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p className="font-extrabold">This is a basic tooltip example. It works with any element!</p>
								<p className="font-normal">
									You can put <strong>bold</strong>, <em>italic</em>, and other <u>styles</u> here.
								</p>
								<TooltipArrow />
							</TooltipContent>
						</Tooltip>
					</ItemActions>
				</Item>

				<Item variant="outline">
					<ItemContent>
						<ItemTitle>Basic Dropdown Menu</ItemTitle>
						<ItemDescription>A simple tooltip that can be attached to anything</ItemDescription>
					</ItemContent>
					<ItemActions>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline">Open</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56">
								<DropdownMenuLabel>My Account</DropdownMenuLabel>
								<DropdownMenuGroup>
									<DropdownMenuItem>
										Profile
										<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem>
										Billing
										<DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem>
										Settings
										<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem>
										Keyboard shortcuts
										<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
									</DropdownMenuItem>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
								<DropdownMenuGroup>
									<DropdownMenuItem>Team</DropdownMenuItem>
									<DropdownMenuSub>
										<DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
										<DropdownMenuPortal>
											<DropdownMenuSubContent>
												<DropdownMenuItem>Email</DropdownMenuItem>
												<DropdownMenuItem>Message</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem>More...</DropdownMenuItem>
											</DropdownMenuSubContent>
										</DropdownMenuPortal>
									</DropdownMenuSub>
									<DropdownMenuItem>
										New Team
										<DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
									</DropdownMenuItem>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
								<DropdownMenuItem>GitHub</DropdownMenuItem>
								<DropdownMenuItem>Support</DropdownMenuItem>
								<DropdownMenuItem disabled>API</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									Log out
									<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</ItemActions>
				</Item>

				<Item variant="outline" size="sm" asChild>
					<a href="#">
						<ItemMedia>
							<IconRosetteDiscountCheck className="size-5" />
						</ItemMedia>
						<ItemContent>
							<ItemTitle>Your profile has been verified.</ItemTitle>
						</ItemContent>
						<ItemActions>
							<IconChevronRight className="size-4" />
						</ItemActions>
					</a>
				</Item>
			</section>
		</main>
	);
}
