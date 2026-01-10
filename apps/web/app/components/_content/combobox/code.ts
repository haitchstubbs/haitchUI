const primary = `"use client";

import * as React from "react";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxGroup,
	ComboboxInput,
	ComboboxItem,
	ComboboxLabel,
	ComboboxSeparator,
} from "@/components/ui/combobox";

const OPTIONS = [
	{ value: "brisbane", label: "Brisbane" },
	{ value: "sydney", label: "Sydney" },
	{ value: "melbourne", label: "Melbourne" },
	{ value: "perth", label: "Perth", disabled: true },
];

export function ComboboxDemo() {
	const [value, setValue] = React.useState<string>("brisbane");
	const [input, setInput] = React.useState<string>("Brisbane");

	const filtered = OPTIONS.filter((o) => o.label.toLowerCase().includes(input.toLowerCase()));

	return (
		<Combobox
			value={value}
			onValueChange={setValue}
			inputValue={input}
			onInputValueChange={setInput}
		>
			<ComboboxInput placeholder="Search city..." withChrome clearable />

			<ComboboxContent>
				<ComboboxGroup>
					<ComboboxLabel>Cities</ComboboxLabel>
					<ComboboxSeparator />

					{filtered.length === 0 ? (
						<ComboboxEmpty />
					) : (
						filtered.map((o) => (
							<ComboboxItem key={o.value} value={o.value} disabled={o.disabled}>
								{o.label}
							</ComboboxItem>
						))
					)}
				</ComboboxGroup>
			</ComboboxContent>
		</Combobox>
	);
}`;

export {primary};
const code = {primary} as const satisfies Record<string, string>;
export default code;
