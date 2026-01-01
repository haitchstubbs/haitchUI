// lib/sidebar-state-cookie.ts
export const SIDEBAR_STATE_COOKIE = "haitch_sidebar_state";

export type SidebarCookieState = {
  v: 1;
  collapsed: boolean;
  expanded: string[]; // tree item ids
};

const DEFAULT_STATE: SidebarCookieState = {
  v: 1,
  collapsed: false,
  expanded: [],
};

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Cookies are small (~4KB). Keep this compact.
 * This stores plain JSON; if you want smaller, you can base64url encode later.
 */
export function parseSidebarCookie(raw: string | undefined): SidebarCookieState {
  if (!raw) return DEFAULT_STATE;

  const parsed = safeJsonParse<SidebarCookieState>(raw);
  if (!parsed || parsed.v !== 1) return DEFAULT_STATE;

  return {
    v: 1,
    collapsed: !!parsed.collapsed,
    expanded: Array.isArray(parsed.expanded) ? parsed.expanded.filter((x) => typeof x === "string") : [],
  };
}

export function serializeSidebarCookie(state: SidebarCookieState): string {
  // You may want to cap expanded to avoid cookie overflow
  const capped: SidebarCookieState = {
    v: 1,
    collapsed: state.collapsed,
    expanded: state.expanded.slice(0, 200),
  };

  return JSON.stringify(capped);
}
