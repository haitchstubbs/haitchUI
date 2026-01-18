import { config as baseConfig } from "@haitch-ui/eslint-config/base";
import { nextJsConfig } from "@haitch-ui/eslint-config/next-js";
import { config as reactInternalConfig } from "@haitch-ui/eslint-config/react-internal";

const applyFiles = (configs, files) =>
  configs.map((config) => (config.ignores ? config : { ...config, files }));

export const eslintConfig = [
  ...applyFiles(nextJsConfig, ["apps/**/*.{js,jsx,ts,tsx}"]),
  ...applyFiles(reactInternalConfig, ["packages/**/*.{js,jsx,ts,tsx}"]),
  ...applyFiles(baseConfig, ["scripts/**/*.{js,ts}"]),
];
