import * as React from "react";
import { describe, it } from "vitest";
import { render } from "@testing-library/react";

import { expectNoA11yViolations } from "./a11y";

describe("a11y helper", () => {
  it("reports no violations for a labeled control", async () => {
    const { container } = render(
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" />
      </div>
    );

    await expectNoA11yViolations(container);
  });
});

