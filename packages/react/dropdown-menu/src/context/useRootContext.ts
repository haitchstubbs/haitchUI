import { useContext } from "react";
import { RootContext } from "./rootContext";

export function useCtx() {
    const ctx = useContext(RootContext);
    if (!ctx) throw new Error("DropdownMenu components must be wrapped in <Root />");
    return ctx;
}