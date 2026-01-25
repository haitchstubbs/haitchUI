import React from "react";
import { render, within } from "@testing-library/react";
import { OverlayDOMProvider } from "@/primitives/overlay";
import { Root } from "../alert-dialog-root";
import { Portal } from "./alert-dialog-portal";

describe("AlertDialog Portal", () => {
	it("ports content into the provided container", () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		render(
			<OverlayDOMProvider>
				<Root>
					<Portal container={container}>
						<div data-testid="inside">Inside</div>
					</Portal>
				</Root>
			</OverlayDOMProvider>
		);

		const portal = container.querySelector('[data-slot="alert-dialog-portal"]');
		expect(portal).toBeInTheDocument();
		expect(within(portal as HTMLElement).getByTestId("inside")).toBeInTheDocument();
		container.remove();
	});
});
