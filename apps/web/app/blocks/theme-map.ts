export function ThemeMap(theme: string) {
  // Normalize a couple of common mismatches/aliases
  const t = theme
    .trim()
    .toLowerCase()
    .replace("synthwave84", "synthwave-84")
    .replace("synthwave74", "synthwave-84"); // typo/alias -> real shiki id :contentReference[oaicite:3]{index=3}

  // Real Shiki bundled theme IDs only :contentReference[oaicite:4]{index=4}
  const map: Record<string, string> = {
    // app base
    dark: "github-dark",
    light: "github-light",

    // your “neutral” palettes are basically GitHub-like neutrals
    "neutral-dark": "github-dark",
    "neutral-light": "github-light",

    // your “stone” palettes: warm-ish minimal UI -> min themes
    "stone-dark": "min-dark",
    "stone-light": "min-light",

    // explicitly supported
    dracula: "dracula",
    nord: "nord",
    "one-dark-pro": "one-dark-pro",
    "gruvbox-material-dark": "gruvbox-material-dark",

    // your token file uses tokyo-night-storm, but Shiki bundles tokyo-night (no storm id)
    "tokyo-night-storm": "tokyo-night",

    // synthwave
    "synthwave-84": "synthwave-84",

    // brutalist / monochrome: go all-in on Shiki’s Vitesse Black
    "brutalist-black": "vitesse-black",

    // “brutalist dark + brand accents”: keep it minimal but not pitch black
    "duckdb-brutalist-dark": "vitesse-dark",
    "motherduck-brutalist-dark": "vitesse-dark",

    // cyberpunk-ish: neon/purple vibe without being full synthwave
    "cyberpunk-dark": "material-theme-palenight",
    "cyberpunk-light": "material-theme-lighter",
  };

  return map[t] ?? "github-dark";
}
