import React from "react";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "./ui/command";
import { Button } from "./ui/button";
import { IconCommand, IconSearch } from "@tabler/icons-react";
import { Kbd, KbdGroup } from "./ui/kbd";
export function AppCommandMenu() {
	const [open, setOpen] = React.useState(false);

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};
		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	return (
		<>
			<Button
				aria-label="search"
				role="search"
				variant="secondary"
				onClick={() => setOpen(true)}
				className="ml-auto mr-4 border rounded-full! p-2 flex items-center gap-5 justify-between w-fit text-muted-foreground hover:text-accent-foreground/70 hover:border-accent-foreground/20 hover:bg-accent"
			>
				<span className="flex items-center gap-2">
					<IconSearch className="size-5" />
					<span>Search Documentation...</span>
				</span>
				<Kbd className="text-base flex items-center font-mono gap-0">
					{!navigator.platform.includes("Mac") ? (
						<>
							<IconCommand className="size-5" />
							<span className="-ml-1">+K</span>
						</>
					) : "Ctrl+K"}
				</Kbd>
			</Button>
			<CommandDialog open={open} onOpenChange={setOpen} className="rounded-md">
				<CommandInput placeholder="Search Documentation..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Suggestions">
						<CommandItem>Calendar</CommandItem>
						<CommandItem>Search Emoji</CommandItem>
						<CommandItem>Calculator</CommandItem>
					</CommandGroup>
				</CommandList>
			</CommandDialog>
		</>
	);
}
