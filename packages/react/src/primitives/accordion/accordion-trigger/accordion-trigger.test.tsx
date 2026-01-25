import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Root } from "../accordion-root";
import { Item } from "../accordion-item";
import { Header } from "../accordion-header";
import { Trigger } from "./accordion-trigger";
import { Content } from "../accordion-content";

describe("Accordion Trigger", () => {
	it("toggles open state and wires aria attributes", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();

		render(
			<Root type="single" collapsible>
				<Item value="one">
					<Header>
						<Trigger onClick={onClick}>One</Trigger>
					</Header>
					<Content>One content</Content>
				</Item>
			</Root>
		);

		const trigger = screen.getByRole("button", { name: "One" });
		expect(trigger).toHaveAttribute("aria-expanded", "false");

		await user.click(trigger);
		expect(onClick).toHaveBeenCalledTimes(1);
		expect(trigger).toHaveAttribute("aria-expanded", "true");
		expect(screen.getByText("One content")).toBeInTheDocument();

		const content = screen.getByRole("region");
		expect(content).toHaveAttribute("aria-labelledby", trigger.getAttribute("id"));
		expect(trigger).toHaveAttribute("aria-controls", content.getAttribute("id"));
	});

	it("does not toggle when the item is disabled", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();

		render(
			<Root type="single">
				<Item value="one" disabled>
					<Header>
						<Trigger onClick={onClick}>One</Trigger>
					</Header>
					<Content>One content</Content>
				</Item>
			</Root>
		);

		const trigger = screen.getByRole("button", { name: "One" });
		expect(trigger).toBeDisabled();

		await user.click(trigger);
		expect(onClick).not.toHaveBeenCalled();
		expect(screen.queryByText("One content")).toBeNull();
	});

	it("supports asChild without adding button-only attributes", async () => {
		const user = userEvent.setup();

		render(
			<Root type="single">
				<Item value="one">
					<Header>
						<Trigger asChild data-testid="trigger-link">
							<a href="#">One</a>
						</Trigger>
					</Header>
					<Content>One content</Content>
				</Item>
			</Root>
		);

		const trigger = screen.getByTestId("trigger-link");
		expect(trigger.tagName).toBe("A");
		expect(trigger).not.toHaveAttribute("type");
		expect(trigger).not.toHaveAttribute("disabled");

		await user.click(trigger);
		expect(screen.getByText("One content")).toBeInTheDocument();
	});
});
