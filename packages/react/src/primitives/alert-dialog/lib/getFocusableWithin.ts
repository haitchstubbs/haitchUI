export function getFocusableWithin(root: HTMLElement): HTMLElement[] {
    const candidates = root.querySelectorAll<HTMLElement>(
        [
            'button:not([disabled])',
            '[href]',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
        ].join(",")
    );

    return Array.from(candidates).filter((el) => {
        if (el.hasAttribute("disabled")) return false;
        if (el.getAttribute("aria-hidden") === "true") return false;
        if ((el as any).hidden) return false;
        return true;
    });
}