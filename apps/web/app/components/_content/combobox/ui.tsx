// apps/web/app/components/_content/combobox/ui.tsx
"use client";

import * as React from "react";

import {
	Combobox,
	ComboboxChip,
	ComboboxChipRemove,
	ComboboxChips,
	ComboboxClear,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxItemIndicator,
	ComboboxList,
	ComboboxPopup,
	ComboboxPortal,
	ComboboxPositioner,
	ComboboxTrigger,
	ComboboxValue,
} from "../../../../components/ui/combobox";
import { Label } from "../../../../components/ui/label";
import { cn } from "../../../../lib/util";

const FRUITS = [
	"Apple",
	"Banana",
	"Orange",
	"Pineapple",
	"Grape",
	"Mango",
	"Strawberry",
	"Blueberry",
	"Raspberry",
	"Blackberry",
	"Cherry",
	"Peach",
	"Pear",
	"Plum",
	"Kiwi",
	"Watermelon",
	"Cantaloupe",
	"Honeydew",
	"Papaya",
	"Guava",
	"Lychee",
	"Pomegranate",
	"Apricot",
	"Grapefruit",
	"Passionfruit",
] as const;

const LANGUAGES = [
	{ id: "js", value: "JavaScript" },
	{ id: "ts", value: "TypeScript" },
	{ id: "py", value: "Python" },
	{ id: "java", value: "Java" },
	{ id: "cpp", value: "C++" },
	{ id: "cs", value: "C#" },
	{ id: "php", value: "PHP" },
	{ id: "ruby", value: "Ruby" },
	{ id: "go", value: "Go" },
	{ id: "rust", value: "Rust" },
	{ id: "swift", value: "Swift" },
] as const;

interface ProgrammingLanguage {
	id: string;
	value: string;
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg fill="currentColor" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" {...props}>
			<path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
		</svg>
	);
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={16}
			height={16}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...props}
		>
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>
	);
}

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...props}
		>
			<path d="M6 9l6 6 6-6" />
		</svg>
	);
}

