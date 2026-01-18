import { config as baseConfig } from "./eslint/base.js";
import { nextJsConfig } from "./eslint/next.js";
import { config as reactInternalConfig } from "./eslint/react-internal.js";

const applyFiles = (configs, files) =>
  configs.map((config) => (config.ignores ? config : { ...config, files }));

export const eslintConfig = [
  ...applyFiles(nextJsConfig, ["apps/**/*.{js,jsx,ts,tsx}"]),
  ...applyFiles(reactInternalConfig, ["packages/**/*.{js,jsx,ts,tsx}"]),
  ...applyFiles(baseConfig, ["scripts/**/*.{js,ts}"]),
];
