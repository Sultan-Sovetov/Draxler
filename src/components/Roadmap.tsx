"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const steps = [
    {
        id: 1,
        title: "Personal Consultation",
        desc: "Define your perfect setup. Select your design, finish, and fitment parameters. Once the specifications and agreement are finalized, we generate a precise technical 3D model for your approval.",
        image: "/roadmap/consultation.png"
    },
    {
        id: 2,
        title: "Technical Engineering",
        desc: "Before metal is cut, we verify everything. Our engineers create a detailed technical model based on your car’s brake and suspension data. You review and approve the exact geometry.",
        image: "/roadmap/design.jpg"
    },
    {
        id: 3,
        title: "Manufacturing",
        desc: "The approved design transforms into reality. From CNC machining to hand-finishing and powder coating, every stage concludes with a strict quality check.",
        image: "/roadmap/cnc_machining.jpg"
    },
    {
        id: 4,
        title: "Delivery",
        desc: "Worldwide insured shipping directly to you. Ready to install right out of the box.",
        image: "/roadmap/final.jpg"
    }
];

const fallbackImages: Record<number, string> = {
    1: "https://images.unsplash.com/photo-1623069793264-754d9760773d?q=80&w=2666&auto=format&fit=crop",
    2: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2670&auto=format&fit=crop",
    3: "https://images.unsplash.com/photo-1622396185802-959637c227df?q=80&w=2670&auto=format&fit=crop",
    4: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2670&auto=format&fit=crop",
};

const easeOutCirc: [number, number, number, number] = [0, 0.55, 0.45, 1];

export default function Roadmap() {
    const [activeId, setActiveId] = useState<number>(1);
    const [failedLocalImages, setFailedLocalImages] = useState<Record<number, boolean>>({});
    const [failedFallbackImages, setFailedFallbackImages] = useState<Record<number, boolean>>({});

    const activeStep = useMemo(() => {
        return steps.find((step) => step.id === activeId) ?? steps[0];
    }, [activeId]);

    const activeImageSrc = failedLocalImages[activeStep.id]
        ? (!failedFallbackImages[activeStep.id] ? fallbackImages[activeStep.id] : "/roadmap/Consultation.png")
        : activeStep.image;

    return (
        <section id="customization" className="relative h-[100svh] min-h-[800px] w-full overflow-hidden bg-[#0a0a0a] text-white">
            <div className="grid h-full w-full grid-rows-[40%_60%] md:grid-cols-[55%_45%] md:grid-rows-1">
                <div className="relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={`${activeStep.id}-${activeImageSrc}`}
                            src={activeImageSrc}
                            alt={activeStep.title}
                            className="absolute inset-0 h-full w-full object-cover"
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.04 }}
                            transition={{
                                opacity: { duration: 0.9, ease: easeOutCirc },
                                scale: { duration: 10, ease: easeOutCirc },
                            }}
                            onError={() => {
                                if (!failedLocalImages[activeStep.id]) {
                                    setFailedLocalImages((prev) => ({ ...prev, [activeStep.id]: true }));
                                    return;
                                }

                                setFailedFallbackImages((prev) => ({ ...prev, [activeStep.id]: true }));
                            }}
                        />
                    </AnimatePresence>

                    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-40 bg-gradient-to-r from-transparent via-[#0a0a0a99] to-[#0a0a0a] md:block" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent via-[#0a0a0a9a] to-[#0a0a0a] md:hidden" />
                </div>

                <div className="relative z-10 flex h-full flex-col justify-center px-6 py-8 sm:px-8 md:px-14 md:py-12 lg:px-20">
                    <div className="mb-6 md:mb-8">
                        <p className="text-[0.64rem] font-light uppercase tracking-[0.52em] text-white/52 sm:text-[0.68rem]">
                            Your Vision. Engineered.
                        </p>
                        <h2 className="mt-3 text-[clamp(1.7rem,2.8vw,3.1rem)] font-light tracking-[0.03em] text-white">
                            The Process
                        </h2>
                    </div>

                    <div className="relative border-l border-white/15 pl-5 sm:pl-6">
                        {steps.map((step) => {
                            const isActive = step.id === activeId;

                            return (
                                <motion.button
                                    key={step.id}
                                    layout
                                    onClick={() => setActiveId(step.id)}
                                    className="relative block w-full cursor-pointer py-4 text-left sm:py-5"
                                    transition={{ duration: 0.65, ease: easeOutCirc }}
                                >
                                    <motion.span
                                        layoutId="roadmap-active-indicator"
                                        className={`absolute -left-[1.43rem] top-7 h-2.5 w-2.5 rounded-full ${isActive ? "bg-white shadow-[0_0_16px_rgba(255,255,255,0.45)]" : "bg-white/30"}`}
                                        transition={{ duration: 0.6, ease: easeOutCirc }}
                                    />

                                    <motion.h3
                                        layout
                                        className={`uppercase tracking-[0.12em] transition-all duration-500 ${isActive ? "text-[clamp(1.05rem,1.8vw,1.7rem)] font-medium text-white opacity-100 blur-0" : "text-[clamp(0.92rem,1.2vw,1.15rem)] font-medium text-white/35 opacity-70 blur-[1px]"}`}
                                    >
                                        {step.title}
                                    </motion.h3>

                                    <AnimatePresence initial={false}>
                                        {isActive && (
                                            <motion.p
                                                key={`desc-${step.id}`}
                                                layout
                                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                                animate={{ height: "auto", opacity: 0.8, marginTop: 14 }}
                                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                                transition={{ duration: 0.62, ease: easeOutCirc }}
                                                className="max-w-[38ch] overflow-hidden pr-2 text-[0.92rem] leading-relaxed tracking-[0.01em] text-white/80 sm:text-[0.98rem]"
                                            >
                                                {step.desc}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
