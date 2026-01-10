import * as React from "react";
import vm from "node:vm";

import * as Babel from "@babel/core";
import presetReact from "@babel/preset-react";
import presetTypeScript from "@babel/preset-typescript";
import pluginCjs from "@babel/plugin-transform-modules-commonjs";

import { ALLOWLIST } from "./allowList";
import { stripAndPrepareInjection } from "./stripImports";

type AnyComponent = React.ComponentType<any>;

function makeSandboxRequire() {
	// Only needed for JSX automatic runtime output
	return (id: string) => {
		if (id === "react") return require("react");
		if (id === "react/jsx-runtime") return require("react/jsx-runtime");
		if (id === "react/jsx-dev-runtime") return require("react/jsx-dev-runtime");
		throw new Error(`Disallowed require: ${id}`);
	};
}

export async function createReactComponentFromString(code: string): Promise<AnyComponent> {
	// 1) Strip imports + create injection map (Button, cn, etc.)
	const { codeWithoutImports, injection } = stripAndPrepareInjection(code, ALLOWLIST);

	// 2) Transform TSX/JSX -> runnable CommonJS
	const transformed = await Babel.transformAsync(codeWithoutImports, {
		filename: "template.tsx",
		babelrc: false,
		configFile: false,
		presets: [
			[presetTypeScript, { isTSX: true, allExtensions: true }],
			[presetReact, { runtime: "automatic" }],
		],
		plugins: [[pluginCjs, { loose: true }]],
		sourceMaps: false,
	});

	const js = transformed?.code;
	if (!js) throw new Error("Babel transform produced no output");

	const moduleObj = { exports: {} as Record<string, any> };

const sandbox: Record<string, any> = {
  console,
  React,
  require: makeSandboxRequire(),

  module: moduleObj,
  exports: moduleObj.exports, // <-- CRITICAL: link them

  ...injection,
};

vm.createContext(sandbox);

const wrapped = `(function (exports, module, require) { "use strict"; ${js}\n})`;
const fn = vm.runInContext(wrapped, sandbox, { timeout: 250 });

// pass the linked exports object
fn(moduleObj.exports, moduleObj, sandbox.require);

const modExports = moduleObj.exports;
const Component = modExports?.default;

if (typeof Component !== "function") {
  throw new Error(
    `Template did not export a valid React component. Exports: ${
      Object.keys(modExports ?? {}).join(", ") || "(none)"
    }`
  );
}

return Component;
}
