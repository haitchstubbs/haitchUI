"use client";

import * as React from "react";

function slugify(input: string) {
	return input
		.toLowerCase()
		.trim()
		.replace(/['"]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

function ensureHeadingId(h: HTMLElement, used: Set<string>) {
	if (h.id) {
		used.add(h.id);
		return h.id;
	}

	const text = (h.innerText || "").trim();
	const base = slugify(text);
	if (!base) return null;

	let id = base;
	let i = 2;
	while (used.has(id) || document.getElementById(id)) id = `${base}-${i++}`;

	h.id = id;
	used.add(id);
	return id;
}

function injectAnchor(h: HTMLElement) {
	// already injected?
	if (h.querySelector(":scope > [data-heading-anchor]")) return;

	// Make heading a flex row
	h.classList.add("group", "flex", "items-center", "gap-2");

	const a = document.createElement("a");
	a.setAttribute("data-heading-anchor", "");
	a.setAttribute("aria-label", "Link to heading");

	a.className = [
		"-ml-10", // vertical alignment tweak
		"inline-flex",
		"size-8",
		"shrink-0",
		"items-center",
		"justify-center",
		"rounded-md",
		"text-muted-foreground",
		"opacity-100",
		"transition-opacity",
		"group-hover:opacity-80",
		"group-focus-within:opacity-80",
		"focus-visible:opacity-80",
		"focus-visible:outline-none",
		"focus-visible:ring-2",
		"focus-visible:ring-ring",
		"focus-visible:ring-offset-2",
	].join(" ");

	a.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-link"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 15l6 -6" /><path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" /><path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" /></svg>
  `;

	a.addEventListener("click", (e) => {
		e.preventDefault();
		const id = h.id;
		if (!id) return;

		window.location.hash = id;
		const url = `${window.location.origin}${window.location.pathname}#${id}`;
		navigator.clipboard?.writeText(url).catch(() => {});
	});

	h.insertBefore(a, h.firstChild);
}

function process(root: HTMLElement) {
	const used = new Set<string>();
	for (const el of Array.from(root.querySelectorAll<HTMLElement>("[id]"))) used.add(el.id);

	const headings = Array.from(root.querySelectorAll<HTMLElement>("h1,h2,h3,h4,h5,h6")).filter(
		(h) => !h.closest("[data-mdx-ignore-headings], pre, code")
	);

	for (const h of headings) {
		const id = ensureHeadingId(h, used);
		if (!id) continue;
		// keep href correct
		injectAnchor(h);
		const a = h.querySelector<HTMLAnchorElement>(":scope > [data-heading-anchor]");
		if (a) a.href = `#${id}`;
	}
}

export function MdxHeadingEnhancer({ rootId }: { rootId: string }) {
	React.useEffect(() => {
		const wrapper = document.getElementById(rootId);
		if (!wrapper) return;

		const root = wrapper.querySelector<HTMLElement>("#docs-content") ?? wrapper;

		process(root);

		const obs = new MutationObserver(() => process(root));
		obs.observe(root, { childList: true, subtree: true });

		return () => obs.disconnect();
	}, [rootId]);

	return null;
}
