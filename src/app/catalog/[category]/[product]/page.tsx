"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { getProductBySlug } from "@/lib/catalog-data";
import Footer from "@/components/Footer";

/* ═══════════════════════════════════════════ */
/*         METAL FINISH DEFINITIONS            */
/* ═══════════════════════════════════════════ */
type FinishType = "polished" | "satin" | "brushed";

interface MetalFinish {
    id: string;
    label: string;
    hex: string;
    type: FinishType;
}

const METAL_FINISHES: MetalFinish[] = [
    { id: "gloss-black", label: "Gloss Black", hex: "#151515", type: "polished" },
    { id: "silver", label: "Silver", hex: "#97a0aa", type: "polished" },
    { id: "gunmetal", label: "Gunmetal", hex: "#555d67", type: "satin" },
    { id: "burgundy", label: "Burgundy", hex: "#6f1f2e", type: "polished" },
    { id: "white", label: "White", hex: "#f2f2f2", type: "satin" },
];
const AVAILABLE_SIZES = ["16\"", "17\"", "18\"", "19\"", "20\"", "21\"", "22\"", "23\"", "24\"", "25\"", "26\""];

/* ── Build 3D sphere CSS layers per finish ── */
function sphereStyle(finish: MetalFinish): React.CSSProperties {
    const { hex, type } = finish;

    const reflectionOpacity = type === "polished" ? 0.82 : type === "satin" ? 0.5 : 0.34;
    const highlightSize = type === "polished" ? "34% 34%" : type === "satin" ? "46% 46%" : "58% 58%";

    const brushedOverlay =
        type === "brushed"
            ? "repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)"
            : "";

    const darkenedHex = adjustBrightness(hex, -40);
    const deeperHex = adjustBrightness(hex, -76);
    const edgeHighlightHex = adjustBrightness(hex, 26);

    return {
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        background: [
            brushedOverlay,
            "radial-gradient(circle at 24% 20%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.2) 22%, transparent 40%)",
            "radial-gradient(circle at 78% 78%, rgba(255,255,255,0.22) 0%, transparent 36%)",
            `radial-gradient(ellipse ${highlightSize} at 35% 25%, rgba(255,255,255,${reflectionOpacity}) 0%, transparent 60%)`,
            `radial-gradient(ellipse 96% 96% at 50% 50%, ${edgeHighlightHex} 0%, ${hex} 48%, ${darkenedHex} 78%, ${deeperHex} 100%)`,
        ]
            .filter(Boolean)
            .join(", "),
        boxShadow: `
            inset -10px -12px 26px rgba(0,0,0,0.62),
            inset 8px 10px 18px rgba(255,255,255,${reflectionOpacity * 0.48}),
            inset 0 0 0 1px rgba(255,255,255,0.08),
            0 10px 32px rgba(0,0,0,0.42)
        `,
        filter: "none",
        transition: "all 0.5s cubic-bezier(0.33, 1, 0.68, 1)",
    };
}

