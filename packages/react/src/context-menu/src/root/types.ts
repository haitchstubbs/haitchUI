export type RootProps = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Radix-compatible: Root owns modality */
    modal?: boolean;
    children: React.ReactNode;
};
