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
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const lenis = new Lenis({
            duration: 0.95,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            smoothWheel: !prefersReducedMotion,
            syncTouch: false,
        });

        lenisRef.current = lenis;
        let rafId = 0;
        let running = true;

        function raf(time: number) {
            if (!running) return;
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);

        const handleVisibilityChange = () => {
            if (document.hidden) {
                running = false;
                if (rafId) cancelAnimationFrame(rafId);
                lenis.stop();
                return;
            }

            running = true;
            lenis.start();
            rafId = requestAnimationFrame(raf);
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

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
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            running = false;
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}
