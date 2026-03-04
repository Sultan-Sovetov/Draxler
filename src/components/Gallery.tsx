"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const galleryItems = [
    {
        src: "/gallery/any%20style.mp4",
        name: "Any Style",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur feugiat, tellus non suscipit ultrices, massa risus posuere neque, in efficitur sem lorem sed velit."
    },
    {
        src: "/gallery/any%20design.mp4",
        name: "Any Design",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur feugiat, tellus non suscipit ultrices, massa risus posuere neque, in efficitur sem lorem sed velit."
    },
    {
        src: "/gallery/any%20wheels.mp4",
        name: "Any Wheels",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur feugiat, tellus non suscipit ultrices, massa risus posuere neque, in efficitur sem lorem sed velit."
    },
];

export default function Gallery() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
    const [playingStates, setPlayingStates] = useState<boolean[]>([false, false, false]);

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
        const ctx = gsap.context(() => {
            gsap.from(".gallery-section-label", {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 75%",
                },
            });

            gsap.from(".gallery-section-title", {
                y: 40,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out",
                delay: 0.1,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 75%",
                },
            });

            // Clip-path mask reveal with stagger
            const pillars = document.querySelectorAll(".gallery-pillar");
            pillars.forEach((pillar, i) => {
                gsap.fromTo(
                    pillar,
                    { clipPath: "inset(100% 0 0 0)" },
                    {
                        clipPath: "inset(0% 0 0 0)",
                        duration: 1.2,
                        ease: "power3.inOut",
                        delay: i * 0.1,
                        scrollTrigger: {
                            trigger: ".gallery-container",
                            start: "top 80%",
                        },
                    }
                );
            });
        });

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
                                src={item.src}
                                className="gallery-pillar-media"
                                muted
                                loop
                                playsInline
                                preload="metadata"
                            />
                            {!playingStates[index] && (
                                <div className="gallery-pillar-pause-dim" />
                            )}
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
