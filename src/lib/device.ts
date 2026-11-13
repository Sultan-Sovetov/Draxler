"use client";

import { useEffect, useState } from "react";

/**
 * "Phone" = narrow viewport AND a touch-first device.
 * A narrow desktop browser window keeps the full experience; tablets (≥768px) too.
 * Mirrored in CSS as `@media (max-width: 767px) and (hover: none) and (pointer: coarse)`.
 */
export const PHONE_QUERY = "(max-width: 767px) and (hover: none) and (pointer: coarse)";

export function isPhone() {
    return typeof window !== "undefined" && window.matchMedia(PHONE_QUERY).matches;
}

/** `null` until mounted (SSR renders the desktop markup), then true/false. */
export function useIsPhone(): boolean | null {
    const [phone, setPhone] = useState<boolean | null>(null);
    useEffect(() => {
        const mq = window.matchMedia(PHONE_QUERY);
        const update = () => setPhone(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);
    return phone;
}
