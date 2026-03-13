"use client";

import type { CSSProperties } from "react";
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
    const sectionStyle = {
        backgroundImage: `url("${src}")`,
    } as CSSProperties;

    return (
        <section
            className={`parallax-divider ${compact ? "parallax-divider--compact" : ""} ${
                reduced ? "parallax-divider--reduced" : ""
            }`}
            style={sectionStyle}
        >
            <div className="parallax-divider-overlay" aria-hidden="true" />
            {children ? <div className="parallax-divider-content">{children}</div> : null}
        </section>
    );
}
