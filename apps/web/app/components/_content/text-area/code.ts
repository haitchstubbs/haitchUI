const primary = `import { Textarea } from "@/components/ui/textarea"

export function TextareaDemo() {
  return <Textarea placeholder="Type your message here." />
}`;

export {primary};
const code = {primary} as const satisfies Record<string, string>;
export default code;