export function Primary() {
	const containerRef = React.useRef<HTMLDivElement | null>(null);
	const id = React.useId();
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState<string | null>(null);
	const [inputValue, setInputValue] = React.useState("");

	const query = inputValue.trim().toLowerCase();
	const results = React.useMemo(() => {
		if (!query) return [...LANGUAGES];
		return LANGUAGES.filter((lang) => {
			return lang.value.toLowerCase().includes(query) || lang.id.toLowerCase().includes(query);
		});
	}, [query]);
	return (
		<Combobox
			multiple
			modal={false}
			open={open}
			onOpenChange={setOpen}
			value={value}
			onValueChange={(next) => setValue((next as string | null) ?? null)}
			inputValue={inputValue}
			onInputValueChange={setInputValue}
		>
			<div className="w-full max-w-xs flex flex-col gap-3 relative">
				<Label htmlFor={id}>Programming languages</Label>
				<ComboboxChips
					ref={containerRef}
					className={cn(
						// container
						"flex flex-wrap items-center gap-1.5",

						// subtle entrance when the chips area first appears / updates
						"data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-150"
					)}
				>
					{(chips) => (
						<>
							{chips.map((chip) => (
								<ComboboxChip
									key={chip.id}
									value={chip.value}
									aria-label={String(chip.value)}
									className={cn(
										// layout
										"group inline-flex items-center gap-1.5 rounded-md px-2 py-1",
										"h-7 max-w-full",

										// surface
										"bg-muted text-foreground",

										// type
										"text-sm leading-none",

										// interaction
										"cursor-default select-none outline-none",
										"transition-colors duration-100",

										// focus ring (works well even if chip itself isn't focusable, since remove is)
										"focus-within:bg-accent focus-within:text-accent-foreground",
										"focus-within:ring-2 focus-within:ring-ring/30 focus-within:ring-offset-2 focus-within:ring-offset-background",

										// motion (tw-animate-css) — feels like a tag popping in
										"animate-in fade-in-0 zoom-in-95 duration-150"
									)}
								>
									<span className="truncate">{String(chip.value)}</span>

									<ComboboxChipRemove
										aria-label="Remove"
										className={cn(
											"inline-flex items-center justify-center rounded-sm p-1",
											"text-inherit",

											// better hit target without bloating layout
											"-mr-1",

											// interaction
											"transition-colors duration-100",
											"hover:bg-foreground/10",
											"active:bg-foreground/15",

											// keyboard
											"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",

											// micro motion
											"data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-150",
											"active:scale-95"
										)}
									>
										<XIcon className="size-3.5" />
									</ComboboxChipRemove>
								</ComboboxChip>
							))}

							<ComboboxInput
								id={id}
								placeholder={chips.length > 0 ? "" : "e.g. TypeScript"}
								onFocus={() => setOpen(true)}
								className={cn(
									// sizing / layout
									"min-w-12 flex-1 h-8",

									// surface
									"rounded-md border-0 bg-transparent",

									// type
									"pl-2 text-base text-foreground placeholder:text-muted-foreground",

									// interaction
									"outline-none",

									// subtle entrance when it becomes the primary thing (empty chips)
									"animate-in fade-in-0 duration-150"
								)}
							/>
						</>
					)}
				</ComboboxChips>
			</div>
			<ComboboxContent
				anchor={containerRef}
				className={cn(
					// surface
					"p-1 rounded-md border bg-popover text-popover-foreground shadow-md",

					// motion (tw-animate-css)
					"origin-(--radix-popper-transform-origin)",
					"data-[state=open]:animate-in data-[state=closed]:animate-out",
					"data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
					"data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
					"data-[state=open]:duration-150 data-[state=closed]:duration-100",
					"data-[state=closed]:ease-in data-[state=open]:ease-out",

					// optional: slight directional slide (only if your content supports it)
					"data-[side=bottom]:slide-in-from-top-1",
					"data-[side=top]:slide-in-from-bottom-1",
					"data-[side=left]:slide-in-from-right-1",
					"data-[side=right]:slide-in-from-left-1"
				)}
			>
				<ComboboxEmpty className="py-6 text-sm text-muted-foreground">No languages found.</ComboboxEmpty>

				<ComboboxList
					className={cn(
						"outline-0 overflow-y-auto overscroll-contain scroll-py-2 py-2",
						"max-h-[min(var(--available-height,23rem),23rem)] data-empty:p-0",

						// animate list contents slightly after popover opens
						"data-[state=open]:animate-in data-[state=open]:fade-in-0",
						"data-[state=open]:slide-in-from-top-1 data-[state=open]:duration-150"
					)}
				>
					{results.map((l) => (
						<ComboboxItem
							key={l.id}
							value={l.value}
							textValue={l.value}
							className={cn(
								"group relative flex items-center gap-2 rounded-sm px-2 py-2",
								"text-sm leading-none",
								"cursor-default select-none outline-none",

								// smooth row state transitions
								"transition-colors duration-100",

								// highlighted
								"data-highlighted:bg-accent data-highlighted:text-accent-foreground",

								// selected
								"data-selected:font-medium",

								// disabled
								"data-disabled:pointer-events-none data-disabled:opacity-50"
							)}
						>
							<span>
								<ComboboxItemIndicator
									className={cn(
										"flex size-4 items-center justify-center",
										// nicer checkmark entrance
										"opacity-0 scale-75 transition-[opacity,transform] duration-120 ease-out",
										"group-data-selected:opacity-100 group-data-selected:scale-100"
									)}
								>
									<CheckIcon className="size-3" />
								</ComboboxItemIndicator>
							</span>

							<span className="truncate">{l.value}</span>
						</ComboboxItem>
					))}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
}

export function Example1() {
	const anchorRef = React.useRef<HTMLDivElement | null>(null);
	const id = React.useId();

	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState<string[]>([]);
	const [inputValue, setInputValue] = React.useState("");

	const query = inputValue.trim().toLowerCase();
	const results = React.useMemo(() => {
		if (!query) return LANGUAGES;
		return LANGUAGES.filter((l) => l.value.toLowerCase().includes(query));
	}, [query]);

	return (
		<Combobox
			modal={false}
			multiple
			open={open}
			onOpenChange={setOpen}
			value={value}
			onValueChange={(next) => setValue((Array.isArray(next) ? (next as string[]) : []) ?? [])}
			inputValue={inputValue}
			onInputValueChange={setInputValue}
		>
			<div className="max-w-md flex flex-col gap-1">
				<label className="text-sm leading-5 font-medium text-foreground" htmlFor={id}>
					Programming languages
				</label>

				<ComboboxChips
					ref={anchorRef}
					className="flex flex-wrap items-center gap-0.5 rounded-md border border-input px-1.5 py-1 w-64 bg-background focus-within:outline focus-within:-outline-offset-1 focus-within:outline-ring min-[500px]:w-88"
				>
					{(chips) => (
						<>
							{chips.map((chip) => (
								<ComboboxChip
									key={chip.id}
									value={chip.value}
									className="flex items-center gap-1 rounded-md bg-muted px-1.5 py-[0.2rem] text-sm text-foreground outline-none cursor-default focus-within:bg-accent focus-within:text-accent-foreground"
									aria-label={String(chip.value)}
								>
									{String(chip.value)}
									<ComboboxChipRemove className="rounded-md p-1 text-inherit hover:bg-muted-foreground/15" aria-label="Remove">
										<XIcon />
									</ComboboxChipRemove>
								</ComboboxChip>
							))}

							<ComboboxInput
								id={id}
								placeholder={chips.length > 0 ? "" : "e.g. TypeScript"}
								className="min-w-12 flex-1 h-8 rounded-md border-0 bg-transparent pl-2 text-base text-foreground outline-none placeholder:text-muted-foreground"
								onFocus={() => setOpen(true)}
							/>
						</>
					)}
				</ComboboxChips>
				<ComboboxClear
					className="combobox-clear flex h-10 w-6 items-center justify-center rounded bg-transparent p-0"
					aria-label="Clear selection"
				>
					<XIcon className="size-4" />
				</ComboboxClear>
			</div>

			<ComboboxPortal>
				<ComboboxPositioner anchor={anchorRef} sideOffset={4} className="z-50 outline-none">
					<ComboboxPopup className="w-(--anchor-width) max-h-[min(var(--available-height,23rem),23rem)] max-w-(--available-width,24rem) overflow-y-auto overscroll-contain rounded-md bg-popover py-2 text-popover-foreground shadow-md border border-border">
						<ComboboxEmpty className="px-4 py-2 text-[0.925rem] leading-4 text-muted-foreground empty:m-0 empty:p-0">
							No languages found.
						</ComboboxEmpty>

						<ComboboxList className="outline-0 overflow-y-auto scroll-py-2 py-2 overscroll-contain max-h-[min(var(--available-height,23rem),23rem)] data-empty:p-0">
							{results.map((l) => (
								<ComboboxItem
									key={l.id}
									value={l.value}
									textValue={l.value}
									className="group grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-8 pl-4 text-base leading-4 outline-none select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-accent-foreground data-highlighted:before:absolute data-highlighted:before:inset-x-2 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-accent"
								>
									<ComboboxItemIndicator className="col-start-1 opacity-0 group-data-selected:opacity-100">
										<CheckIcon className="size-3" />
									</ComboboxItemIndicator>
									<div className="col-start-2">{l.value}</div>
								</ComboboxItem>
							))}
						</ComboboxList>
					</ComboboxPopup>
				</ComboboxPositioner>
			</ComboboxPortal>
		</Combobox>
	);
}

export function Example2() {
	return <Primary />;
}

export function Example3() {
	return <Example1 />;
}
