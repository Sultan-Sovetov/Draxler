"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
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

    // Breathing animation variants for the text
    const breathe = {
        animate: {
            opacity: [0.14, 1, 0.14],
            transition: {
                duration: BLINK_DURATION,
                times: [0, 0.5, 1],
                ease: "easeInOut" as const,
                repeat: onComplete ? BLINK_CYCLES - 1 : Infinity,
            },
        },
    };

    if (inline) {
        // Compact version for <Suspense> fallbacks inside canvases etc.
        return (
            <div className="aero-loader-inline">
                <motion.div
                    className="aero-loader-text-sm"
                    variants={breathe}
                    animate="animate"
                >
                    DRAXLER
                </motion.div>
            </div>
        );
    }

    // Full-page loader (replaces old Preloader)
    return (
        <div ref={containerRef} className="aero-loader">
            <motion.div
                className="aero-loader-text"
                variants={breathe}
                animate="animate"
            >
                DRAXLER
            </motion.div>
        </div>
    );
}
