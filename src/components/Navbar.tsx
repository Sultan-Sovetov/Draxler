"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
    // { label: "Bespoke", target: "bespoke" },
    { label: "Catalog", target: "catalog" },
    // { label: "Customization", target: "customization" },
    { label: "Configurator", target: "configurator" },
    { label: "Contact", target: "contact" },
];

export default function Navbar() {
    const navRef = useRef<HTMLElement>(null);
    const scrollRafRef = useRef<number | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [forceHidden, setForceHidden] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion || duration <= 0) {
            window.scrollTo(0, targetY);
            return;
        }

        if (scrollRafRef.current) {
            cancelAnimationFrame(scrollRafRef.current);
            scrollRafRef.current = null;
        }

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

            if (progress < 1) {
                scrollRafRef.current = requestAnimationFrame(stepFrame);
            } else {
                scrollRafRef.current = null;
            }
        };

        scrollRafRef.current = requestAnimationFrame(stepFrame);
    }, []);

    useEffect(() => {
        return () => {
            if (scrollRafRef.current) {
                cancelAnimationFrame(scrollRafRef.current);
            }
        };
    }, []);

    const scrollToTarget = useCallback((targetId: string) => {
        setMobileMenuOpen(false);

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
        setMobileMenuOpen(false);

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

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        const closeOnDesktop = () => {
            if (window.innerWidth > 768) {
                setMobileMenuOpen(false);
            }
        };

        window.addEventListener("resize", closeOnDesktop);
        return () => window.removeEventListener("resize", closeOnDesktop);
    }, []);

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

                <div className="navbar-right-slot">
                    <div className="navbar-theme-toggle-spacer" aria-hidden="true" />
                    <button
                        className={`navbar-menu-toggle ${mobileMenuOpen ? "is-open" : ""}`}
                        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={mobileMenuOpen}
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>
            </div>

            <div className={`navbar-mobile-menu ${mobileMenuOpen ? "is-open" : ""}`}>
                {NAV_ITEMS.map((item) => (
                    <button
                        key={`mobile-${item.target}`}
                        className={`navbar-mobile-link ${activeSection === item.target ? "navbar-link--section-active" : ""}`}
                        onClick={() => scrollToTarget(item.target)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </nav>
    );
}
