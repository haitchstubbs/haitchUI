import { createContext } from "react";
import type { Ctx } from "../context/types";

export const SubContext = createContext<Ctx | null>(null);