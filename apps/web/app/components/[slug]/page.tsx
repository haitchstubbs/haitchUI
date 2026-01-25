import React from "react";
import { notFound } from "next/navigation";
import { registry } from "../_registry/index";
import { Toc } from "./toc";
import { DocsWrapper } from "./docs-wrapper";

export default async function ComponentDocPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const rootId = `mdx-doc-${slug}`;
	const entry = registry[slug as keyof typeof registry];
	if (!entry) return notFound();

	const mod = await entry.load();
	const Docs = await mod.loadDocs();

	const basePath = `/components/${slug}`;

	return (
		<div id={rootId}>
			<DocsWrapper basePath={basePath}>
				<Docs />
			</DocsWrapper>
		</div>
	);
}
