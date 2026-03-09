"use client";

import { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroSlider from "./HeroSlider";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ── Pre-split characters as JSX (avoids runtime DOM manipulation) ── */
function CharLine({ text, className }: { text: string; className: string }) {
    const chars = useMemo(
        () =>
            text.split("").map((ch, i) => (
                <span
                    key={i}
                    className="hero-char"
                    style={ch === " " ? { width: "0.3em" } : undefined}
                >
                    {ch}
                </span>
            )),
        [text]
    );
    return <span className={`hero-char-wrap ${className}`}>{chars}</span>;
}

export default function Hero() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const scrollIndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const isSmallScreen = window.matchMedia("(max-width: 900px)").matches;
        const section = sectionRef.current;
        const video = videoRef.current;
        const content = contentRef.current;
        const title = titleRef.current;
        const subtitle = subtitleRef.current;
        const scrollInd = scrollIndRef.current;
        if (!section || !video || !content || !title) return;

        const ctx = gsap.context(() => {
            const enableScrollEffects = !prefersReducedMotion && !isSmallScreen;

            if (enableScrollEffects) {
                // Keep parallax subtle to reduce repaints on large images.
                gsap.to(video, {
                    yPercent: 16,
                    ease: "none",
                    force3D: true,
                    scrollTrigger: {
                        trigger: section,
                        start: "top top",
                        end: "bottom top",
                        scrub: 0.8,
                    },
                });

                // Avoid scale during scroll to prevent expensive texture resampling.
                gsap.to(content, {
                    opacity: 0,
                    y: -70,
                    ease: "none",
                    force3D: true,
                    scrollTrigger: {
                        trigger: section,
                        start: "10% top",
                        end: "72% top",
                        scrub: 1.2,
                    },
                });
            }

            // ───── TYPEWRITER CHARACTER STAGGER ─────
            // Characters are pre-rendered in JSX — just animate them via ref
            const allChars = title.querySelectorAll(".hero-char");
            if (allChars.length) {
                gsap.set(allChars, { opacity: 0, y: 20 });
                gsap.to(allChars, {
                    opacity: 1,
                    y: 0,
                    duration: 0.06,
                    stagger: 0.04,
                    ease: "power2.out",
                    delay: 3.0,
                    force3D: true,
                    onComplete() {
                        // Remove will-change after animation to free GPU layers
                        allChars.forEach((el) => {
                            (el as HTMLElement).style.willChange = "auto";
                        });
                    },
                });
            }

            // Subtitle fade-in (after typewriter) — use ref instead of class selector
            if (subtitle) {
                gsap.from(subtitle, {
                    y: 30,
                    opacity: 0,
                    duration: 1,
                    ease: "power3.out",
                    delay: 3.55,
                });
            }

            if (scrollInd) {
                gsap.from(scrollInd, {
                    opacity: 0,
                    duration: 1,
                    delay: 4.2,
                });
            }
        });

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="hero-section" id="hero">
            <div ref={videoRef} className="hero-video-wrapper">
                <HeroSlider />
            </div>

            <div ref={contentRef} className="hero-content">
                <h1 ref={titleRef} className="hero-title">
                    <CharLine text="FORGED" className="hero-title-line" />
                    <CharLine text="PERFECTION" className="hero-title-gold" />
                </h1>
                <p ref={subtitleRef} className="hero-subtitle">
                    Aerospace-grade forged wheels for the extraordinary
                </p>
            </div>

            <div ref={scrollIndRef} className="hero-scroll-indicator">
                <span>Scroll</span>
                <div className="scroll-line" />
            </div>
        </section>
    );
}
