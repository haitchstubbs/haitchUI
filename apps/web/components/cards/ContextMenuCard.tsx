"use client";

import {
	ContextMenu,
	ContextMenuTrigger,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuShortcut,
	ContextMenuSub,
	ContextMenuSubTrigger,
	ContextMenuSubContent,
	ContextMenuSeparator,
	ContextMenuCheckboxItem,
	ContextMenuRadioGroup,
	ContextMenuRadioItem,
	ContextMenuLabel,
} from "@haitch/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@haitch/ui";

export function ContextMenuCard() {
     
	return (
		<Card className="h-fit">
			<CardHeader>
				<CardTitle>Context Menu</CardTitle>
				<CardDescription>Context menus provide a menu of actions for an element.</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4 items-center">
				<ContextMenu>
					<ContextMenuTrigger  className="flex h-37.5 w-75 items-center justify-center rounded-md border border-dashed text-sm">
						Right click here
					</ContextMenuTrigger>
					<ContextMenuContent className="w-52">
						<ContextMenuItem inset>
							Back
							<ContextMenuShortcut>⌘[</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuItem inset disabled>
							Forward
							<ContextMenuShortcut>⌘]</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuItem inset>
							Reload
							<ContextMenuShortcut>⌘R</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuSub>
							<ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
							<ContextMenuSubContent className="w-44">
								<ContextMenuItem>Save Page...</ContextMenuItem>
								<ContextMenuItem>Create Shortcut...</ContextMenuItem>
								<ContextMenuItem>Name Window...</ContextMenuItem>
								<ContextMenuSeparator />
								<ContextMenuItem>Developer Tools</ContextMenuItem>
								<ContextMenuSeparator />
								<ContextMenuItem variant="destructive">Delete</ContextMenuItem>
							</ContextMenuSubContent>
						</ContextMenuSub>
						<ContextMenuSeparator />
						<ContextMenuCheckboxItem checked>Show Bookmarks</ContextMenuCheckboxItem>
						<ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
						<ContextMenuSeparator />
						<ContextMenuRadioGroup value="pedro">
							<ContextMenuLabel inset>People</ContextMenuLabel>
							<ContextMenuRadioItem value="pedro">Pedro Duarte</ContextMenuRadioItem>
							<ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
						</ContextMenuRadioGroup>
					</ContextMenuContent>
				</ContextMenu>
			</CardContent>
		</Card>
	);
}
