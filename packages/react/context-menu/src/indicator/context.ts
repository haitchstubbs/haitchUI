import { createContext } from "react";
import type { IndicatorState } from "../types";

export const ItemIndicatorContext = createContext<IndicatorState | null>(null);