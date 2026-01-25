// createContextCreator.test.ts
import * as React from "react";
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";

// Adjust this import to wherever you put the factory:
import { createTypedContext } from "./createTypedContext";

describe("createContextCreator", () => {
	it("returns the provided context value when used within a Provider", () => {
		type Ctx = { count: number; label: string };

		const { Context, useContext } = createTypedContext<Ctx, "Counter">({
			name: "Counter",
		});

		const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
			<Context.Provider value={{ count: 42, label: "hello" }}>{children}</Context.Provider>
		);

		const { result } = renderHook(() => useContext("Counter.Test"), { wrapper });

		expect(result.current.count).toBe(42);
		expect(result.current.label).toBe("hello");
	});

	it("throws a default error message when used outside a Provider", () => {
		type Ctx = { ok: true };

		const { useContext } = createTypedContext<Ctx, "Avatar">({
			name: "Avatar",
		});

		expect(() => renderHook(() => useContext("Avatar.Image"))).toThrowError("Avatar.Image must be used within Avatar.Root");
	});

	it("throws a custom string error message if provided", () => {
		type Ctx = { ok: true };

		const { useContext } = createTypedContext<Ctx, "Avatar">({
			name: "Avatar",
			errorMessage: "Custom error!",
		});

		expect(() => renderHook(() => useContext("Avatar.Image"))).toThrowError("Custom error!");
	});

	it("throws a custom function error message if provided", () => {
		type Ctx = { ok: true };

		const { useContext } = createTypedContext<Ctx, "Avatar">({
			name: "Avatar",
			errorMessage: (component, name) => `${component} missing ${name} provider`,
		});

		expect(() => renderHook(() => useContext("Avatar.Image"))).toThrowError("Avatar.Image missing Avatar provider");
	});

	it("sets Context.displayName (default and custom)", () => {
		type Ctx = { ok: true };

		const a = createTypedContext<Ctx, "Avatar">({ name: "Avatar" });
		expect(a.Context.displayName).toBe("AvatarContext");

		const b = createTypedContext<Ctx, "Avatar">({
			name: "Avatar",
			displayName: "AvatarCtx",
		});
		expect(b.Context.displayName).toBe("AvatarCtx");
	});

	it("is strongly typed (compile-time assertions)", () => {
		type Ctx = { count: number };

		const { Context, useContext } = createTypedContext<Ctx, "Counter">({
			name: "Counter",
		});

		const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => <Context.Provider value={{ count: 1 }}>{children}</Context.Provider>;

		const { result } = renderHook(() => useContext("Counter.Test"), { wrapper });

		// This compiles because result.current is Ctx
		const count: number = result.current.count;
		expect(count).toBe(1);

		// @ts-expect-error - property does not exist on Ctx
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const nope = result.current.missing;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
		const BadWrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
			// @ts-expect-error - wrong Provider value shape should fail at compile time
			<Context.Provider value={{ count: "nope" }}>{children}</Context.Provider>
		);
	});
});
