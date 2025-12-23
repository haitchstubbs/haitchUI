// test-utils/a11y.ts
import { axe } from "vitest-axe/dist/index.js";
import type { AxeResults, RunOptions } from "axe-core";
import { expect } from "vitest";

export async function expectNoA11yViolations(
  container: HTMLElement,
  options?: RunOptions
): Promise<AxeResults> {
  const results = await axe(container, {
    // sensible defaults for component tests
    rules: {
      // add overrides here if your library intentionally uses patterns
      // that JSDOM can't model well (rare)
    },
    ...options,
  });

  expect(results).toHaveNoViolations();
  return results;
}
