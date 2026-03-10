"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const galleryItems = [
    {
        src: "/gallery/any_style1.mp4",
        name: "Any Style",
        description: "From brushed satin to mirror-polished chrome, every finish is tailored to your vision. Dual-tone, custom paint, carbon accents — your wheels, your signature."
    },
    {
        src: "/gallery/any_design1.mp4",
        name: "Any Design",
        description: "Bring any concept to life. Our engineers translate sketches, references, or ideas into production-ready forged wheel designs with no compromise."
    },
    {
        src: "/gallery/any_wheels1.mp4",
        name: "Any Wheels",
        description: "Monoblock, multi-piece, beadlock, or concave—built for supercars, SUVs, trucks, and classics. Any size from 16\" to 26\" with perfect fitment guaranteed."
    },
];

export default function Gallery() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
    const [playingStates, setPlayingStates] = useState<boolean[]>([false, false, false]);
    const [visible, setVisible] = useState(false);

    // IntersectionObserver — only set video src when gallery enters viewport
    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "200px" }
        );

        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    const handleVideoEnter = (index: number) => {
        const video = videoRefs.current[index];
        if (!video) return;

        setPlayingStates((prev) => {
            const next = [...prev];
            next[index] = true;
            return next;
        });

        const playPromise = video.play();
        if (playPromise) {
            playPromise
                .then(() => {
                    // playing state is set optimistically on hover enter
                })
                .catch(() => {
                    setPlayingStates((prev) => {
                        const next = [...prev];
                        next[index] = false;
                        return next;
                    });
                    // no-op: browser may block play before user interaction in some edge cases
                });
        }
    };

    const handleVideoLeave = (index: number) => {
        const video = videoRefs.current[index];
        if (!video) return;
        video.pause();
        setPlayingStates((prev) => {
            const next = [...prev];
            next[index] = false;
            return next;
        });
    };

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const isMobile = window.matchMedia("(max-width: 900px)").matches;
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const shouldLighten = isMobile || prefersReducedMotion;
        const profileStart = performance.now();

        const ctx = gsap.context(() => {
            gsap.from(section.querySelector(".gallery-section-label"), {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 75%",
                    once: true,
                },
            });

            gsap.from(section.querySelector(".gallery-section-title"), {
                y: 40,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out",
                delay: 0.1,
                scrollTrigger: {
                    trigger: section,
                    start: "top 75%",
                    once: true,
                },
            });

            const pillars = section.querySelectorAll(".gallery-pillar");
            if (!pillars.length) return;

            if (shouldLighten) {
                gsap.fromTo(
                    pillars,
                    { opacity: 0, y: 18 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.65,
                        stagger: 0.08,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: section.querySelector(".gallery-container"),
                            start: "top 86%",
                            once: true,
                            invalidateOnRefresh: true,
                        },
                    }
                );
                return;
            }

            // Single batched trigger is cheaper than one trigger per pillar.
            gsap.fromTo(
                pillars,
                { clipPath: "inset(100% 0 0 0)" },
                {
                    clipPath: "inset(0% 0 0 0)",
                    duration: 1.1,
                    stagger: 0.1,
                    ease: "power3.inOut",
                    force3D: true,
                    scrollTrigger: {
                        trigger: section.querySelector(".gallery-container"),
                        start: "top 80%",
                        once: true,
                        invalidateOnRefresh: true,
                    },
                }
            );
        });

        if (process.env.NODE_ENV !== "production") {
            const setupMs = Math.round(performance.now() - profileStart);
            console.info(`[perf][Gallery] ScrollTrigger setup: ${setupMs}ms`);
        }

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="gallery-section" id="bespoke">
            <div className="gallery-section-label">LIMITLESS CUSTOMIZATION</div>
            <h2 className="gallery-section-title">From Concept To Reality</h2>

            {/* Stable outer wrapper — fixed height, overflow hidden.
                Hover-driven flex changes happen INSIDE this box,
                so Lenis / ScrollTrigger never see a layout shift. */}
            <div className="gallery-stable-wrapper">
                <div className="gallery-container">
                    {galleryItems.map((item, index) => (
                        <div
                            key={index}
                            className="gallery-pillar"
                            onMouseEnter={() => handleVideoEnter(index)}
                            onMouseLeave={() => handleVideoLeave(index)}
                        >
                            <video
                                ref={(el) => {
                                    videoRefs.current[index] = el;
                                }}
                                src={visible ? item.src : undefined}
                                className="gallery-pillar-media"
                                muted
                                loop
                                playsInline
                                preload="metadata"
                            />
                            <div className={`gallery-pillar-pause-dim${playingStates[index] ? ' is-playing' : ''}`} />
                            <div className="gallery-pillar-overlay">
                                <div className="gallery-pillar-copy">
                                    <div className="gallery-pillar-name">{item.name}</div>
                                    <p className="gallery-pillar-description">{item.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
