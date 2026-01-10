const primary = `import { Input } from "@/components/ui/input"

export function InputDemo() {
  return <Input type="email" placeholder="Email" />
}`;

export {primary};
const code = {primary} as const satisfies Record<string, string>;
export default code;
