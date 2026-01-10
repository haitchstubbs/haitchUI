import { highlight } from "@haitch/react-code-block/server";
import { resolveCodeTemplate } from "./resolve-code-template";
import { isNextNotFoundError } from "./isNextNotFoundError";

export async function getPageContent({ params }: { params: Promise<{ component: string }> }) {
    try {
        const { component } = await params;

        const { code } = await resolveCodeTemplate(component); // may throw notFound()

        const highlightedCode = await highlight(code, "tsx");
        return { code, highlightedCode, error: null };
    } catch (error) {
        // ✅ Let Next handle actual 404s (and render not-found.tsx)
        if (isNextNotFoundError(error)) throw error;

        console.error("Error loading code template:", error);
        return { code: "// Error loading code template", highlightedCode: "", error };
    } finally {
        console.log("Finished loading code template");
    }
}