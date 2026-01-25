Review of haitchUI Main Branch

This report reviews the main branch of the repository currently accessible via the connector (haitchstubbs/haitchUI). The repository is a TypeScript‑based monorepo managed with pnpm and turbo. It contains packages such as @haitch-ui/react and @haitch-ui/components and applications under apps/. The evaluation focuses on security and performance issues, GitHub actions, TypeScript typing strategy, and redundancies.

1 Security and performance issues
Use of dangerouslySetInnerHTML and injected styles

Several components insert raw HTML or CSS into the DOM using dangerouslySetInnerHTML or similar APIs. Examples include:

Code block component: the React CodeBlock uses dangerouslySetInnerHTML to render HTML output from the shiki syntax highlighter. While the code comment states that shiki returns trusted HTML, injecting HTML still risks cross‑site scripting if any part of the input is user‑supplied or if future dependencies change their behavior. It would be safer to sanitize the HTML or use a library that produces React elements.

Chart style injection: a ChartStyle component constructs a <style> tag with color variables based on a config object and sets it via dangerouslySetInnerHTML. If the config values come from user input, arbitrary CSS could be injected, leading to style pollution or security issues. Consider validating color strings and using React‑style props instead of injecting raw CSS.

Heading anchors: the MDX Heading component injects a static SVG for an anchor icon via innerHTML. This is less risky because the HTML is static, but using JSX instead of innerHTML would avoid potential injection.

Virtualization and performance

Efficient data tables: the DataTable component uses @tanstack/react-virtual to render only visible rows. It dynamically enables virtualization when the number of rows exceeds a threshold, creating a spacer div and positioning visible rows absolutely. This is a strong performance optimization for large datasets.

Throttle and debounce helpers: hooks like useToc use a rafThrottle helper to throttle scroll events with requestAnimationFrame, reducing layout thrashing. These patterns improve performance.

Other considerations

Environment variables: some components read process.env.NODE_ENV to show development‑only information. I did not find secrets or dynamic environment values being exposed to the client.

Package bundling: both packages use tsup to bundle code and generate type declarations. The build scripts appear typical for a TypeScript library.

Overall security & performance assessment
Category	Key findings	Impact/Recommendations
HTML injection	Components inject raw HTML and CSS with dangerouslySetInnerHTML.	Sanitize input, validate config values, or refactor to JSX/React elements to mitigate XSS.
Virtualization	DataTable uses virtualization for large datasets.	Good performance; maintain virtualization threshold and avoid expensive effects.
Environment variables	process.env.NODE_ENV used only for debug messages.	No secrets exposed.
Build setup	Monorepo uses turbo and tsup for building and pnpm for package management.	Good foundation; ensure dependencies remain up‑to‑date.
2 GitHub actions and CI/CD flaws

The repository defines a single workflow .github/workflows/release.yml triggered on pushes to the main branch. It uses Changesets
 to create release PRs and publish packages. Key observations:

Lack of CI for pull requests: there is no workflow to run linting, type‑checking, tests, or security scans on pull requests. This means code can be merged without any automatic checks, increasing the risk of broken builds or vulnerabilities being released. Consider adding workflows for:

Installing dependencies and running pnpm build, pnpm test, and pnpm lint on PRs.

Running pnpm typecheck to ensure the TypeScript code compiles without errors.

Using npm audit or tools like dependabot/pnpm audit for vulnerability scanning.

Broad permissions: the release workflow requests contents: write, pull-requests: write, and id-token: write. While releasing packages requires these privileges, the workflow could be limited by restricting write permissions to only required scopes (e.g., use the new permissions keys to specify contents: read and pull-requests: write only when necessary).

No caching: the action does not cache pnpm dependencies, causing longer install times. Adding actions/setup-node with caching can speed up builds.

Single branch trigger: the release action runs on pushes to main rather than on merged release PRs. If a misconfigured commit lands on main, it might trigger an unintended release. Consider gating releases behind an explicit manual step or tagging workflow.

3 Typing approach issues

The project generally uses TypeScript, but there are several patterns that reduce type safety:

Use of any and unsafely typed values

The Combobox primitive defines ComboboxValue = any and uses it for the value generic. Consumers lose type checking for combobox options. It would be better to use a generic type parameter or unknown with constraints to enforce type safety.

The Slot helper defines AnyProps as Record<string, unknown>, and uses (child.props as any).ref to access the child’s ref. Using unknown and proper type guards would avoid bypassing type safety.

The Tooltip hook returns floatingStyles?: any and context?: any, because the library cannot export its generics. This means the hook’s return type is essentially untyped. Creating wrapper types or re‑exporting the types from @floating-ui would improve safety.

Suppressed type errors with @ts-expect-error

The repository contains multiple @ts-expect-error or @ts-ignore annotations to suppress TypeScript errors:

The composeEventHandlers utility used across primitives (combobox, menubar, navigation menu) uses @ts-expect-error when checking event.defaultPrevented because the generic event type does not guarantee the property. This indicates the function’s signature is too generic. Narrowing the event type (e.g., React.SyntheticEvent) or using type guards would remove the need for suppressed errors.

The shallowEqual implementation for context menu uses @ts-expect-error index when accessing dynamic object keys. This suggests the function is not typed generically; rewriting it with generic constraints (<T extends object>) would avoid type errors.

Test files intentionally use @ts-expect-error to assert type errors. This is acceptable in test contexts, but if the same pattern appears in library code it suggests type problems.

Recommendations

Reduce any usage: replace any with generics (<T>) or unknown and provide proper type guards.

Remove suppressed errors: define more specific event types for event handlers and use generic constraints for equality helpers.

Use noImplicitAny and strict settings: enforcing stricter compiler options will surface hidden type issues.

4 Redundancies and code duplication

Several patterns and utilities are reimplemented multiple times or could be consolidated:

Repeated composeEventHandlers implementations: different primitives define nearly identical composeEventHandlers functions with suppressed type errors. Extracting this helper into a shared utility package (e.g., @haitch-ui/utils) and properly typing it would remove duplication and improve consistency.

Duplicate shallowEqual helpers: both context menu and other primitives define similar shallowEqual functions. A single, well‑typed helper could be shared.

Event composition logic: event handlers across components repeatedly check event.defaultPrevented and merge handlers. Centralizing the logic would reduce code size and simplify maintenance.

Monorepo scripts: the root package.json and package‑level package.json files define similar build/test/lint scripts. These could be deduplicated by using shared turbo pipelines or referencing scripts via workspace: dependencies.

Typing patterns: repeating ComboboxValue = any or AnyProps across primitives suggests a need for a unified generics strategy.

Conclusion

The haitchUI repository showcases thoughtful design, with virtualization for performance and a modern monorepo setup. However, there are notable security risks from injecting raw HTML/CSS, a lack of continuous integration checks, a permissive GitHub release workflow, and an overly permissive typing strategy that uses any and suppressed errors. Addressing these issues—by adding proper CI workflows, sanitizing inputs, centralizing utilities, and strengthening TypeScript typings—will improve the robustness, security, and maintainability of the project.