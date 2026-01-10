import { notFound } from "next/navigation";
import { createReactComponentFromString } from "./createComponentFromString";

export async function resolveCodeTemplate(
  component: string
): Promise<{ code: string; Component: React.ComponentType<any> }> {
  const slug = component.toLowerCase();

  const resolveCode = (codeTemplates as Record<string, () => Promise<any>>)[slug];
  if (!resolveCode) notFound();

  const mod = await resolveCode();
  if (!mod?.default) throw new Error(`Template "${slug}" is missing a default export`);

  const code = mod.default as string;
  
  const Component = await createReactComponentFromString(code);

  return { code, Component };
}

const components = [
	"alert-dialog",
  "accordion",
	"code-block",
	"checkbox",
  "alert"
	// add more here
] as const;

const createTemplateRecord = <T extends readonly string[]>(arr: T) => {
	const record: Record<string, () => Promise<any>> = {};
	arr.forEach((component) => {
		record[component] = () => import(`../_code/${component}`);
	});
	return record;
};

export const codeTemplates = createTemplateRecord(components);

export type CodeTemplateSlug = keyof typeof codeTemplates;
