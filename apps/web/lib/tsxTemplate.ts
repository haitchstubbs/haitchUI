export type TsxTag = (
  strings: TemplateStringsArray,
  ...exprs: unknown[]
) => string;

const escapeSnippet = (v: unknown) =>
  String(v)
    .replaceAll("`", "\\`")
    .replaceAll("${", "\\${");

export const tsx: TsxTag = (strings, ...exprs) => {
  let out = strings[0] ?? "";

  // remove exactly one leading newline
  if (out.startsWith("\n")) {
    out = out.slice(1);
  }

  for (let i = 0; i < exprs.length; i++) {
    out += escapeSnippet(exprs[i]) + (strings[i + 1] ?? "");
  }

  return out;
};
