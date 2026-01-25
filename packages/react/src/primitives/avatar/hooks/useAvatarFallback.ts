import { useEffect, useState } from "react";
import type { AvatarLoadingStatus } from "../types";

export function useAvatarFallbackVisible(
    loadingStatus: AvatarLoadingStatus,
    delayMs?: number
) {
    const shouldShow = loadingStatus !== "loaded";

    const [visible, setVisible] = useState(() => {
        if (!shouldShow) return false;
        return delayMs == null;
    });

    useEffect(() => {
        if (!shouldShow) {
            setVisible(false);
            return;
        }

        if (delayMs == null) {
            setVisible(true);
            return;
        }

        setVisible(false);
        const t = window.setTimeout(() => setVisible(true), delayMs);
        return () => window.clearTimeout(t);
    }, [shouldShow, delayMs]);

    return shouldShow && visible;
}
