// app/components/_registry/index.ts
import type React from "react";
import { COMPS } from "../../../lib/registry";

export type DemoComponent = React.ComponentType<any>;
export type DemoNamespace = Record<string, DemoComponent>;

export type RegistryModule = {
	Docs: React.ComponentType<any>;
	Demo?: DemoComponent | DemoNamespace; // allow either
	code?: string;
};

export type ComponentEntry = {
	title: string;
	description?: string;
	load: () => Promise<RegistryModule>;
};

function normalizeTitle(slug: string): string {
	// Slug may or may NOT have hyphens
	return slug
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function createLoader(slug: string) {
	return async () => {
		const mod = await import(`../_content/${slug}/entry`);
		return mod.default;
	};
}

type ComponentsMap = typeof COMPS;
type Slug = keyof ComponentsMap;
const COMPONENTS = Object.keys(COMPS) as Slug[];

function createRegistry(): Record<Slug, ComponentEntry> {
	const registry: Record<Slug, ComponentEntry> = {} as Record<Slug, ComponentEntry>;

	for (const slug of COMPONENTS) {
		const meta = COMPS[slug];

		registry[slug] = {
			title: meta.title ?? normalizeTitle(slug),
			description: meta.description ?? "",
			load: createLoader(slug),
		};
	}
	return registry;
}
export const registry = createRegistry();