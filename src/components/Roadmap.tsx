"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";

const sections = [
    {
        num: "01",
        title: "Consultation & Engineering",
        desc: "Define your perfect setup — select design, finish, and fitment parameters. Our engineers create a precise 3D model based on your car's brake and suspension data. You review and approve the exact geometry before production begins. Every concept is engineered around your exact chassis so the final look stays bold without compromising clearance, balance, or daily usability.",
        image: "/roadmap/Design.jpg",
        bg: "white" as const,
        imagePosition: "right" as const,
    },
    {
        num: "02",
        title: "Manufacturing",
        desc: "The approved design transforms into reality. From forging and CNC machining to hand-finishing and powder coating, every stage concludes with a strict quality check. Critical dimensions and runout are measured at multiple checkpoints to guarantee true rotation at speed. Before shipment, each set is visually audited and torque-fit tested so the wheels arrive installation-ready.",
        image: "/roadmap/cnc_machining.jpg",
        bg: "black" as const,
        imagePosition: "left" as const,
    },
    {
        num: "03",
        title: "Delivery",
        desc: "Worldwide insured shipping directly to you. Each wheel is individually packaged and ready to install right out of the box. You receive full tracking visibility from dispatch to final handoff. Our support team stays available through delivery day to coordinate timing and ensure a smooth arrival.",
        image: "/roadmap/final_2.jpg",
        bg: "white" as const,
        imagePosition: "right" as const,
    },
];

function RoadmapBlock({ s }: { s: (typeof sections)[number] }) {
    const blockRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [overlayActive, setOverlayActive] = useState(false);

    useEffect(() => {
        const el = blockRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
            { threshold: 0.15 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const handleImageClick = useCallback(() => setOverlayActive((prev) => !prev), []);

    return (
        <div
            ref={blockRef}
            className={`rdm-block ${s.bg === "black" ? "rdm-block--dark" : "rdm-block--light"}`}
        >
            <div className={`rdm-inner ${s.imagePosition === "left" ? "rdm-inner--img-left" : ""}`}>
                <div className="rdm-text">
                    <span className={`rdm-num rdm-reveal rdm-reveal-d1${visible ? " rdm-reveal--visible" : ""}`}>{s.num}</span>
                    <h2 className={`rdm-title rdm-reveal rdm-reveal-d2${visible ? " rdm-reveal--visible" : ""}`}>{s.title}</h2>
                    <p className={`rdm-desc rdm-reveal rdm-reveal-d3${visible ? " rdm-reveal--visible" : ""}`}>{s.desc}</p>
                    <Link href="/catalog" className={`rdm-process-link rdm-reveal rdm-reveal-d3${visible ? " rdm-reveal--visible" : ""}`}>
                        View Catalog
                    </Link>
                </div>
                <div
                    className={`rdm-media rdm-reveal-img${visible ? " rdm-reveal-img--visible" : ""}`}
                    onClick={handleImageClick}
                >
                    <Image
                        src={s.image}
                        alt={s.title}
                        className="rdm-img"
                        fill
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className={`rdm-overlay${overlayActive ? " rdm-overlay--active" : ""}`} />
                </div>
            </div>
        </div>
    );
}

export default function Roadmap() {
    return (
        <section id="customization">
            {sections.map((s) => (
                <RoadmapBlock key={s.num} s={s} />
            ))}
        </section>
    );
}
