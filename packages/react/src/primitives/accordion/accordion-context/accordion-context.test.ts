import React from "react";
import { render, screen } from "@testing-library/react";
import { Root } from "../accordion-root";
import { Item } from "../accordion-item";
import { useAccordionItemCtx, useAccordionRootCtx } from "./accordion-context";

describe("Accordion context", () => {
	it("throws when the root context is missing", () => {
		function RootConsumer() {
			useAccordionRootCtx();
			return null;
		}

		expect(() => render(React.createElement(RootConsumer))).toThrowError(
			/Accordion components must be wrapped in <Root \/>/i
		);
	});

	it("throws when the item context is missing", () => {
		function ItemConsumer() {
			useAccordionItemCtx();
			return null;
		}

		expect(() =>
			render(
				React.createElement(
					Root,
					{ type: "single" },
					React.createElement(ItemConsumer, null)
				)
			)
		).toThrowError(/Accordion components must be wrapped in <Item \/>/i);
	});

	it("exposes root and item context values", () => {
		function ContextProbe() {
			const root = useAccordionRootCtx();
			const item = useAccordionItemCtx();
			return React.createElement("div", {
				"data-testid": "probe",
				"data-root-type": root.type,
				"data-collapsible": String(root.collapsible),
				"data-trigger-id": item.triggerId,
				"data-content-id": item.contentId,
			});
		}

		render(
			React.createElement(
				Root,
				{ type: "single", collapsible: true, defaultValue: "one" },
				React.createElement(
					Item,
					{ value: "one" },
					React.createElement(ContextProbe, null)
				)
			)
		);

		const probe = screen.getByTestId("probe");
		expect(probe).toHaveAttribute("data-root-type", "single");
		expect(probe).toHaveAttribute("data-collapsible", "true");
		expect(probe.getAttribute("data-trigger-id")).toContain("trigger-one");
		expect(probe.getAttribute("data-content-id")).toContain("content-one");
	});
});
