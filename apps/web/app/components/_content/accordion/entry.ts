export const loadDocs = () => import("./docs.mdx").then((m) => m.default);
export const loadDemo = () => import("./demo").then((m) => m.default.Primary);
export const loadCode = () => import("./code").then((m) => m.code);

export type EntryModule = {
  loadDocs: () => Promise<React.ComponentType<any>>;
  loadDemo?: () => Promise<React.ComponentType<any>>;
  loadCode?: () => Promise<string>;
};
