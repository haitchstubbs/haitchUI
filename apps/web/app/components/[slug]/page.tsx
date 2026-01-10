import React from "react";
import { notFound } from "next/navigation";
import { registry } from "../_registry/index";
import { Toc } from "./toc";

export default async function ComponentDocPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const rootId = `mdx-doc-${slug}`;
	const entry = registry[slug as keyof typeof registry];
	if (!entry) return notFound();

	const mod = await entry.load();
	const Docs = mod.Docs;

	const basePath = `/components/${slug}`;

	return (
		<div id={rootId} className="w-full flex justify-center py-10 relative">
			<main id="docs-content" className="w-3xl relative">
				<Docs />
			</main>

			<Toc basePath={basePath} />
		</div>
	);
}
