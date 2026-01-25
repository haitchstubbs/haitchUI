"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { TocItem } from "./use-toc";
import { throttle } from "@/lib/throttle";

type DocsWrapperContextType = {
	hidden: boolean;
	setHidden: (hidden: boolean) => void;
};

function shouldHideForScreenWidth() {
	if (typeof window === "undefined") return false;
	return window.innerWidth < 1248; // Tailwind's lg breakpoint
}

const DocsWrapperContext = createContext<DocsWrapperContextType>({
	hidden: shouldHideForScreenWidth(),
	setHidden: () => {},
});

export function useDocsWrapperContext() {
	return useContext(DocsWrapperContext);
}

export function DocsProvider({ children }: { children: React.ReactNode }) {
	const [hidden, setHidden] = useState(shouldHideForScreenWidth());

	useEffect(() => {
		const onResize = throttle(() => {
			setHidden(shouldHideForScreenWidth());
		});
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);
	return (
		<DocsWrapperContext.Provider
			value={{
				hidden: hidden,
				setHidden: setHidden,
			}}
		>
			{children}
		</DocsWrapperContext.Provider>
	);
}
