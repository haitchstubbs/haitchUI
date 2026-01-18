import * as React from "react";
import { highlight } from "@haitch-ui/react/code-block/server";
import CodeBlockDemoCard from "./markdown-component-preview";

type MdxCodeDemoCardProps = {
	code: string; // <-- accept unknown to handle MDX reality
	lang?: unknown;
	children?: React.ReactNode;
	fallbackToPlain?: boolean;
	onError?: (event: HighlightEvent) => void;
};

type HighlightEvent = {
	ok: boolean;
	stage: "extract" | "validate" | "sanitize" | "highlight" | "render";
	lang?: string;
	error?: string;
	receivedType?: string;
	codeStats?: {
		chars: number;
		lines: number;
		trailingNewlineStripped: boolean;
	};
};

function escapeHtml(input: string) {
	return input.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function normalizeLang(lang: unknown, fallback: string) {
	if (typeof lang !== "string") return fallback;
	const trimmed = lang.trim();
	return trimmed.length ? trimmed : fallback;
}

function stats(raw: string, original: string) {
	const trailingNewlineStripped = original.endsWith("\n") && !raw.endsWith("\n");
	const lines = raw.length === 0 ? 0 : raw.split("\n").length;
	return { chars: raw.length, lines, trailingNewlineStripped };
}

// Try to turn MDX “stuff” into a string
function extractString(value: unknown): string | null {
	if (typeof value === "string") return value;

	// ✅ module/object exports: { code }, { default }, etc.
	if (value && typeof value === "object") {
		const v = value as Record<string, unknown>;
		if (typeof v.code === "string") return v.code;
		if (typeof v.default === "string") return v.default;
		if (typeof v.raw === "string") return v.raw;
		if (typeof v.value === "string") return v.value;
	}

	if (typeof value === "number" || typeof value === "bigint" || typeof value === "boolean") {
		return String(value);
	}

	if (Array.isArray(value)) {
		const parts = value.map((v) => extractString(v)).filter((v): v is string => typeof v === "string" && v.length > 0);
		return parts.length ? parts.join("") : null;
	}

	if (React.isValidElement(value)) {
		const child = (value as any).props?.children as unknown;
		const fromChildren = extractString(child);
		if (fromChildren) return fromChildren;
	}

	if (value && typeof value === "object") {
		const maybeChildren = (value as any).props?.children as unknown;
		const fromPropsChildren = extractString(maybeChildren);
		if (fromPropsChildren) return fromPropsChildren;
	}

	return null;
}

export async function MdxCodeDemoCard(props: MdxCodeDemoCardProps) {
	const { children, fallbackToPlain = true, onError } = await props;

	const lang = normalizeLang(props.lang, "tsx");

  const report = (input: unknown) => {
    const event =
      input && typeof input === "object"
        ? (input as Partial<HighlightEvent>)
        : ({ ok: false, stage: "render", error: String(input) } satisfies HighlightEvent);

    const normalized: HighlightEvent = {
      ok: typeof event.ok === "boolean" ? event.ok : false,
      stage: (event.stage ?? "render") as HighlightEvent["stage"],
      lang: typeof event.lang === "string" ? event.lang : lang,
      error: typeof event.error === "string" ? event.error : "Unknown error (invalid event shape).",
      receivedType: event.receivedType,
      codeStats: event.codeStats,
    };

    if (typeof onError === "function") return onError(normalized);
    if (!normalized.ok) console.error("[MdxCodeDemoCard]", normalized, JSON.stringify(normalized));
  };

	// ---- extract
	const extracted = extractString(props.code) ?? extractString(children);

	if (extracted == null) {
		report({
			ok: false,
			stage: "extract",
			lang,
			error: "Could not extract code string from `code` or `children`.",
			receivedType: Object.prototype.toString.call(props.code),
		});
		return null;
	}

	// ---- validate
	if (typeof extracted !== "string") {
		report({
			ok: false,
			stage: "validate",
			lang,
			error: "Expected extracted code to be a string.",
			receivedType: typeof extracted,
		});
		return null;
	}

	// ---- sanitize
	const raw = extracted.replace(/\n$/, "");

	const MAX_CHARS = 200_000;
	if (raw.length > MAX_CHARS) {
		report({
			ok: false,
			stage: "sanitize",
			lang,
			error: `Code block too large (${raw.length} chars). Max is ${MAX_CHARS}.`,
			codeStats: stats(raw, extracted),
		});

		if (!fallbackToPlain) return null;

		const safeHtml = `<pre><code>${escapeHtml(raw)}</code></pre>`;
		return (
			<CodeBlockDemoCard code={raw} highlightedHtml={safeHtml}>
				{children}
			</CodeBlockDemoCard>
		);
	}

	// ---- highlight
	let highlightedHtml: string;
	try {
		highlightedHtml = await highlight(raw, lang, true);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error while highlighting.";
		report({
			ok: false,
			stage: "highlight",
			lang,
			error: message,
			codeStats: stats(raw, extracted),
		});

		if (!fallbackToPlain) return null;

		const safeHtml = `<pre><code>${escapeHtml(raw)}</code></pre>`;
		return (
			<CodeBlockDemoCard code={raw} highlightedHtml={safeHtml}>
				{children}
			</CodeBlockDemoCard>
		);
	}

	if (typeof highlightedHtml !== "string" || highlightedHtml.trim().length === 0) {
		report({
			ok: false,
			stage: "highlight",
			lang,
			error: "Highlight returned empty output.",
			codeStats: stats(raw, extracted),
		});

		if (!fallbackToPlain) return null;

		const safeHtml = `<pre><code>${escapeHtml(raw)}</code></pre>`;
		return (
			<CodeBlockDemoCard data-code-preview code={raw} highlightedHtml={safeHtml}>
				{children}
			</CodeBlockDemoCard>
		);
	}

	return (
		<CodeBlockDemoCard data-code-preview code={raw} highlightedHtml={highlightedHtml}>
			{children}
		</CodeBlockDemoCard>
	);
}
