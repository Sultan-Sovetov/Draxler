"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function ParallaxDivider({
    src = "/media/background.webp",
    compact = false,
    children,
}: {
    src?: string;
    compact?: boolean;
    children?: ReactNode;
}) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const section = sectionRef.current;
        const image = imageRef.current;
        if (!section || !image) return;

        const ctx = gsap.context(() => {
            // scrub: 0.5 smooths interpolation (vs true = 1:1 every frame)
            // force3D promotes to GPU composite layer
            gsap.fromTo(
                image,
                { yPercent: -15 },
                {
                    yPercent: 15,
                    ease: "none",
                    force3D: true,
                    scrollTrigger: {
                        trigger: section,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 0.5,
                    },
                }
            );
        });

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className={`parallax-divider ${compact ? "parallax-divider--compact" : ""}`}>
            <Image
                ref={imageRef}
                src={src}
                alt=""
                width={2400}
                height={1200}
                sizes="100vw"
                className="parallax-divider-img"
                loading="lazy"
                draggable={false}
            />
            <div className="parallax-divider-overlay" aria-hidden="true" />
            {children ? <div className="parallax-divider-content">{children}</div> : null}
        </section>
    );
}
