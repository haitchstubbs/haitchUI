import { createContext } from "react";
import type { RadioGroupCtx } from "../types";

export const RadioGroupContext = createContext<RadioGroupCtx | null>(null);
