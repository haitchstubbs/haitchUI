import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OverlayDOMProvider } from "@/primitives/overlay";
import { Root } from "../alert-dialog-root";
import { Trigger } from "../alert-dialog-trigger";
import { Content } from "../alert-dialog-content";

describe("AlertDialog Overlay", () => {
	it("renders only when the dialog is mounted", async () => {
		const user = userEvent.setup();
		render(
			<OverlayDOMProvider>
				<Root>
					<Trigger>Open</Trigger>
					<Content>Body</Content>
				</Root>
			</OverlayDOMProvider>
		);

		expect(document.querySelector('[data-slot="alert-dialog-overlay"]')).toBeNull();

		await user.click(screen.getByRole("button", { name: "Open" }));

		await waitFor(() => {
			const overlay = document.querySelector('[data-slot="alert-dialog-overlay"]');
			expect(overlay).toBeInTheDocument();
			expect(overlay).toHaveAttribute("data-state", "open");
		});
	});
});
