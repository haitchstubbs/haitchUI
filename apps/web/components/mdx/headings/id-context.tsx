"use client";

import * as React from "react";

export type HeadingIdCtx = {
	nextId: (base: string) => string;
	reserve: (id: string) => void;
};

const Ctx = React.createContext<HeadingIdCtx | null>(null);

export function HeadingIdProvider({ children }: { children: React.ReactNode }) {
	const valueRef = React.useRef<{
		counts: Map<string, number>;
		used: Set<string>;
	} | null>(null);

	if (!valueRef.current) {
		valueRef.current = { counts: new Map(), used: new Set() };
	}

	const api = React.useMemo<HeadingIdCtx>(() => {
		return {
			nextId(base: string) {
				const state = valueRef.current!;
				const current = state.counts.get(base) ?? 0;
				const next = current + 1;
				state.counts.set(base, next);

				let id = next === 1 ? base : `${base}-${next}`;
				while (state.used.has(id)) {
					const bump = (state.counts.get(base) ?? next) + 1;
					state.counts.set(base, bump);
					id = `${base}-${bump}`;
				}

				state.used.add(id);
				return id;
			},
			reserve(id: string) {
				valueRef.current!.used.add(id);
			},
		};
	}, []);

	return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useHeadingIdCtx() {
	const ctx = React.useContext(Ctx);
	if (!ctx) throw new Error("useHeadingIdCtx must be used within <HeadingIdProvider />");
	return ctx;
}
