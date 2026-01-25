import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OverlayDOMProvider } from "@/primitives/overlay";
import { Root } from "../alert-dialog-root";
import { Content } from "./alert-dialog-content";
import { Title } from "../alert-dialog-title";

describe("AlertDialog Content", () => {
	it("keeps content mounted when forceMount is true", () => {
		render(
			<OverlayDOMProvider>
				<Root>
					<Content forceMount data-testid="content">
						<Title>Title</Title>
					</Content>
				</Root>
			</OverlayDOMProvider>
		);

		const content = screen.getByTestId("content");
		expect(content).toHaveAttribute("hidden");
		expect(content).toHaveAttribute("aria-hidden", "true");
	});

	it("closes on Escape when focused inside the content", async () => {
		const user = userEvent.setup();
		render(
			<OverlayDOMProvider>
				<Root defaultOpen>
					<Content data-testid="content">
						<Title>Title</Title>
						<button type="button">Confirm</button>
					</Content>
				</Root>
			</OverlayDOMProvider>
		);

		const content = screen.getByTestId("content");
		await user.click(screen.getByRole("button", { name: "Confirm" }));

		fireEvent.keyDown(content, { key: "Escape" });
		expect(content).toHaveAttribute("hidden");
	});

	it("traps focus on Tab and Shift+Tab", () => {
		render(
			<OverlayDOMProvider>
				<Root defaultOpen>
					<Content data-testid="content">
						<Title>Title</Title>
						<button type="button" data-testid="first">
							First
						</button>
						<button type="button" data-testid="last">
							Last
						</button>
					</Content>
				</Root>
			</OverlayDOMProvider>
		);

		const content = screen.getByTestId("content");
		const first = screen.getByTestId("first");
		const last = screen.getByTestId("last");

		last.focus();
		expect(last).toHaveFocus();

		fireEvent.keyDown(content, { key: "Tab" });
		expect(first).toHaveFocus();

		fireEvent.keyDown(content, { key: "Tab", shiftKey: true });
		expect(last).toHaveFocus();
	});
});
