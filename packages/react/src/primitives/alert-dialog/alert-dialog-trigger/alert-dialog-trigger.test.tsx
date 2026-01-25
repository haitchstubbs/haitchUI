import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OverlayDOMProvider } from "@/primitives/overlay";
import { Root } from "../alert-dialog-root";
import { Trigger } from "./alert-dialog-trigger";
import { Content } from "../alert-dialog-content";
import { Title } from "../alert-dialog-title";

function renderDialog(triggerProps?: React.ComponentProps<typeof Trigger>, rootProps?: Partial<React.ComponentProps<typeof Root>>) {
	return render(
		<OverlayDOMProvider>
			<Root {...rootProps}>
				<Trigger {...triggerProps}>Open</Trigger>
				<Content data-testid="content">
					<Title>Dialog title</Title>
					<p>Body</p>
				</Content>
			</Root>
		</OverlayDOMProvider>
	);
}

describe("AlertDialog Trigger", () => {
	it("opens the dialog and wires aria attributes", async () => {
		const user = userEvent.setup();
		renderDialog();

		const trigger = screen.getByRole("button", { name: "Open" });
		expect(trigger).toHaveAttribute("aria-expanded", "false");

		await user.click(trigger);
		expect(trigger).toHaveAttribute("aria-expanded", "true");

		const content = screen.getByTestId("content");
		expect(trigger).toHaveAttribute("aria-controls", content.getAttribute("id"));

		const title = screen.getByText("Dialog title");
		expect(content).toHaveAttribute("aria-labelledby", title.getAttribute("id"));
	});

	it("does not open when disabled", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();

		renderDialog({ onClick }, { disabled: true });

		const trigger = screen.getByRole("button", { name: "Open" });
		expect(trigger).toHaveAttribute("aria-disabled", "true");

		await user.click(trigger);
		expect(onClick).not.toHaveBeenCalled();
		expect(screen.queryByTestId("content")).toBeNull();
	});

	it("supports asChild without button-only attributes", async () => {
		const user = userEvent.setup();
		render(
			<OverlayDOMProvider>
				<Root>
					<Trigger asChild data-testid="trigger-link">
						<a href="#open">Open</a>
					</Trigger>
					<Content>Body</Content>
				</Root>
			</OverlayDOMProvider>
		);

		const trigger = screen.getByTestId("trigger-link");
		expect(trigger.tagName).toBe("A");
		expect(trigger).not.toHaveAttribute("type");

		await user.click(trigger);
		expect(screen.getByText("Body")).toBeInTheDocument();
	});
});
