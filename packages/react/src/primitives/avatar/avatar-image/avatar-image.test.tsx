// avatar-image.test.tsx
import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { composeRefs } from "@/utils/compose-refs";
import type { AvatarContextProps, AvatarLoadingStatus, ImageElement } from "../types";

// --- Mocks ---
const useAvatarContextMock = vi.fn();

vi.mock("../avatar-context", () => ({
	useAvatarContext: (component: string) => useAvatarContextMock(component),
}));

import { Image } from "./avatar-image"; // adjust if needed

describe("Avatar.Image primitive", () => {
	beforeEach(() => {
		useAvatarContextMock.mockReset();
	});

	it("calls useAvatarContext with 'Avatar.Image'", () => {
		const engine: AvatarContextProps = {
			loadingStatus: "idle",
			setLoadingStatus: () => {},
			getImageProps: (p) => ({ ...p, ref: () => {} }),
		};

		useAvatarContextMock.mockReturnValue(engine);

		render(<Image alt="x" data-testid="img" />);

		expect(useAvatarContextMock).toHaveBeenCalledWith("Avatar.Image");
	});

	it("forwards the ref type (HTMLImageElement) when not asChild", () => {
		const engine: AvatarContextProps = {
			loadingStatus: "idle",
			setLoadingStatus: () => {},
			getImageProps: (p) => {
				const theirRef = p.ref;

				return {
					...p,
					ref: (node) => {
						// forward to whatever ref was passed in (object or function)
						if (typeof theirRef === "function") theirRef(node);
						else if (theirRef && "current" in theirRef) (theirRef as any).current = node;
					},
				};
			},
		};

		useAvatarContextMock.mockReturnValue(engine);

		const ref = React.createRef<HTMLImageElement>();
		render(<Image ref={ref} alt="x" data-testid="img" />);

		expect(ref.current).toBeInstanceOf(HTMLImageElement);
	});

	it("passes onLoadingStatusChange through to engine.getImageProps", () => {
		const onLoadingStatusChange = vi.fn<(s: AvatarLoadingStatus) => void>();

		const getImageProps = vi.fn<AvatarContextProps["getImageProps"]>((p) => ({
			...p,
			ref: () => {},
		}));

		const engine: AvatarContextProps = {
			loadingStatus: "idle",
			setLoadingStatus: () => {},
			getImageProps,
		};

		useAvatarContextMock.mockReturnValue(engine);

		render(<Image alt="x" data-testid="img" onLoadingStatusChange={onLoadingStatusChange} />);

		expect(getImageProps).toHaveBeenCalledTimes(1);
		const callArg = getImageProps.mock.calls[0]![0];
		expect(callArg.onLoadingStatusChange).toBe(onLoadingStatusChange);
	});

	it("uses Slot when asChild is true", () => {
		const engine: AvatarContextProps = {
			loadingStatus: "idle",
			setLoadingStatus: () => {},
			getImageProps: (p) => ({
				...p,
				ref: () => {},
			}),
		};

		useAvatarContextMock.mockReturnValue(engine);

		render(
			<Image asChild data-testid="img" alt="x">
				<img />
			</Image>
		);

		const el = screen.getByTestId("img");
		expect(el.tagName.toLowerCase()).toBe("img");
	});

	it("uses the ref callback returned by engine.getImageProps (and receives the DOM node)", () => {
		// IMPORTANT: since getImageProps is generic over T extends HTMLElement,
		// the safest mock ref type is HTMLElement (or unknown), not HTMLImageElement.
		const refCallback = vi.fn<React.RefCallback<HTMLElement>>();

		const engine: AvatarContextProps = {
			loadingStatus: "idle",
			setLoadingStatus: () => {},
			getImageProps: (p) => ({
				...p,
				ref: refCallback as React.RefCallback<any>,
			}),
		};

		useAvatarContextMock.mockReturnValue(engine);

		render(<Image alt="x" data-testid="img" />);

		const el = screen.getByTestId("img");
		expect(el.tagName.toLowerCase()).toBe("img");

		// React should have invoked the ref callback with the element
		expect(refCallback).toHaveBeenCalled();
		expect(refCallback).toHaveBeenCalledWith(el);

		// extra guarantee: it is in fact an HTMLImageElement
		expect(el).toBeInstanceOf(HTMLImageElement);
	});

	it("forwards ref to the underlying <img> when not asChild", () => {
		const engine: AvatarContextProps = {
			loadingStatus: "idle",
			setLoadingStatus: () => {},
			getImageProps: (p) => {
				// behave like the real engine: compose incoming ref with internal logic
				const merged = composeRefs<ImageElement>(p.ref as React.Ref<ImageElement> | undefined, () => {});

				// IMPORTANT: do not pass onLoadingStatusChange to DOM
				const { onLoadingStatusChange, ...rest } = p as any;

				return {
					...(rest as any),
					ref: merged,
				};
			},
		};

		useAvatarContextMock.mockReturnValue(engine);

		const ref = React.createRef<HTMLImageElement>();
		render(<Image ref={ref} alt="x" data-testid="img" />);

		// Now React can assign the DOM node to the ref
		expect(ref.current).toBeInstanceOf(HTMLImageElement);
	});
});
