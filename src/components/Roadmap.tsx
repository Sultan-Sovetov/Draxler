"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

type StepActionType = "catalog" | "quote" | "configurator";

interface StepAction {
    label: string;
    variant: "primary" | "secondary";
    action: StepActionType;
}

interface RoadmapStep {
    number: string;
    title: string;
    desc: string;
    image: string;
    actions: StepAction[];
}

const steps: RoadmapStep[] = [
    {
        number: "01",
        title: "Consultation & Design",
        desc: "Start by selecting a model from our Signature Collection, providing your own sketches, or collaborating with our designers to create a unique masterpiece from scratch.",
        image: "/roadmap/Consultation.png",
        actions: [
            { label: "Explore Catalog", variant: "primary", action: "catalog" },
            { label: "Request Quote", variant: "secondary", action: "quote" },
        ],
    },
    {
        number: "02",
        title: "Engineering & FEA",
        desc: "Safety is paramount. Every design undergoes Finite Element Analysis (FEA). We optimize the 3D model for your specific vehicle parameters to guarantee performance.",
        image: "/roadmap/Design.jpg",
        actions: [{ label: "Request Quote", variant: "secondary", action: "quote" }],
    },
    {
        number: "03",
        title: "Interactive 3D Configuration",
        desc: "Immerse yourself in our real-time 3D studio. Select your vehicle, experiment with finishes, and inspect the wheel geometry from every angle.",
        image: "/roadmap/3D%20modeling.png",
        actions: [{ label: "Explore Configurator", variant: "primary", action: "configurator" }],
    },
    {
        number: "04",
        title: "Precision CNC Machining",
        desc: "Precision in motion. Our multi-axis CNC mills carve the design with micron-level tolerance, transforming the raw forged billet into a work of engineering art.",
        image: "/roadmap/CNC%20Machining.jpg",
        actions: [{ label: "Request Quote", variant: "secondary", action: "quote" }],
    },
    {
        number: "05",
        title: "Hand Finishing",
        desc: "The final touch. From hand-brushing to powder coating, our artisans apply the finish with meticulous care. Every wheel undergoes a rigorous quality control inspection.",
        image: "/roadmap/Final.jpg",
        actions: [{ label: "Request Quote", variant: "secondary", action: "quote" }],
    },
];

