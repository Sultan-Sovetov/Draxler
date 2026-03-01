"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

const NAV_ITEMS = [
    { label: "Bespoke", target: "bespoke" },
    { label: "Catalog", target: "catalog" },
    { label: "Customization", target: "customization" },
    { label: "Configurator", target: "configurator" },
    { label: "Contact", target: "contact" },
];

export default function Navbar() {
    const navRef = useRef<HTMLElement>(null);
    const { theme, toggle } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [forceHidden, setForceHidden] = useState(false);
    const [activeSection, setActiveSection] = useState<string>("");
    const lastScrollY = useRef(0);
    const pathname = usePathname();
    const isHome = pathname === "/";

    // Listen for configurator-active event to force-hide navbar
    useEffect(() => {
        const handler = (e: Event) => {
            setForceHidden((e as CustomEvent).detail?.active === true);
        };
        window.addEventListener("configurator-active", handler);
        return () => window.removeEventListener("configurator-active", handler);
    }, []);

    const smoothScrollTo = useCallback((targetY: number, duration = 1300) => {
        const startY = window.scrollY || window.pageYOffset;
        const distance = targetY - startY;
        const startTime = performance.now();

        const easeInOutCubic = (time: number) =>
            time < 0.5 ? 4 * time * time * time : 1 - Math.pow(-2 * time + 2, 3) / 2;

        const stepFrame = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeInOutCubic(progress);
            window.scrollTo(0, startY + distance * eased);

            if (progress < 1) requestAnimationFrame(stepFrame);
        };

        requestAnimationFrame(stepFrame);
    }, []);

    const scrollToTarget = useCallback((targetId: string) => {
        /* "Catalog" always navigates to /catalog page */
        if (targetId === "catalog") {
            window.location.href = "/catalog";
            return;
        }

        if (!isHome) {
            window.location.href = `/#${targetId}`;
            return;
        }

        const target = document.getElementById(targetId);
        if (!target) return;

        const offset = target.getBoundingClientRect().top + window.scrollY - 56;
        smoothScrollTo(offset, 1300);
    }, [isHome, smoothScrollTo]);

    const handleLogoClick = useCallback(() => {
        if (!isHome) {
            window.location.href = "/";
            return;
        }
        smoothScrollTo(0, 1200);
    }, [isHome, smoothScrollTo]);

    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;
            const delta = y - lastScrollY.current;

            // Show frosted glass after scrolling 80px
            setScrolled(y > 80);

            // Hide on scroll down (> 10px delta), show on scroll up
            if (delta > 10 && y > 200) {
                setHidden(true);
            } else if (delta < -5) {
                setHidden(false);
            }

            lastScrollY.current = y;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (!isHome) return;

        const observedSections = NAV_ITEMS
            .map((item) => document.getElementById(item.target))
            .filter((section): section is HTMLElement => Boolean(section));

        if (!observedSections.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visible[0]?.target?.id) {
                    setActiveSection(visible[0].target.id);
                }
            },
            {
                threshold: [0.2, 0.35, 0.5, 0.65],
                rootMargin: "-20% 0px -35% 0px",
            }
        );

        observedSections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, [isHome]);

    return (
        <nav
            ref={navRef}
            className={`navbar ${(scrolled || !isHome) ? "navbar--glass" : ""} ${(hidden || forceHidden) ? "navbar--hidden" : ""}`}
        >
            <div className="navbar-inner">
                <button className="navbar-logo navbar-logo-btn" onClick={handleLogoClick}>DRAXLER</button>

                <div className="navbar-links">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.target}
                            className={`navbar-link navbar-link-btn ${activeSection === item.target ? "navbar-link--section-active" : ""}`}
                            onClick={() => scrollToTarget(item.target)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <button
                    className="navbar-theme-toggle"
                    onClick={toggle}
                    aria-label="Toggle theme"
                >
                    {theme === "dark" ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" />
                            <line x1="21" y1="12" x2="23" y2="12" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    )}
                </button>
            </div>
        </nav>
    );
}
