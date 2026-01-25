import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OverlayDOMProvider } from "@/primitives/overlay";
import { Root } from "./alert-dialog-root";
import { Trigger } from "../alert-dialog-trigger";
import { Content } from "../alert-dialog-content";
import { Title } from "../alert-dialog-title";
import { Description } from "../alert-dialog-description";
import { Cancel } from "../alert-dialog-cancel";
import { Action } from "../alert-dialog-action";

function renderDialog(rootProps?: Partial<React.ComponentProps<typeof Root>>) {
	return render(
		<OverlayDOMProvider>
			<Root {...rootProps}>
				<Trigger>Open</Trigger>
				<Content data-testid="content">
					<Title>Confirm</Title>
					<Description>Are you sure?</Description>
					<Cancel>Cancel</Cancel>
					<Action>Confirm</Action>
				</Content>
			</Root>
		</OverlayDOMProvider>
	);
}

describe("AlertDialog Root", () => {
	it("renders open state from defaultOpen", () => {
		renderDialog({ defaultOpen: true });

		const content = screen.getByTestId("content");
		expect(content).toHaveAttribute("aria-hidden", "false");
		expect(content).not.toHaveAttribute("hidden");
		expect(document.querySelector('[data-slot="alert-dialog"]')).toBeInTheDocument();
	});

	it("locks scroll while open and restores focus on close", async () => {
		const user = userEvent.setup();
		renderDialog();

		const trigger = screen.getByRole("button", { name: "Open" });
		const originalOverflow = document.body.style.overflow;

		await user.click(trigger);
		expect(document.body.style.overflow).toBe("hidden");

		await user.click(screen.getByRole("button", { name: "Confirm" }));

		await waitFor(() => expect(document.body.style.overflow).toBe(originalOverflow));
		await waitFor(() => expect(trigger).toHaveFocus());
	});

	it("closes on Escape when enabled", async () => {
		const user = userEvent.setup();
		renderDialog();

		await user.click(screen.getByRole("button", { name: "Open" }));
		const content = screen.getByTestId("content");

		fireEvent.keyDown(document, { key: "Escape" });
		await waitFor(() => expect(content).toHaveAttribute("hidden"));
	});

	it("does not close on Escape when disabled", async () => {
		renderDialog({ defaultOpen: true, disabled: true });

		const content = screen.getByTestId("content");
		fireEvent.keyDown(document, { key: "Escape" });

		expect(content).toHaveAttribute("aria-hidden", "false");
	});
});
