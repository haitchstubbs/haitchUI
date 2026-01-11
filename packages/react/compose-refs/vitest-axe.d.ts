import type { Result } from "axe-core";

interface NoViolationsMatcherResult {
  pass: boolean;
  message(): string;
  actual: Result[];
}

declare module "vitest" {
  interface Assertion<T = any> {
    toHaveNoViolations(): NoViolationsMatcherResult;
  }

  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): unknown;
  }
}
