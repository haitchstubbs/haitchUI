"use client";

import * as React from "react";
import { codeTemplates } from "../../[component]/_util/resolve-code-template";

export default function CodeTemplateRenderer({
  templateId,
  props,
}: {
  templateId: string;
  props: Record<string, unknown>;
}) {
  const Component = codeTemplates[templateId];

  if (!Component) return <div>Unknown template: {templateId}</div>;

  return <Component {...props} />;
}