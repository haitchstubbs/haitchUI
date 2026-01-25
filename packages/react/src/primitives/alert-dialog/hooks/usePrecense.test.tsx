import React from "react";
import { render, screen, act } from "@testing-library/react";
import { usePresence } from "./usePresence";

function Probe({ open }: { open: boolean }) {
	const { isMounted, styles } = usePresence(open, { open: 10, close: 50 });
	return (
		<div
			data-testid="probe"
			data-mounted={String(isMounted)}
			data-opacity={String(styles.opacity ?? "")}
			data-transition={styles.transition ?? ""}
		/>
	);
}

describe("usePresence", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("mounts immediately when open and transitions to visible", () => {
		vi.useFakeTimers();
		render(<Probe open />);

		const probe = screen.getByTestId("probe");
		expect(probe).toHaveAttribute("data-mounted", "true");
		expect(probe).toHaveAttribute("data-opacity", "0");

		act(() => {
			vi.runAllTimers();
		});

		expect(screen.getByTestId("probe")).toHaveAttribute("data-opacity", "1");
	});

	it("delays unmount on close", () => {
		vi.useFakeTimers();
		const { rerender } = render(<Probe open />);

		rerender(<Probe open={false} />);
		const probe = screen.getByTestId("probe");
		expect(probe).toHaveAttribute("data-mounted", "true");
		expect(probe.getAttribute("data-transition")).toContain("opacity 50ms");

		act(() => {
			vi.advanceTimersByTime(50);
		});

		expect(screen.getByTestId("probe")).toHaveAttribute("data-mounted", "false");
	});
});
