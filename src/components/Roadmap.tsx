"use client";

import Image from "next/image";

const sections = [
    {
        num: "01",
        title: "Consultation & Engineering",
        desc: "Define your perfect setup — select design, finish, and fitment parameters. Our engineers create a precise 3D model based on your car's brake and suspension data. You review and approve the exact geometry before production begins.",
        image: "/roadmap/Design.jpg",
        bg: "white" as const,
        imagePosition: "right" as const,
    },
    {
        num: "02",
        title: "Manufacturing",
        desc: "The approved design transforms into reality. From forging and CNC machining to hand-finishing and powder coating, every stage concludes with a strict quality check.",
        image: "/roadmap/cnc_machining.jpg",
        bg: "black" as const,
        imagePosition: "left" as const,
    },
    {
        num: "03",
        title: "Delivery",
        desc: "Worldwide insured shipping directly to you. Each wheel is individually packaged and ready to install right out of the box.",
        image: "/roadmap/final_2.jpg",
        bg: "white" as const,
        imagePosition: "right" as const,
    },
];

export default function Roadmap() {
    return (
        <section id="customization">
            {sections.map((s) => (
                <div
                    key={s.num}
                    className={`rdm-block ${s.bg === "black" ? "rdm-block--dark" : "rdm-block--light"}`}
                >
                    <div className={`rdm-inner ${s.imagePosition === "left" ? "rdm-inner--img-left" : ""}`}>
                        <div className="rdm-text">
                            <span className="rdm-num">{s.num}</span>
                            <h2 className="rdm-title">{s.title}</h2>
                            <p className="rdm-desc">{s.desc}</p>
                        </div>
                        <div className="rdm-media">
                            <Image
                                src={s.image}
                                alt={s.title}
                                className="rdm-img"
                                fill
                                loading="lazy"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
}
