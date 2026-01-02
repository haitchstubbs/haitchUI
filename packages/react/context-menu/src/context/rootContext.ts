import { createContext } from "react";
import type { Ctx } from "./types";

export const RootContext = createContext<Ctx | null>(null);