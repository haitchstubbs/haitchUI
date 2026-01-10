export type NavItem = {
	title: string;
	url: string;
	isActive?: boolean;
};

export type NavGroup = {
	title: string;
	url: string;
	items: NavItem[];
};

export type NavData = {
	docs: NavGroup[];
	examples: NavGroup[];
};

import { COMPS } from "./registry";

const comingSoonComponents = new Set<string>([
	"data-table",
]);

const inProgressComponents = new Set<string>([	

]);

const unstableComponents = new Set<string>([
	"navigation-menu",
])

// Generate navigation data from COMPS
export const data: NavData = {
	docs: [
		{
			title: "Documentation",
			url: "/docs",
			items: Object.keys(COMPS).map((key) => ({
				// Title should display coming soon for components not yet implemented
				title: comingSoonComponents.has(key)
					? `${COMPS[key as keyof typeof COMPS].title} (Coming Soon)`
					: inProgressComponents.has(key)
						? `${COMPS[key as keyof typeof COMPS].title} (In Progress)`
						: unstableComponents.has(key)
							? `${COMPS[key as keyof typeof COMPS].title} (Unstable)`
							: COMPS[key as keyof typeof COMPS].title || key,
				url: COMPS[key as keyof typeof COMPS].docURL || `/docs/${key}`,
			})),
		},
	],
	examples: [
		{
			title: "Examples",
			url: "/components",
			items: Object.keys(COMPS).map((key) => ({
				title: comingSoonComponents.has(key)
					? `${COMPS[key as keyof typeof COMPS].title} (Coming Soon)`
					: inProgressComponents.has(key)
						? `${COMPS[key as keyof typeof COMPS].title} (In Progress)`
						: unstableComponents.has(key)
							? `${COMPS[key as keyof typeof COMPS].title} (Unstable)`
							: COMPS[key as keyof typeof COMPS].title || key,
				url: COMPS[key as keyof typeof COMPS].componentURL || `/components/${key}`,
			})),
		},
	],
};
