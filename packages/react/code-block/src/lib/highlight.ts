import { createHighlighter, type Highlighter } from "shiki";

const THEME = "github-dark";
const DEFAULT_LANG = "tsx";

const PRELOAD_LANGS = [
  "tsx",
  "ts",
  "js",
  "jsx",
  "json",
  "bash",
  "css",
  "html",
  "md",
  "sql",
] as const;

const highlighterPromise: Promise<Highlighter> = createHighlighter({
  themes: [THEME],
  langs: [...PRELOAD_LANGS],
});

type HighlightOptions = {
  lang?: string;
  numbered?: boolean;
  /** Max cache entries; 0 disables caching */
  cacheSize?: number;
};

const DEFAULT_CACHE_SIZE = 500;
const lru = new Map<string, Promise<string>>();

function normalizeCode(input: string) {
  const normalized = input.replace(/\r\n/g, "\n");
  return normalized.endsWith("\n") ? normalized.slice(0, -1) : normalized;
}

// FNV-1a 32-bit (fast, dependency-free)
function fnv1a32(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    // hash *= 16777619 (but using shifts for speed)
    hash = (hash + (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)) >>> 0;
  }
  return hash >>> 0;
}

function toBase36(u32: number) {
  return u32.toString(36);
}

function makeKey(code: string, lang: string, numbered: boolean) {
  // include code length to further reduce collision chance
  const h = fnv1a32(code);
  return `${THEME}\u0000${lang}\u0000${numbered ? "1" : "0"}\u0000${code.length}\u0000${toBase36(h)}`;
}

export async function highlight(
  code: string,
  lang: string = DEFAULT_LANG,
  numbered: boolean = true,
  opts: HighlightOptions = {}
): Promise<string> {
  const cacheSize = opts.cacheSize ?? DEFAULT_CACHE_SIZE;

  const normalized = normalizeCode(code);
  const resolvedLang = (opts.lang ?? lang ?? DEFAULT_LANG).trim() || DEFAULT_LANG;
  const useNumbers = opts.numbered ?? numbered;

  if (cacheSize <= 0) {
    return highlightUncached(normalized, resolvedLang, useNumbers);
  }

  const key = makeKey(normalized, resolvedLang, useNumbers);

  const existing = lru.get(key);
  if (existing) {
    lru.delete(key);
    lru.set(key, existing);
    return existing;
  }

  const promise = highlightUncached(normalized, resolvedLang, useNumbers);
  lru.set(key, promise);

  while (lru.size > cacheSize) {
    const oldestKey = lru.keys().next().value as string | undefined;
    if (!oldestKey) break;
    lru.delete(oldestKey);
  }

  try {
    return await promise;
  } catch (err) {
    lru.delete(key);
    throw err;
  }
}

async function highlightUncached(code: string, lang: string, numbered: boolean) {
  const highlighter = await highlighterPromise;

  let html: string;
  try {
    html = highlighter.codeToHtml(code, { lang, theme: THEME });
  } catch {
    html = highlighter.codeToHtml(code, { lang: DEFAULT_LANG, theme: THEME });
  }

  return numbered ? addLineNumbers(html) : html;
}

const LINE_CLASS = "line";
const LINE_NUMBER_CLASS = "ln";
const BASE_GUTTER_WIDTH = "\u00A0\u00A0\u00A0\u00A0";
const GUTTER_HTML_START = `<span class="${LINE_CLASS}"><span class="${LINE_NUMBER_CLASS}" aria-hidden="true">`;

function addLineNumbers(html: string) {
  const start = html.indexOf("<code");
  if (start === -1) return html;

  const codeStart = html.indexOf(">", start);
  const end = html.indexOf("</code>", codeStart);
  if (codeStart === -1 || end === -1) return html;

  const inner = html.slice(codeStart + 1, end);
  const lines = inner.split("\n");
  const gutterWidth = String(lines.length).length;

  const numberedInner = lines
    .map((lineHtml, i) => {
      const n = String(i + 1).padStart(gutterWidth, " ");
      const safeLine = lineHtml.length ? lineHtml : " ";
      return `${GUTTER_HTML_START}${escapeSpaces(n)}${BASE_GUTTER_WIDTH}</span><span class="content">${safeLine}</span></span>`;
    })
    .join("\n");

  const before = html.slice(0, codeStart + 1);
  const after = html.slice(end);

  // merge class safely
  const merged = before.replace(/<code([^>]*)>/, (m, attrs) => {
    const hasClass = /class=/.test(attrs);
    if (!hasClass) return `<code class="has-line-numbers"${attrs}>`;

    return m.replace(/class="([^"]*)"/, (_: string, cls: string) => {
      const next = cls.includes("has-line-numbers") ? cls : `${cls} has-line-numbers`;
      return `class="${next}"`;
    });
  });

  return `${merged}${numberedInner}${after}`;
}

function escapeSpaces(s: string) {
  return s.replace(/ /g, "&nbsp;");
}

export function clearHighlightCache() {
  lru.clear();
}
