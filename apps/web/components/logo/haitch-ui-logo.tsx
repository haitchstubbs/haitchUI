import { SidebarTrigger } from "../ui/sidebar";

export function Logo() {
  return (
    <div
      className={[
        "inline-flex w-full items-center justify-between gap-2",
        "rounded-xl border-2 border-primary/70 bg-background",
        "p-1",
        // subtle wash (optional but controlled)
        "bg-linear-to-r from-background via-sidebar/60 to-muted/60",
        // inner stroke
        "shadow-sm",
      ].join(" ")}
    >
      <a
        href="/"
        className={[
          "inline-flex items-center",
          "h-11", // unify height with trigger
          "rounded-lg border border-border bg-background",
          "px-3",
          "no-underline",
          "transition-colors",
          "hover:bg-muted/40",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ].join(" ")}
      >
        <span className="text-2xl text-primary/70 tracking-tightest font-mono font-extrabold inline-flex">
          @haitch-<span className="text-foreground">ui</span>
        </span>
      </a>

      <SidebarTrigger
        className={[
          "h-11 w-11",
          "rounded-lg!",
          "border",
          "bg-background",
          "shrink-0",
          "transition-colors",
          "hover:bg-muted/40",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ].join(" ")}
      />
    </div>
  );
}
