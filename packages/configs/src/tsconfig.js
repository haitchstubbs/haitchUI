import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export const tsConfig = require("../tsconfig/base.json");
