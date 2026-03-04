"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

export default function Footer() {
    const btnRef = useRef<HTMLButtonElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const btn = btnRef.current;
        const wrapper = wrapperRef.current;

        if (!btn || !wrapper) return;

        const xTo = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3.out" });
        const yTo = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3.out" });

        const handleMouseMove = (e: MouseEvent) => {
            const rect = wrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate distance from center
            const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            const maxDist = Math.max(rect.width, rect.height) / 2;

            if (dist < maxDist) {
                // Move button towards cursor (magnetic effect)
                const moveX = (x - centerX) * 0.3;
                const moveY = (y - centerY) * 0.3;
                xTo(moveX);
                yTo(moveY);
            } else {
                xTo(0);
                yTo(0);
            }
        };

        const handleMouseLeave = () => {
            xTo(0);
            yTo(0);
        };

        wrapper.addEventListener("mousemove", handleMouseMove);
        wrapper.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            wrapper.removeEventListener("mousemove", handleMouseMove);
            wrapper.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    return (
        <footer className="footer-section" id="contact">
            <div className="footer-divider" />

            <div className="footer-logo">DRAXLER</div>
            <div className="footer-tagline">Engineered For Excellence</div>

            <div ref={wrapperRef} className="magnetic-btn-wrapper">
                <button ref={btnRef} className="magnetic-btn">
                    Start Configuration
                </button>
            </div>

            <div className="footer-links">
                <Link href="/catalog" className="footer-link">Catalog</Link>
                <Link href="/#configurator" className="footer-link">Configurator</Link>
                <Link href="/#contact" className="footer-link">Contact</Link>
            </div>

            <div className="footer-socials">
                <a href="#" className="footer-social-icon footer-social-icon--instagram" aria-label="Instagram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                </a>
                <a href="#" className="footer-social-icon footer-social-icon--linkedin" aria-label="LinkedIn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect x="2" y="9" width="4" height="12" />
                        <circle cx="4" cy="4" r="2" />
                    </svg>
                </a>
                <a href="#" className="footer-social-icon footer-social-icon--whatsapp" aria-label="WhatsApp">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21l1.65-3.8A9 9 0 1 1 12 21a8.96 8.96 0 0 1-3.95-.92L3 21z" />
                        <path d="M9 10a.5.5 0 0 0 0 1a5 5 0 0 0 5 5a.5.5 0 0 0 1 0v-1.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v.5a3 3 0 0 1-3-3h.5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5H9z" />
                    </svg>
                </a>
                <a href="#" className="footer-social-icon footer-social-icon--wechat" aria-label="WeChat">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.5 5C6.36 5 3 7.88 3 11.42c0 1.98 1.06 3.75 2.73 4.92L5 20l3.24-1.63c.72.18 1.48.27 2.26.27 4.14 0 7.5-2.88 7.5-6.42S14.64 5 10.5 5z" />
                        <path d="M14.8 10.7c3.42 0 6.2 2.28 6.2 5.1 0 1.54-.84 2.93-2.16 3.86L19.2 23l-2.55-1.28c-.58.14-1.2.22-1.85.22-3.42 0-6.2-2.29-6.2-5.1 0-2.82 2.78-5.14 6.2-5.14z" />
                        <circle cx="8.1" cy="10.9" r="0.75" fill="currentColor" stroke="none" />
                        <circle cx="12.7" cy="10.9" r="0.75" fill="currentColor" stroke="none" />
                        <circle cx="13.1" cy="16.4" r="0.75" fill="currentColor" stroke="none" />
                        <circle cx="16.9" cy="16.4" r="0.75" fill="currentColor" stroke="none" />
                    </svg>
                </a>
            </div>

            <div className="footer-payments" aria-label="Payment systems">
                <span className="footer-payment-badge footer-payment-badge--visa">VISA</span>
                <span className="footer-payment-badge footer-payment-badge--mc">
                    <span className="footer-mc-circles" aria-hidden="true" />
                    <span>Mastercard</span>
                </span>
                <span className="footer-payment-badge footer-payment-badge--paypal">PayPal</span>
                <span className="footer-payment-badge footer-payment-badge--bybit">Bybit</span>
            </div>

            <div className="footer-copyright">
                © 2026 DRAXLER. ALL RIGHTS RESERVED.
            </div>
        </footer>
    );
}
