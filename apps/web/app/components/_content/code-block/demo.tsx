import { highlight } from "@haitch-ui/react-code-block/server";
import * as Client from "./ui";
import code from "./code";

async function Primary() {
	const highlightedCode = await highlight(code.primary, "tsx");

	return <Client.Primary code={code.primary} highlightedHtml={highlightedCode} />;
}

export const Demo = {
	Primary: Primary
} as const;

export default Demo;
