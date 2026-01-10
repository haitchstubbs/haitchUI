function requireAlias(code: string) {
  return code
    .replace(/(['"`])\[project]\//g, `$1../../../../`)
    .replace(/(['"`])@\//g, `$1../../../../`);
}

export { requireAlias };