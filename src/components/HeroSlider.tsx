"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HERO_IMAGES = [
    "/hero/backhero1.jpg",
    "/hero/backhero4.jpg",
    "/hero/backhero5.jpg",
    "/hero/backhero6.jpg",
    "/hero/backhero7.jpg",
    "/hero/backhero8.jpg",
    "/hero/backhero9.jpg",
];

const AUTOPLAY_MS = 3000;
const FADE_MS = 1800;
const IMAGE_COUNT = HERO_IMAGES.length;

export default function HeroSlider() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [previousIndex, setPreviousIndex] = useState<number | null>(null);
    const autoplayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearFadeTimer = useCallback(() => {
        if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    }, []);

    const queuePreviousCleanup = useCallback(() => {
        if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = setTimeout(() => {
            setPreviousIndex(null);
        }, FADE_MS);
    }, []);

    const changeSlide = useCallback((nextIndex: number) => {
        setActiveIndex((prev) => {
            if (prev === nextIndex) return prev;
            setPreviousIndex(prev);
            return nextIndex;
        });
    }, []);

    const goTo = useCallback((nextIndex: number) => {
        changeSlide(nextIndex);
    }, [changeSlide]);

    const goNext = useCallback(() => {
        setActiveIndex((prev) => {
            const next = (prev + 1) % IMAGE_COUNT;
            setPreviousIndex(prev);
            return next;
        });
    }, []);

    const goPrev = useCallback(() => {
        setActiveIndex((prev) => {
            const next = (prev - 1 + IMAGE_COUNT) % IMAGE_COUNT;
            setPreviousIndex(prev);
            return next;
        });
    }, []);

    useEffect(() => {
        if (autoplayRef.current) clearTimeout(autoplayRef.current);
        autoplayRef.current = setTimeout(() => {
            setActiveIndex((prev) => {
                const next = (prev + 1) % IMAGE_COUNT;
                setPreviousIndex(prev);
                return next;
            });
        }, AUTOPLAY_MS);

        return () => {
            if (autoplayRef.current) clearTimeout(autoplayRef.current);
        };
    }, [activeIndex]);

    useEffect(() => {
        if (previousIndex === null) return;
        queuePreviousCleanup();
    }, [previousIndex, queuePreviousCleanup]);

    useEffect(() => {
        return clearFadeTimer;
    }, [clearFadeTimer]);

    useEffect(() => {
        // Preload only the next two slides to avoid decoding all hero images at once.
        const preloadNearby = (index: number) => {
            for (let step = 1; step <= 2; step += 1) {
                const nextSrc = HERO_IMAGES[(index + step) % IMAGE_COUNT];
                const img = new Image();
                img.decoding = "async";
                img.src = nextSrc;
            }
        };

        const timeoutId = globalThis.setTimeout(() => preloadNearby(activeIndex), 250);
        return () => globalThis.clearTimeout(timeoutId);
    }, [activeIndex]);

    return (
        <div className="hero-slider" aria-label="Hero background slider">
            {HERO_IMAGES.map((src, index) => {
                const isActive = index === activeIndex;
                const isLeaving = index === previousIndex;
                const slideClass = `hero-slide ${isActive ? "is-active" : ""} ${isLeaving ? "is-leaving" : ""}`;

                return (
                    <div
                        key={src}
                        className={slideClass.trim()}
                        aria-hidden={!isActive}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={src}
                            alt="DRAXLER Hero"
                            className="hero-slide-image"
                            loading={index === 0 ? "eager" : "lazy"}
                            fetchPriority={index === 0 ? "high" : "auto"}
                            decoding="async"
                            draggable={false}
                        />
                    </div>
                );
            })}

            <div className="hero-slider-bottom-gradient" />

            <div className="hero-slider-arrows" aria-hidden>
                <button
                    type="button"
                    className="hero-slider-arrow hero-slider-arrow--left"
                    onClick={goPrev}
                    aria-label="Previous slide"
                >
                    <ChevronLeft size={22} strokeWidth={1.5} />
                </button>
                <button
                    type="button"
                    className="hero-slider-arrow hero-slider-arrow--right"
                    onClick={goNext}
                    aria-label="Next slide"
                >
                    <ChevronRight size={22} strokeWidth={1.5} />
                </button>
            </div>

            <div className="hero-slider-controls" role="tablist" aria-label="Hero slides">
                {HERO_IMAGES.map((_, index) => (
                    <button
                        key={index}
                        type="button"
                        className={`hero-slider-progress ${activeIndex === index ? "is-active" : ""}`}
                        onClick={() => goTo(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        aria-current={activeIndex === index}
                    />
                ))}
            </div>
        </div>
    );
}
