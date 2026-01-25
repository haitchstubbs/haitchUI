// avatarContext.test.ts
import * as React from "react";
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";

import { AvatarContext, useAvatarContext } from "./avatar-context"; // <-- adjust path
import type { AvatarContextProps, AvatarLoadingStatus } from "../types";

describe("AvatarContext / useAvatarContext", () => {
	it("returns the context value when used within AvatarContext.Provider", () => {
		const setLoadingStatus = (_next: AvatarLoadingStatus) => {};

		const value: AvatarContextProps = {
			loadingStatus: "idle",
			setLoadingStatus,
			getImageProps: (props) => ({
				...props,
				ref: () => {},
			}),
		};

		const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
			<AvatarContext.Provider value={value}>{children}</AvatarContext.Provider>
		);

		const { result } = renderHook(() => useAvatarContext("Avatar.Image"), {
			wrapper,
		});

		expect(result.current.loadingStatus).toBe("idle");
		expect(result.current.setLoadingStatus).toBe(setLoadingStatus);
		expect(typeof result.current.getImageProps).toBe("function");
	});

	it("throws the custom error message when used outside the provider", () => {
		expect(() => renderHook(() => useAvatarContext("Avatar.Image"))).toThrowError("Avatar.Image must be used within Avatar.Root");
	});

	it("getImageProps returns a ref callback and preserves img props", () => {
		const setLoadingStatus = (_next: AvatarLoadingStatus) => {};

		const value: AvatarContextProps = {
			loadingStatus: "idle",
			setLoadingStatus,
			getImageProps: (props) => ({
				...props,
				ref: () => {},
			}),
		};

		const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
			<AvatarContext.Provider value={value}>{children}</AvatarContext.Provider>
		);

		const { result } = renderHook(() => useAvatarContext("Avatar.Image"), {
			wrapper,
		});

		const out = result.current.getImageProps({
			alt: "x",
			src: "/avatar.png",
			onLoad: () => {},
			onLoadingStatusChange: () => {},
		});

		expect(out.alt).toBe("x");
		expect(out.src).toBe("/avatar.png");
		expect(typeof out.ref).toBe("function");
	});

	it("is strongly typed (compile-time assertions)", () => {
		const value: AvatarContextProps = {
			loadingStatus: "loaded",
			setLoadingStatus: (_next) => {},
			getImageProps: (props) => ({
				...props,
				ref: () => {},
			}),
		};

		const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
			<AvatarContext.Provider value={value}>{children}</AvatarContext.Provider>
		);

		const { result } = renderHook(() => useAvatarContext("Avatar.Test"), {
			wrapper,
		});

		// runtime sanity
		expect(result.current.loadingStatus).toBe("loaded");

		// compile-time: correct types
		const s: AvatarLoadingStatus = result.current.loadingStatus;
		expect(s).toBe("loaded");

		const set: (next: AvatarLoadingStatus) => void = result.current.setLoadingStatus;
		expect(typeof set).toBe("function");

		// compile-time: getImageProps output contains a ref callback
		const img = result.current.getImageProps({ alt: "a" });
		const refCb: React.RefCallback<HTMLImageElement> = img.ref;
		expect(typeof refCb).toBe("function");

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		// @ts-expect-error — property does not exist on AvatarContextProps
		const nope = result.current.nonExistent;

		// @ts-expect-error — invalid loading status
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const badStatus: AvatarLoadingStatus = "pending";
	});

	it("rejects invalid Provider values at compile time", () => {
		const badValue1: AvatarContextProps = {
			// @ts-expect-error — loadingStatus must be AvatarLoadingStatus

			loadingStatus: "pending",
			setLoadingStatus: () => {},
			getImageProps: (props) => ({ ...props, ref: () => {} }),
		};

		const badValue2: AvatarContextProps = {
			loadingStatus: "idle",
			// @ts-expect-error — setLoadingStatus must accept AvatarLoadingStatus

			setLoadingStatus: (n: number) => {},
			getImageProps: (props) => ({ ...props, ref: () => {} }),
		};

		const badValue3: AvatarContextProps = {
			loadingStatus: "idle",
			setLoadingStatus: () => {},
			// @ts-expect-error — getImageProps must return a ref callback
			getImageProps: (props) => ({ ...props, ref: "nope" }),
		};

		expect(badValue1).toBeDefined();
		expect(badValue2).toBeDefined();
		expect(badValue3).toBeDefined();
	});
});
