// apps/web/types/mdx.d.ts
// Provide a simple MDX module declaration so dynamic imports like import("./docs.mdx") are typed.

declare module "*.mdx" {
  import type React from "react";
  const MDXComponent: React.ComponentType<any>;
  export default MDXComponent;
}
