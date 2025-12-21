# Copilot Instructions for haitchUI Monorepo

## Overview
- **Monorepo** managed with [Turborepo](https://turborepo.com/), containing source code for:
  - @haitch/ui: React UI component library.
  - @haitch/core: Core overlay logic/hooks.
  - Web app: Next.js application demoing the UI library.
  - Docs site: Next.js documentation site.
  - Test suites for components and core logic.
- Shared packages: 
  - `@repo/ui` (React UI components)
  - `@haitch/core` (overlay logic)
  - `@repo/eslint-config` (ESLint config)
  - `@repo/typescript-config` (TypeScript config).

### @haitch/ui
- React component library with pre-built UI components.
- Components are built using TypeScript and React 18+.
- Uses `@haitch/core` for overlay/floating UI logic.
- Intended for use in React applications
- Is a CLI package, allowing users to generate new components via scripts.

### @haitch/core
- Provides context and hooks for managing floating overlays (popovers, tooltips, modals).
- Built on top of `@floating-ui/react` for positioning and interactions.
- Supports both DOM and virtual elements as reference points for overlays.
- Designed to be framework-agnostic, but currently focused on React.
- Provides context providers for customizing overlay behavior in different environments (e.g., shadow DOM, iframes).
- Offers extensibility points for adding new overlay types and behaviors.

### @haitch/cli
- CLI tool for developers to scaffold new components using using source from `@haitch/ui`.
- Similar in concept to shadcn/ui's CLI.
- Provides commands to generate component boilerplate code.

## Key Workflows
- **Build all:** `turbo build` (or `npx turbo build`)
- **Build specific app/package:** `turbo build --filter=web` (or `docs`, `@repo/ui`, etc.)
- **Dev server (app):** `npm run dev` (from app dir)
- **Lint:** `turbo lint` or `npm run lint` in package/app
- **Type check:** `turbo check-types` or `npm run check-types`

## Project Structure & Patterns
- **Apps:**
  - `apps/web` and `apps/docs` are Next.js apps using the `/app` directory (not `/pages`).
  - Each app has its own `package.json`, `tsconfig.json`, and can be run/linted/typed independently.
- **UI Library (`@repo/ui`):**
  - Exports React components from `src/`.
  - Use `generate:component` script for new components: `npm run generate:component`.
- **Core Overlay Logic (`@haitch/core`):**
  - Provides hooks like `usePopover`, `useTooltip` for floating overlays, built on `@floating-ui/react`.
  - Supports both DOM and virtual (non-DOM) references for overlays.
  - Uses context providers (`OverlayDOMProvider`) for DOM environment customization (e.g., shadow DOM, iframes).
  - See `packages/core/src/overlays/` and `packages/core/src/dom/` for extensibility points.
- **ESLint/TS Config:**
  - Shared configs in `packages/eslint-config` and `packages/typescript-config`.
  - Extend these in each app/package for consistency.

## Conventions & Integration
- **TypeScript everywhere.**
- **React 18+ required.**
- **All overlays/components are expected to be client components (`"use client"`).**
- **Prefer context-based customization for overlays (see `OverlayDOMProvider`).**
- **Use `@floating-ui/react` for all floating/overlay logic.**
- **No direct DOM manipulation; use provided helpers/context.**

## Examples
- To add a new overlay type, follow the pattern in `packages/core/src/overlays/usePopover.tsx` and `useTooltip.ts`.
- To support custom portal roots (e.g., shadow DOM), implement a custom `OverlayDOM` and provide via `OverlayDOMProvider`.

## References
- [README.md](../README.md) for monorepo and workflow overview.
- [packages/core/src/context.tsx](../packages/core/src/context.tsx) for main overlay exports.
- [packages/core/src/manager.ts](../packages/core/src/manager.ts) for overlay patterns.
- [packages/ui/src/](../packages/ui/src/) for UI component patterns.

---
For any unclear or missing conventions, review the referenced files or ask for clarification.