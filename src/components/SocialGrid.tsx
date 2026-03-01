"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const smmImages = [
    { src: "/smm/brixton-forged-fde01-magnesium-monoblock-chevorlet-chevy-corvette-z06-8.jpg", name: "FDE-01 Magnesium" },
    { src: "/smm/brixton-forged-fde02-targa-sl-mclaren-750s-wheel-7.jpg", name: "FDE-02 Targa SL" },
    { src: "/smm/brixton-forged-pf13-carbon-dymag-carbon-fiber-chevorlet-camaro-ss-24.jpg", name: "PF-13 Carbon" },
    { src: "/smm/brixton-forged-pf6-brushed-ferrari-812-superfast-13.jpg", name: "PF-6 Brushed" },
    { src: "/smm/brixton-forged-wheels-pf14-rs-1-piece-monoblock-forged-wheels-center-lock-carbon-red-20.jpg", name: "PF-14 RS Monoblock" },
    { src: "/smm/https___brixtonforged.com_wp-content_uploads_2023_11_brixton-forged-tr20-carbon-brushed-classic-bronze-dymag-wheels-14.jpg", name: "TR-20 Bronze Dymag" },
    { src: "/smm/https___brixtonforged.com_wp-content_uploads_2023_11_brushed-forged-wheels-brixton-forged-raw-brushed-polished-77.jpg", name: "Raw Brushed Polished" },
    { src: "/smm/https___brixtonforged.com_wp-content_uploads_2024_01_Brixton-Forged-LX09-8-scaled.jpg", name: "LX-09 Forged" },
    { src: "/smm/https___brixtonforged.com_wp-content_uploads_2024_02_brixton-forged-tr19-monoblock-wheels-01.jpg", name: "TR-19 Monoblock" },
    { src: "/smm/https___brixtonforged.com_wp-content_uploads_2024_11_brixton-forged-nero-corsa-wheels-hidden-hills-racing-hh01-nc01-41.jpg", name: "Nero Corsa HH-01" },
    { src: "/smm/https___brixtonforged.com_wp-content_uploads_2024_12_brixton-forged-tr04-centerlock-lunar-white-09.jpg", name: "TR-04 Lunar White" },
    { src: "/smm/https___brixtonforged.com_wp-content_uploads_2025_09_brixton-forged-wheels-tr20-1-piece-monoblock-brushed-clear-bmw-g90-m5-15.jpg", name: "TR-20 Brushed Clear" },
];

export default function SocialGrid() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".social-grid-item", {
                y: 60,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out",
                stagger: 0.07,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                },
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="social-section" id="social">
            <div className="social-section-label">Our Creations</div>
            <h2 className="social-section-title">The Collection</h2>

            <div className="social-grid">
                {smmImages.map((item, index) => (
                    <div key={index} className="social-grid-item">
                        <Image
                            src={item.src}
                            alt={item.name}
                            width={900}
                            height={900}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            loading="lazy"
                            className="social-grid-image"
                        />
                        {/* Hover overlay */}
                        <div className="social-grid-overlay">
                            <span className="social-grid-name">{item.name}</span>
                            <span className="social-grid-btn">Details</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
