import * as React from "react";
import { describe, beforeEach, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { Checkbox, ShadowRootHost } from "@haitch/ui";

import {
	runCheckboxDomContract,
	runCheckboxInteractionParityContract,
	runCheckboxControlledContract,
	runCheckboxFormContract,
	runCheckboxLabelContract,
	runCheckboxControlledClickContract,
	runCheckboxA11yTreeContract,
} from "../contracts/checkbox";

function getParts() {
	const input = screen.getByRole("checkbox", { name: /accept terms/i }) as HTMLInputElement;
	const visual = document.querySelector('[data-slot="checkbox"]') as HTMLButtonElement | null;
	const root = document.querySelector('[data-slot="checkbox-root"]') as HTMLElement | null;

	expect(input).toBeTruthy();
	expect(root).toBeTruthy();
	expect(visual).toBeTruthy();

	return { input, visual: visual!, root: root! };
}

const renderCheckbox = (props?: any) => <Checkbox {...props} />;

describe("Checkbox", () => {
	beforeEach(() => (document.body.innerHTML = ""));

	runCheckboxDomContract("Checkbox", renderCheckbox, getParts);
	runCheckboxInteractionParityContract("Checkbox", renderCheckbox, getParts);
	runCheckboxControlledContract("Checkbox", renderCheckbox, getParts);
	runCheckboxControlledClickContract("Checkbox", renderCheckbox, getParts);
	runCheckboxFormContract("Checkbox", renderCheckbox);
	runCheckboxLabelContract("Checkbox", renderCheckbox, getParts);
	runCheckboxA11yTreeContract("Checkbox", renderCheckbox, getParts);

	// Keep Shadow DOM tests separate and minimal (still valuable)
	describe("Shadow DOM compatibility", () => {
		it("works inside a shadow root: wrapping label toggles and visual updates", async () => {
			const user = (await import("@testing-library/user-event")).default.setup();

			render(
				<ShadowRootHost cssText={""}>
					<label className="flex items-center gap-2">
						<Checkbox aria-label="Accept Terms" />
						<span>Accept Terms</span>
					</label>
				</ShadowRootHost>
			);

			const host = document.body.firstElementChild as HTMLElement;
			const shadow = (host as any).shadowRoot as ShadowRoot;

			const input = shadow.querySelector('input[type="checkbox"]') as HTMLInputElement;
			const visual = shadow.querySelector('[data-slot="checkbox"]') as HTMLButtonElement;
			const labelText = shadow.querySelector("span") as HTMLSpanElement;

			expect(input).not.toBeChecked();
			expect(visual).toHaveAttribute("data-state", "unchecked");

			await user.click(labelText);
			expect(input).toBeChecked();
			expect(visual).toHaveAttribute("data-state", "checked");
		});
	});
});