function adjustBrightness(hex: string, amount: number): string {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
    const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/* ═══════════════════════════════════════════ */
/*             PRODUCT DETAIL PAGE             */
/* ═══════════════════════════════════════════ */
export default function ProductDetailPage() {
    const params = useParams();
    const categorySlug = params.category as string;
    const productSlug  = params.product as string;
    const result = getProductBySlug(categorySlug, productSlug);

    const [selectedFinish, setSelectedFinish] = useState<MetalFinish>(METAL_FINISHES[0]);
    const [customColor, setCustomColor] = useState("#2f2f2f");
    const [usingCustomColor, setUsingCustomColor] = useState(false);
    const heroRef = useRef<HTMLDivElement>(null);

    /* ── Entrance animations ── */
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ delay: 0.15 });

            tl.from(".pdp-hero-series", {
                opacity: 0, y: 20, duration: 0.6, ease: "power3.out",
            });

            tl.from(".pdp-breadcrumbs", {
                opacity: 0, y: 12, duration: 0.5, ease: "power3.out",
            }, "-=0.3");

            tl.from(".pdp-image-stack img", {
                opacity: 0, y: 60, duration: 0.8, stagger: 0.15, ease: "power3.out",
            }, "-=0.25");

            tl.from(".pdp-sticky-col > *", {
                opacity: 0, y: 30, duration: 0.6, stagger: 0.1, ease: "power3.out",
            }, "-=0.5");
        });

        return () => ctx.revert();
    }, [productSlug]);

    /* ── Hero parallax on scroll ── */
    useEffect(() => {
        const hero = heroRef.current;
        if (!hero) return;

        const img = hero.querySelector(".pdp-hero-bg") as HTMLElement | null;
        if (!img) return;

        const onScroll = () => {
            const offset = Math.min(window.scrollY * 0.35, 120);
            img.style.transform = `translateY(${offset}px)`;
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* ── 404 guard ── */
    if (!result) {
        return (
            <div className="catalog-not-found">
                <h1>Product Not Found</h1>
                <Link href="/catalog">Back to Catalog</Link>
            </div>
        );
    }

    const { product, category } = result;
    const previewFinish: MetalFinish = usingCustomColor
        ? { id: "custom", label: "Custom", hex: customColor, type: "polished" }
        : selectedFinish;

    return (
        <>
            {/* ===== TASK 1 — Slim Cinematic Header ===== */}
            <section ref={heroRef} className="pdp-hero" aria-label={category.name}>
                <div className="pdp-hero-bg" />
                <div className="pdp-hero-gradient" />
                <span className="pdp-hero-series">{category.displayTitle}</span>
            </section>

            {/* ===== Breadcrumbs ===== */}
            <nav className="pdp-breadcrumbs" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span className="pdp-bc-sep">/</span>
                <Link href="/catalog">Catalog</Link>
                <span className="pdp-bc-sep">/</span>
                <Link href={`/catalog/${categorySlug}`}>{category.name}</Link>
                <span className="pdp-bc-sep">/</span>
                <span className="pdp-bc-active">{product.name}</span>
            </nav>

            {/* ===== TASK 2 — Split Screen Layout ===== */}
            <div className="pdp-split">
                {/* Left — Stacked Product Images */}
                <div className="pdp-image-stack">
                    <div className="pdp-img-wrap">
                        <Image
                            src={product.image}
                            alt={`${product.name} — Front`}
                            width={1400}
                            height={1400}
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            draggable={false}
                        />
                    </div>
                    <div className="pdp-img-wrap">
                        <Image
                            src={product.hoverImage}
                            alt={`${product.name} — Angle`}
                            width={1400}
                            height={1400}
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            draggable={false}
                        />
                    </div>
                </div>

                {/* Right — Sticky Details & Configurator */}
                <div className="pdp-sticky-col">
                    {/* Title + Price */}
                    <div className="pdp-info-block">
                        <h1 className="pdp-title">{product.name}</h1>
                        <p className="pdp-price">{product.price} / set</p>
                    </div>

                    {/* Description */}
                    <div className="pdp-info-block">
                        <p className="pdp-desc">{product.description}</p>
                    </div>

                    {/* Available Sizes */}
                    <div className="pdp-info-block">
                        <div className="pdp-sizes-label">Available Sizes</div>
                        <div className="pdp-sizes-list">
                            {AVAILABLE_SIZES.map((size, i) => (
                                <span key={size}>
                                    <span className="pdp-size">{size}</span>
                                    {i < AVAILABLE_SIZES.length - 1 && (
                                        <span className="pdp-size-sep">|</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* ===== TASK 3 — Metal Configurator ===== */}
                    <div className="pdp-info-block pdp-configurator">
                        <div className="pdp-cfg-header">
                            <span className="pdp-cfg-label">Finish</span>
                            <span className="pdp-cfg-value">
                                Color: <strong>{previewFinish.hex.toUpperCase()}</strong>
                            </span>
                        </div>

                        {/* Material Sample — 3D Sphere */}
                        <div className="pdp-sphere-wrap">
                            <div className={`pdp-sphere ${usingCustomColor ? "is-custom" : ""}`} style={sphereStyle(previewFinish)} />
                        </div>

                        {/* Swatch Grid */}
                        <div className="pdp-swatch-grid">
                            {METAL_FINISHES.map((f) => (
                                <button
                                    key={f.id}
                                    className={`pdp-swatch ${!usingCustomColor && selectedFinish.id === f.id ? "is-active" : ""}`}
                                    aria-label={f.label}
                                    onClick={() => {
                                        setSelectedFinish(f);
                                        setUsingCustomColor(false);
                                    }}
                                >
                                    <span className="pdp-swatch-inner" style={sphereStyle(f)} />
                                </button>
                            ))}
                            <button
                                className={`pdp-swatch pdp-swatch--custom ${usingCustomColor ? "is-active" : ""}`}
                                aria-label="Custom color"
                                onClick={() => setUsingCustomColor(true)}
                            >
                                <span className="pdp-swatch-inner pdp-swatch-inner--custom" style={sphereStyle({ id: "custom", label: "Custom", hex: customColor, type: "polished" })} />
                            </button>
                        </div>

                        {usingCustomColor && (
                            <label className="pdp-custom-color-input-wrap" htmlFor="pdp-custom-color">
                                <span className="pdp-custom-color-label">Custom HEX</span>
                                <input
                                    id="pdp-custom-color"
                                    type="color"
                                    value={customColor}
                                    onChange={(event) => setCustomColor(event.target.value)}
                                    className="pdp-custom-color-input"
                                />
                            </label>
                        )}
                    </div>

                    {/* ===== TASK 4 — Purchase Actions ===== */}
                    <div className="pdp-actions">
                        <button
                            className="pdp-btn-primary"
                            onClick={() => {
                                const el = document.getElementById("contact");
                                if (el) el.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            ORDER CONFIGURATION
                        </button>
                        <a
                            href={`mailto:info@draxler.com?subject=Fitment%20Advice%20—%20${encodeURIComponent(product.name)}&body=Finish:%20${encodeURIComponent(previewFinish.label)}%0AColor:%20${encodeURIComponent(previewFinish.hex.toUpperCase())}`}
                            className="pdp-btn-secondary"
                        >
                            REQUEST FITMENT ADVICE
                        </a>
                    </div>
                </div>
            </div>

            <div className="pdp-page-footer">
                <Footer />
            </div>
        </>
    );
}
