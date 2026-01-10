import type { MDXComponents } from "mdx/types";
import { MdxCodeBlockPre } from "./components/mdx/markdown-code-block";
import { Typography } from "./components/ui/typography";
import { MdxCodeDemoCard } from "./components/mdx/component-preview";

// This is the hook Next.js calls to get your MDX component map.
// You can merge/override per-page by passing `components` too.
export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		// Headings
		h1: (props) => <Typography.H1 {...props} />,
		h2: (props) => <Typography.H2 {...props} />,
		h3: (props) => <Typography.H3 {...props} />,
		h4: (props) => <Typography.H4 {...props} />,
		h5: (props) => <Typography.H5 {...props} />,
		h6: (props) => <Typography.H6 {...props} />,

		// Text
		p: (props) => <Typography.P {...props} />,
		blockquote: (props) => <Typography.Blockquote {...props} />,

		// Lists
		ul: (props) => <Typography.UL {...props} />,
		ol: (props) => <Typography.OL {...props} />,
		li: (props) => <Typography.LI {...props} />,

		// Inline code:
		// MDX code blocks are typically handled by `pre` + your code block component.
		// Mapping `code` here covers inline `\`code\``.
		code:  (props) => <InlineCodeGuard data-mdx-ignore-headings="" {...props} />,
		pre: (props) => (
			<div data-mdx-ignore-headings="" className="mt-4">
				<MdxCodeBlockPre {...props} />
			</div>
		),
		CodePreview: (props) => (
			<div data-mdx-ignore-headings="" className="mt-4">
				<MdxCodeDemoCard {...(props as any)} />
			</div>
		),
		// Optional extras
		a: (props) => {
			// rehype-autolink-headings adds aria-hidden + tabindex=-1 by default
			const isHeadingAnchor =
				(props as any)["aria-hidden"] === "true" ||
				(props as any)["data-heading-anchor"] != null ||
				(typeof (props as any).className === "string" && (props as any).className.includes("icon-link"));

			if (isHeadingAnchor) {
				return <a {...props} />; // keep plugin classes/content intact
			}

			return <Typography.A {...props} />;
		},
		hr: (props) => <Typography.HR {...props} />,
		strong: (props) => <Typography.Strong {...props} />,
		em: (props) => <Typography.Em {...props} />,

		// Table
		table: (props) => (
			<Typography.TableWrapper>
				<Typography.Table {...props} />
			</Typography.TableWrapper>
		),
		tr: (props) => <Typography.Tr {...props} />,
		th: (props) => <Typography.Th {...props} />,
		td: (props) => <Typography.Td {...props} />,

		...components,
	};
}

function InlineCodeGuard(props: React.ComponentPropsWithoutRef<"code">) {
	// If this is a fenced block's <code class="language-...">,
	// let the `pre` renderer handle it. Don’t wrap it.
	const className = props.className ?? "";
	if (/language-/.test(className)) return <code {...props} />;

	return <Typography.Code {...props} />;
}
