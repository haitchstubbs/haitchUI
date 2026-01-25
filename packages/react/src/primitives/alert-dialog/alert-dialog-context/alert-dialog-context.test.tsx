import React from "react";
import { render, screen } from "@testing-library/react";
import { OverlayDOMProvider } from "@/primitives/overlay";
import { Root } from "../alert-dialog-root";
import { useAlertDialogContext } from "./alert-dialog-context";

describe("AlertDialog context", () => {
	it("throws when used outside the root", () => {
		function Probe() {
			useAlertDialogContext("AlertDialog.Probe");
			return null;
		}

		expect(() => render(<Probe />)).toThrowError(/AlertDialog\.Root/i);
	});

	it("exposes root state and ids inside the provider", () => {
		function Probe() {
			const ctx = useAlertDialogContext("AlertDialog.Probe");
			return (
				<div
					data-testid="probe"
					data-open={String(ctx.open)}
					data-disabled={String(ctx.disabled)}
					data-title-id={ctx.titleId}
					data-description-id={ctx.descriptionId}
					data-content-id={ctx.contentId}
				/>
			);
		}

		render(
			<OverlayDOMProvider>
				<Root defaultOpen>
					<Probe />
				</Root>
			</OverlayDOMProvider>
		);

		const probe = screen.getByTestId("probe");
		expect(probe).toHaveAttribute("data-open", "true");
		expect(probe).toHaveAttribute("data-disabled", "false");
		expect(probe.getAttribute("data-title-id")).toBeTruthy();
		expect(probe.getAttribute("data-description-id")).toBeTruthy();
		expect(probe.getAttribute("data-content-id")).toBeTruthy();
	});
});