export default function Roadmap() {
    const router = useRouter();
    const sectionRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const timelineBarRef = useRef<HTMLDivElement>(null);
    const lineFillRef = useRef<HTMLDivElement>(null);
    const [activeStep, setActiveStep] = useState<number | null>(null);
    const timelineRef = useRef<gsap.core.Timeline | null>(null);
    const hasAutoOpenedRef = useRef(false);
    const rafIdRef = useRef<number>(0);

    const smoothScrollTo = useCallback((targetY: number, duration = 1300) => {
        // Cancel any previous RAF-based scroll
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);

        const startY = window.scrollY;
        const distance = targetY - startY;
        const startTime = performance.now();

        const easeInOutCubic = (t: number) =>
            t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        const step = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            window.scrollTo(0, startY + distance * easeInOutCubic(progress));
            if (progress < 1) {
                rafIdRef.current = requestAnimationFrame(step);
            }
        };

        rafIdRef.current = requestAnimationFrame(step);
    }, []);

    const handleAction = useCallback((action: StepActionType) => {
        if (action === "catalog" || action === "quote") {
            router.push("/catalog");
            return;
        }

        const configurator = document.querySelector(".car-configurator-section") as HTMLElement | null;
        if (!configurator) return;

        const target = configurator.getBoundingClientRect().top + window.scrollY;
        smoothScrollTo(target, 1400);
    }, [router, smoothScrollTo]);

    // Consolidated entrance animation — single ScrollTrigger + auto-open via onEnter
    useEffect(() => {
        const section = sectionRef.current;
        const header = headerRef.current;
        const lineFill = lineFillRef.current;
        const timelineBar = timelineBarRef.current;
        if (!section || !header || !lineFill || !timelineBar) return;

        const ctx = gsap.context(() => {
            // Single entrance timeline with one ScrollTrigger
            const entranceTl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: "top 75%",
                    once: true,
                    onEnter: () => {
                        // Replace separate IntersectionObserver — auto-open first step
                        if (!hasAutoOpenedRef.current) {
                            hasAutoOpenedRef.current = true;
                            // Delay so entrance animation plays first
                            gsap.delayedCall(0.9, () => setActiveStep(0));
                        }
                    },
                },
            });

            // Header fade in
            entranceTl.from(header, {
                y: 40,
                opacity: 0,
                duration: 1,
                ease: "power3.out",
                force3D: true,
            });

            // Nodes stagger (queried once inside context)
            const nodes = gsap.utils.toArray<HTMLElement>(".rm-node");
            entranceTl.from(nodes, {
                y: 30,
                opacity: 0,
                duration: 0.7,
                ease: "power3.out",
                stagger: 0.12,
                force3D: true,
            }, "-=0.6");

            // Line fill
            entranceTl.from(lineFill, {
                scaleX: 0,
                duration: 1.2,
                ease: "power2.inOut",
            }, "-=0.8");
        });

        return () => ctx.revert();
    }, []);

    // Clean up RAF on unmount
    useEffect(() => {
        return () => {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        };
    }, []);

    const handleStepClick = useCallback((index: number) => {
        if (timelineRef.current) {
            timelineRef.current.kill();
        }

        if (activeStep === index) {
            const tl = gsap.timeline();
            tl.to(contentRef.current?.querySelector(".rm-reveal") || ".rm-reveal", {
                opacity: 0,
                y: 30,
                duration: 0.4,
                ease: "power2.in",
                force3D: true,
                onComplete: () => setActiveStep(null),
            });
            timelineRef.current = tl;
            return;
        }

        if (activeStep !== null) {
            const tl = gsap.timeline();
            tl.to(contentRef.current?.querySelector(".rm-reveal") || ".rm-reveal", {
                opacity: 0,
                y: 20,
                duration: 0.3,
                ease: "power2.in",
                force3D: true,
            });
            tl.call(() => setActiveStep(index));
            timelineRef.current = tl;
        } else {
            setActiveStep(index);
        }
    }, [activeStep]);

    // Animate content in when activeStep changes — scoped to contentRef
    useEffect(() => {
        if (activeStep === null || !contentRef.current) return;

        const scope = contentRef.current;
        const reveal = scope.querySelector(".rm-reveal");
        const image = scope.querySelector(".rm-reveal-image");
        const label = scope.querySelector(".rm-reveal-label");
        const heading = scope.querySelector(".rm-reveal-heading");
        const desc = scope.querySelector(".rm-reveal-desc");
        const btns = scope.querySelectorAll(".rm-reveal-btn");

        if (!reveal) return;

        // Set initial state
        gsap.set(reveal, { opacity: 0, y: 40 });
        if (image) gsap.set(image, { scale: 1.15, opacity: 0 });
        if (label) gsap.set(label, { x: -20, opacity: 0 });
        if (heading) gsap.set(heading, { y: 20, opacity: 0 });
        if (desc) gsap.set(desc, { y: 20, opacity: 0 });
        if (btns.length) gsap.set(btns, { y: 15, opacity: 0 });

        const tl = gsap.timeline();

        tl.to(reveal, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            force3D: true,
        });

        if (image) {
            tl.to(image, {
                scale: 1,
                opacity: 1,
                duration: 0.8,
                ease: "power2.out",
                force3D: true,
            }, "-=0.4");
        }

        if (label) {
            tl.to(label, {
                x: 0,
                opacity: 1,
                duration: 0.5,
                ease: "power3.out",
                force3D: true,
            }, "-=0.5");
        }

        if (heading) {
            tl.to(heading, {
                y: 0,
                opacity: 1,
                duration: 0.6,
                ease: "power3.out",
                force3D: true,
            }, "-=0.35");
        }

        if (desc) {
            tl.to(desc, {
                y: 0,
                opacity: 1,
                duration: 0.6,
                ease: "power3.out",
                force3D: true,
            }, "-=0.3");
        }

        if (btns.length) {
            tl.to(btns, {
                y: 0,
                opacity: 1,
                duration: 0.5,
                ease: "power3.out",
                stagger: 0.08,
                force3D: true,
            }, "-=0.3");
        }

        timelineRef.current = tl;
    }, [activeStep]);

    const active = activeStep !== null ? steps[activeStep] : null;

    return (
        <section ref={sectionRef} className="rm-section" id="customization">
            <div className="rm-inner">
                {/* Header */}
                <div ref={headerRef} className="roadmap-header">
                    <div className="rm-label">YOUR VISION. ENGINEERED.</div>
                    <h2 className="rm-title">The Process</h2>
                </div>

                {/* Timeline bar */}
                <div ref={timelineBarRef} className="rm-timeline">
                    <div className="rm-line">
                        <div ref={lineFillRef} className="rm-line-fill" />
                    </div>
                    {steps.map((step, i) => (
                        <button
                            key={i}
                            className={`rm-node ${activeStep === i ? "rm-node--active" : ""}`}
                            onClick={() => handleStepClick(i)}
                        >
                            <div className="rm-dot" />
                            <span className="rm-number">{step.number}</span>
                            <span className="rm-step-title">{step.title}</span>
                        </button>
                    ))}
                </div>

                {/* Reveal content area */}
                <div ref={contentRef} className="rm-content-area">
                    {active && (
                        <div className="rm-reveal" key={activeStep}>
                            <div className="rm-reveal-grid">
                                {/* Image side */}
                                <div className="rm-reveal-image-wrap">
                                    <Image
                                        src={active.image}
                                        alt={active.title}
                                        width={1200}
                                        height={900}
                                        sizes="(max-width: 900px) 100vw, 50vw"
                                        className="rm-reveal-image"
                                        loading="lazy"
                                    />
                                </div>

                                {/* Text side */}
                                <div className="rm-reveal-text">
                                    <div className="rm-reveal-label">
                                        Step {active.number}
                                    </div>
                                    <h3 className="rm-reveal-heading">{active.title}</h3>
                                    <p className="rm-reveal-desc">{active.desc}</p>
                                    <div className="rm-reveal-actions">
                                        {active.actions.map((action) => (
                                            <button
                                                key={action.label}
                                                className={`rm-reveal-btn rm-reveal-btn--${action.variant}`}
                                                onClick={() => handleAction(action.action)}
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
