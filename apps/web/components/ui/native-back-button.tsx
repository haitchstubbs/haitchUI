"use client";

export function BackButton() {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="inline-flex items-center justify-center gap-2 rounded-(--radius-md) border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted/40 hover:text-foreground/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      Go back
    </button>
  );
}
