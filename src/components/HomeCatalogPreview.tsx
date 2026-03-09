"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const previewItems = [
    {
        id: 1,
        label: "NEW ARRIVALS",
        title: "Sport",
        subtitle: "Forged Sport Series",
        slug: "sport",
        image: "sport.jpg",
    },
    {
        id: 2,
        label: "NEW ARRIVALS",
        title: "Luxury",
        subtitle: "Forged Luxury Series",
        slug: "vip",
        image: "luxury.jpg",
    },
    {
        id: 3,
        label: "NEW ARRIVALS",
        title: "Off-Road",
        subtitle: "Forged Off-Road Series",
        slug: "offroad",
        image: "offroad.jpg",
    },
];

export default function HomeCatalogPreview() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current || !gridRef.current) return;

        const isMobile = window.matchMedia("(max-width: 900px)").matches;
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const shouldLighten = isMobile || prefersReducedMotion;

        const ctx = gsap.context(() => {
            const cards = gridRef.current!.querySelectorAll(".home-catalog-card");
            gsap.fromTo(
                cards,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: shouldLighten ? 0.5 : 0.7,
                    stagger: shouldLighten ? 0.06 : 0.1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 80%",
                        once: true,
                        invalidateOnRefresh: true,
                    },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="home-catalog-section" id="catalog">
            <div ref={gridRef} className="home-catalog-grid">
                {previewItems.map((item) => (
                    <Link
                        key={item.id}
                        href={`/catalog#${item.slug}`}
                        className="home-catalog-card"
                    >
                        <Image
                            src={`/catalog/${item.image}`}
                            alt={item.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            loading="lazy"
                            className="home-catalog-image"
                        />
                        <div className="home-catalog-overlay" />
                        <div className="home-catalog-content">
                            <span className="home-catalog-label">{item.label}</span>
                            <h3 className="home-catalog-title">{item.title}</h3>
                            <p className="home-catalog-subtitle">{item.subtitle}</p>
                            <span className="home-catalog-shop-btn">Shop</span>
                        </div>
                    </Link>
                ))}
            </div>
            <div className="home-catalog-heading">
                E X P L O R E &nbsp; C A T A L O G &nbsp; & &nbsp; P R O C E S S
            </div>
        </section>
    );
}
