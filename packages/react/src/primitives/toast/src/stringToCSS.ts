export function css(
  strings: TemplateStringsArray,
  ...values: Array<string | number | null | undefined>
): string {
  let out = ""

  for (let i = 0; i < strings.length; i++) {
    out += strings[i]
    if (i < values.length) out += String(values[i] ?? "")
  }

  return out.trim().replace(/\s+/g, " ")
}