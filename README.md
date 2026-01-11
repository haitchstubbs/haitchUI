# Haitch UI

## Introduction

Modern UI kits are highly tailored toward interaction-rich SaaS applications, dashboards, and landing pages. Libraries like **shadcn**, **Radix UI**, **Base UI**, and **Floating UI** make it easy to spin up new projects, prototype quickly, and ship polished interfaces.

That approach works well for demos and CRUD-style apps—but web applications are becoming increasingly **bleeding-edge** in the age of AI and data-heavy workflows. In real production systems, developers are now expected to handle:

1. **Streaming unfathomable amounts of tokens into the UI** from AI agents (LLMs, tools, traces, logs)
2. **Rendering partial, out-of-order, and continuously updating content** without blowing up React reconciliation
3. **Embedding web components inside Shadow DOMs** for scalable, user-facing analytics and isolation
4. **Strong opinions about interaction models**, often enforced with hard-coded client-side logic
5. **Strict performance budgets** where hydration cost matters more than visual polish
6. **Long-lived screens** (hours or days open) instead of short, transactional sessions
7. **Complex permission models** that affect rendering at runtime, not build time
8. **Composable data density**, not just composable UI (tables, timelines, inspectors, editors)
9. **Multi-tenant theming** without duplicating bundles or CSS
10. **Predictable behavior under stress**, not just along ideal interaction paths

This is where modern UI kits begin to break down.

Most are optimized for **interactivity over throughput**—hover states, transitions, and micro-interactions—rather than streaming thousands of updates per minute. They tend to **over-index on client components**, forcing hydration even when it isn’t necessary, and often bake **implicit state** (open/close, focus, animation) directly into primitives.

As data volume increases, these abstractions start to crack. Large DOM trees become expensive to render, “composable” APIs grow brittle under real data density, and accessibility layers—while essential—can hide significant runtime costs with no clear escape hatches. Streaming, partial hydration, and incremental rendering are usually second-class concerns. Shadow DOM support is frequently an afterthought. Styling systems struggle to survive multi-tenant environments. And when you finally need to bypass the abstraction, the escape hatches are either undocumented or unsafe.

After spending most of 2025 experimenting with popular UI kits, I repeatedly ended up building bespoke solutions just to work around these constraints.

That friction is the reason **@haitch-ui** exists.

## What Is Haitch UI?

**@haitch-ui is intentionally boring.**

It’s a collection of **simple primitives** and **thin UI wrappers** that prioritize:

* Predictable rendering
* Explicit state
* Minimal client-side logic
* Performance parity with accessibility

Instead of reinventing UI patterns, Haitch UI **re-composes existing, battle-tested tools** into primitives that can survive real production workloads.

If something can be:

* Rendered on the server → it is
* Controlled externally → it must be
* Disabled entirely → it should be trivial

---

## Getting Started

First, install `pnpm` if you haven’t already:

```bash
npm install -g pnpm
```

Then install dependencies:

```bash
pnpm install
```

---

## Getting Around the Repo

* **Primitives** live in:
  `/packages/react/*`
* **UI wrappers and composed components** live in:
  `/apps/web/components`

The separation is intentional: primitives stay dumb, wrappers stay replaceable.

---

## Documentation

The documentation site is currently under construction.

In the meantime, the codebase itself is the source of truth—each primitive is designed to be readable, minimal, and unsurprising.

---

## Releases

Releases are currently manual, as I’m the sole maintainer.

Most of the library is still **pre-release (`v0.0.0`)**.

* `v0.0.1` → `v0.1.x`
  Used to finalize APIs and prepare initial release assets
* `v0.2.0`
  Marks the first stable public release

Expected timeline for initial assets: **1–2 weeks**.

---

## Roadmap

* Initial documentation site
* Discord community for early adopters
* Performance benchmarks vs popular UI kits
* Shadow DOM–safe component set
* Streaming-first primitives

Once the Discord is live, it will be linked here.