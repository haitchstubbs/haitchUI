"use client";

import * as React from "react";
import {
	ContextMenu,
	ContextMenuCheckboxItem,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuRadioGroup,
	ContextMenuRadioItem,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "../../components/ui/context-menu";
import { Item, ItemTitle, ItemDescription, ItemActions, ItemContent, ItemMedia } from "../../components/ui/item";
import { IconDots, IconRosetteDiscountCheck } from "@tabler/icons-react";
import { cn } from "../../lib/util";

export function ContextMenuExample() {
	// menu open state
	const [open, setOpen] = React.useState(false);

	// checkbox state
	const [showBookmarks, setShowBookmarks] = React.useState(true);
	const [showFullUrls, setShowFullUrls] = React.useState(false);

	// radio group state
	const [person, setPerson] = React.useState<"pedro" | "colm">("pedro");

	return (
		<ContextMenu open={open} onOpenChange={setOpen}>
			<ContextMenuTrigger asChild>
				<Item
					variant="outline"
					size="sm"
					className={cn(
						open && "bg-accent hover:bg-accent/80 text-accent-foreground hover:text-accent-foreground/80",
						!open && "hover:bg-popover/50",
						"transition-colors select-none duration-125 ease-in-out"
					)}
				>
					<ItemMedia>
						<IconRosetteDiscountCheck className="size-5" />
					</ItemMedia>
					<ItemContent>
						<ItemTitle>Context Menu</ItemTitle>
						<ItemDescription>Right click to open the context menu.</ItemDescription>
					</ItemContent>
					<ItemActions>
						<IconDots className="size-4" />
					</ItemActions>
				</Item>
			</ContextMenuTrigger>

			<ContextMenuContent className="w-52" alignOffset={12}>
				<ContextMenuItem inset onSelect={() => console.log("Back")}>
					Back
					<ContextMenuShortcut>⌘[</ContextMenuShortcut>
				</ContextMenuItem>

				<ContextMenuItem inset disabled onSelect={() => console.log("Forward")}>
					Forward
					<ContextMenuShortcut>⌘]</ContextMenuShortcut>
				</ContextMenuItem>

				<ContextMenuItem inset onSelect={() => console.log("Reload")}>
					Reload
					<ContextMenuShortcut>⌘R</ContextMenuShortcut>
				</ContextMenuItem>

				<ContextMenuSub>
					<ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
					<ContextMenuSubContent className="w-44">
						<ContextMenuItem onSelect={() => console.log("Save Page")}>Save Page...</ContextMenuItem>
						<ContextMenuItem onSelect={() => console.log("Create Shortcut")}>Create Shortcut...</ContextMenuItem>
						<ContextMenuItem onSelect={() => console.log("Name Window")}>Name Window...</ContextMenuItem>

						<ContextMenuSeparator />

						<ContextMenuItem onSelect={() => console.log("Developer Tools")}>Developer Tools</ContextMenuItem>

						<ContextMenuSeparator />

						<ContextMenuItem variant="destructive" onSelect={() => console.log("Delete")}>
							Delete
						</ContextMenuItem>
					</ContextMenuSubContent>
				</ContextMenuSub>

				<ContextMenuSeparator />

				<ContextMenuCheckboxItem checked={showBookmarks} onCheckedChange={(next) => setShowBookmarks(!!next)}>
					Show Bookmarks
				</ContextMenuCheckboxItem>

				<ContextMenuCheckboxItem checked={showFullUrls} onCheckedChange={(next) => setShowFullUrls(!!next)}>
					Show Full URLs
				</ContextMenuCheckboxItem>

				<ContextMenuSeparator />

				<ContextMenuRadioGroup value={person} onValueChange={(v) => setPerson(v as any)}>
					<ContextMenuLabel inset>People</ContextMenuLabel>
					<ContextMenuRadioItem value="pedro">Pedro Duarte</ContextMenuRadioItem>
					<ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
				</ContextMenuRadioGroup>
			</ContextMenuContent>
		</ContextMenu>
	);
}
