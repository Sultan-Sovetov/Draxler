"use client";

import Image from "next/image";
import type { ReactNode } from "react";

export default function ParallaxDivider({
    src = "/media/background.webp",
    compact = false,
    reduced = false,
    children,
}: {
    src?: string;
    compact?: boolean;
    reduced?: boolean;
    children?: ReactNode;
}) {
    return (
        <section
            className={`parallax-divider ${compact ? "parallax-divider--compact" : ""} ${
                reduced ? "parallax-divider--reduced" : ""
            }`}
        >
            <Image
                src={src}
                alt=""
                width={2400}
                height={1200}
                sizes="100vw"
                className="parallax-divider-img"
                loading="lazy"
                draggable={false}
            />
            <div className="parallax-divider-overlay" aria-hidden="true" />
            {children ? <div className="parallax-divider-content">{children}</div> : null}
        </section>
    );
}
