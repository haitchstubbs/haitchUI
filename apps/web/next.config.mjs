import createMDX from "@next/mdx";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

const linkSvg = {
	type: "element",
	tagName: "svg",
	properties: {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 2,
		strokeLinecap: "round",
		strokeLinejoin: "round",

		// Tailwind sizing (override width/height attrs)
		className: ["size-6"],

		// Accessibility
		"aria-hidden": "true",
		focusable: "false",
	},
	children: [
		// invisible reset path
		{
			type: "element",
			tagName: "path",
			properties: {
				stroke: "none",
				d: "M0 0h24v24H0z",
				fill: "none",
			},
			children: [],
		},

		// actual icon paths
		{
			type: "element",
			tagName: "path",
			properties: { d: "M9 15l6 -6" },
			children: [],
		},
		{
			type: "element",
			tagName: "path",
			properties: {
				d: "M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464",
			},
			children: [],
		},
		{
			type: "element",
			tagName: "path",
			properties: {
				d: "M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463",
			},
			children: [],
		},
	],
};

const withMDX = createMDX({
	extension: /\.mdx?$/,
	options: {
		rehypePlugins: [
			rehypeSlug,
			[
				rehypeAutolinkHeadings,
				{
					behavior: "prepend",
					properties: {
						"data-heading-anchor": "",
						"aria-label": "Link to heading",
						className: [
							"-ml-8",
							"mr-2",
							"inline-flex",
							"size-6",
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
						],
					},
					// IMPORTANT: make it an array (most compatible)
					content: [linkSvg],
				},
			],
		],
	},
});

export default withMDX({
	pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
	experimental: {
		externalDir: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "api.dicebear.com",
				port: "",
				pathname: "/**",
			}
		],
	},
	transpilePackages: ["@haitch-ui/react"],
});
