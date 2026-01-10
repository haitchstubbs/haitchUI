"use client";

import * as React from "react";
import { HeadingIdProvider } from "./id-context";

export function MdxHeadingProvider({ children }: { children: React.ReactNode }) {
	return <HeadingIdProvider>{children}</HeadingIdProvider>;
}