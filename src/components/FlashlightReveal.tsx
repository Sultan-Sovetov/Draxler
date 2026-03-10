"use client";

import { useEffect, useRef, useCallback, CSSProperties } from "react";
// Pure CSS mask + vanilla JS — no GSAP needed


export default function FlashlightReveal() {
    const containerRef = useRef<HTMLDivElement>(null);
    const maskRef = useRef<HTMLDivElement>(null);
    const rectRef = useRef<DOMRect | null>(null);
    const rafRef = useRef(0);

    // Cache bounding rect, recalculate on resize
    const updateRect = useCallback(() => {
        if (containerRef.current) {
            rectRef.current = containerRef.current.getBoundingClientRect();
        }
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
                const rect = rectRef.current;
                if (!rect || !maskRef.current) return;
                maskRef.current.style.setProperty("--mx", `${e.clientX - rect.left}px`);
                maskRef.current.style.setProperty("--my", `${e.clientY - rect.top}px`);
            });
        };

        const container = containerRef.current;
        if (container) {
            updateRect();
            container.addEventListener("mousemove", handleMouseMove, { passive: true });
            window.addEventListener("resize", updateRect, { passive: true });
        }

        return () => {
            cancelAnimationFrame(rafRef.current);
            if (container) {
                container.removeEventListener("mousemove", handleMouseMove);
            }
            window.removeEventListener("resize", updateRect);
        };
    }, [updateRect]);

    return (
        <section ref={containerRef} className="flashlight-section">
            <div className="flashlight-texture" />
            <div
                ref={maskRef}
                className="flashlight-mask"
                style={{
                    '--mx': '50%',
                    '--my': '50%'
                } as CSSProperties}
            />

            <div className="flashlight-content">
                <h2 className="flashlight-title">Precision At Every Grain</h2>
                <p className="flashlight-hint">Hover to Inspect Surface Quality</p>
            </div>
        </section>
    );
}
