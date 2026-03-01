"use client";

import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";

export default function LenisProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            smoothWheel: true,
        });

        lenisRef.current = lenis;

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // Pause/resume Lenis when configurator is active
        const handler = (e: Event) => {
            const active = (e as CustomEvent).detail?.active === true;
            if (active) {
                lenis.stop();
            } else {
                lenis.start();
            }
        };
        window.addEventListener("configurator-active", handler);

        return () => {
            window.removeEventListener("configurator-active", handler);
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}
