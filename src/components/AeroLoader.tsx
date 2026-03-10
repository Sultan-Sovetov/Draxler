"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface AeroLoaderProps {
    /** Called when the loader exit animation completes (only for full-page loader) */
    onComplete?: () => void;
    /** If true, renders as a minimal inline loader (for Suspense fallbacks) */
    inline?: boolean;
}

export default function AeroLoader({ onComplete, inline = false }: AeroLoaderProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const BLINK_CYCLES = 3;
    const BLINK_DURATION = 2.2;

    useEffect(() => {
        if (inline) return;

        document.body.classList.add("aero-loader-active");

        return () => {
            document.body.classList.remove("aero-loader-active");
        };
    }, [inline]);

    useEffect(() => {
        if (!onComplete) return; // inline loaders don't auto-dismiss

        // Let blinking finish, then curtain-reveal out
        const visibleDuration = BLINK_CYCLES * BLINK_DURATION * 1000;
        const timer = setTimeout(() => {
            if (!containerRef.current) return;

            gsap.to(containerRef.current, {
                y: "-100%",
                duration: 1,
                ease: "power3.inOut",
                onComplete: () => {
                    onComplete();
                },
            });
        }, visibleDuration);

        return () => clearTimeout(timer);
    }, [onComplete]);

    const animationStyle = {
        animation: `aero-breathe ${BLINK_DURATION}s ease-in-out ${onComplete ? BLINK_CYCLES : "infinite"}`,
    };

    if (inline) {
        return (
            <div className="aero-loader-inline">
                <div className="aero-loader-text-sm" style={animationStyle}>
                    DRAXLER
                </div>
            </div>
        );
    }

    // Full-page loader (replaces old Preloader)
    return (
        <div ref={containerRef} className="aero-loader">
            <div className="aero-loader-text" style={animationStyle}>
                DRAXLER
            </div>
        </div>
    );
}
