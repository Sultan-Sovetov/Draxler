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
    { id: "graphite-alumochrome", label: "Graphite Alumochrome", hex: "#3a3a3a", type: "satin" },
    { id: "polished-silver",      label: "Polished Silver",      hex: "#c0c0c0", type: "polished" },
    { id: "satin-black",          label: "Satin Black",          hex: "#1a1a1a", type: "satin" },
    { id: "brushed-titanium",     label: "Brushed Titanium",     hex: "#7a7a7a", type: "brushed" },
    { id: "satin-bronze",         label: "Satin Bronze",         hex: "#8b6f47", type: "satin" },
    { id: "polished-gold",        label: "Polished Gold",        hex: "#c9a84c", type: "polished" },
    { id: "gunmetal",             label: "Gunmetal",             hex: "#4a4a4a", type: "satin" },
    { id: "matte-white",          label: "Matte White",          hex: "#e8e8e8", type: "satin" },
    { id: "cherry-red",           label: "Cherry Red",           hex: "#8b2020", type: "polished" },
    { id: "midnight-blue",        label: "Midnight Blue",        hex: "#1e293b", type: "satin" },
    { id: "teal",                 label: "Teal",                 hex: "#2a7a7a", type: "polished" },
    { id: "rose-gold",            label: "Rose Gold",            hex: "#b76e79", type: "brushed" },
];

const GALLERY_IMAGES = [
    "/catalog/bentley2.jpg",
    "/catalog/bentley1.jpg",
    "/catalog/bentley3.jpg",
    "/catalog/porshce1.jpg",
    "/catalog/porshce2.jpg",
] as const;

const GALLERY_SLUGS = new Set(["drx-102", "drx-202", "drx-302"]);
const FOOTER_SLUGS  = new Set(["drx-101", "drx-102", "drx-201", "drx-202", "drx-301", "drx-302", "drx-303", "drx-291", "drx-292", "drx-293", "drx-294", "drx-295", "drx-296", "drx-297", "drx-298", "drx-299", "drx-391", "drx-393", "drx-394", "drx-395", "drx-397"]);

/* ── Build 3D sphere CSS layers per finish ── */
function sphereStyle(finish: MetalFinish): React.CSSProperties {
    const { hex, type } = finish;

    const reflectionOpacity = type === "polished" ? 0.7 : type === "satin" ? 0.35 : 0.2;
    const reflectionBlur    = type === "polished" ? 0   : type === "satin" ? 4     : 8;
    const highlightSize     = type === "polished" ? "40% 40%" : type === "satin" ? "55% 55%" : "70% 70%";

    const brushedOverlay =
        type === "brushed"
            ? "repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px)"
            : "";

    const darkenedHex = adjustBrightness(hex, -40);

    return {
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        background: [
            brushedOverlay,
            `radial-gradient(ellipse ${highlightSize} at 35% 25%, rgba(255,255,255,${reflectionOpacity}) 0%, transparent 60%)`,
            `radial-gradient(ellipse 80% 80% at 50% 50%, ${hex} 0%, ${darkenedHex} 100%)`,
        ]
            .filter(Boolean)
            .join(", "),
        boxShadow: `
            inset -8px -10px 24px rgba(0,0,0,0.6),
            inset 4px 6px 16px rgba(255,255,255,${reflectionOpacity * 0.4}),
            0 8px 32px rgba(0,0,0,0.5)
        `,
        filter: reflectionBlur ? `blur(${reflectionBlur * 0.15}px)` : "none",
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
    const [activeGalleryImage, setActiveGalleryImage] = useState<string | null>(null);
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

    useEffect(() => {
        if (!activeGalleryImage) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setActiveGalleryImage(null);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [activeGalleryImage]);

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
    const showGallery = GALLERY_SLUGS.has(product.slug);
    const showFooter  = FOOTER_SLUGS.has(product.slug);

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
                            {product.sizes.map((size, i) => (
                                <span key={size}>
                                    <span className="pdp-size">{size}</span>
                                    {i < product.sizes.length - 1 && (
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
                                Color: <strong>{selectedFinish.label}</strong>
                            </span>
                        </div>

                        {/* Material Sample — 3D Sphere */}
                        <div className="pdp-sphere-wrap">
                            <div className="pdp-sphere" style={sphereStyle(selectedFinish)} />
                        </div>

                        {/* Swatch Grid */}
                        <div className="pdp-swatch-grid">
                            {METAL_FINISHES.map((f) => (
                                <button
                                    key={f.id}
                                    className={`pdp-swatch ${selectedFinish.id === f.id ? "is-active" : ""}`}
                                    aria-label={f.label}
                                    onClick={() => setSelectedFinish(f)}
                                >
                                    <span className="pdp-swatch-inner" style={sphereStyle(f)} />
                                </button>
                            ))}
                        </div>
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
                            href={`mailto:info@draxler.com?subject=Fitment%20Advice%20—%20${encodeURIComponent(product.name)}&body=Finish:%20${encodeURIComponent(selectedFinish.label)}`}
                            className="pdp-btn-secondary"
                        >
                            REQUEST FITMENT ADVICE
                        </a>
                    </div>
                </div>
            </div>

            {showGallery && (
                <section className="pdp-gallery-section" aria-label="Gallery">
                    <h2 className="pdp-gallery-title">G A L L E R Y</h2>
                    <div className="pdp-gallery-grid">
                        {GALLERY_IMAGES.map((imageSrc, index) => (
                            <button
                                key={imageSrc}
                                type="button"
                                className={`pdp-gallery-item pdp-gallery-item--${index}`}
                                onClick={() => setActiveGalleryImage(imageSrc)}
                                aria-label={`Open gallery image ${index + 1}`}
                            >
                                <Image
                                    src={imageSrc}
                                    alt={`${product.name} gallery ${index + 1}`}
                                    width={1200}
                                    height={900}
                                    sizes="(max-width: 1024px) 100vw, 33vw"
                                    className="pdp-gallery-image"
                                    draggable={false}
                                />
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {activeGalleryImage && (
                <div
                    className="pdp-gallery-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Gallery image preview"
                    onClick={() => setActiveGalleryImage(null)}
                >
                    <button
                        type="button"
                        className="pdp-gallery-close"
                        onClick={() => setActiveGalleryImage(null)}
                        aria-label="Close image preview"
                    >
                        ×
                    </button>
                    <div
                        className="pdp-gallery-modal-inner"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <Image
                            src={activeGalleryImage}
                            alt={`${product.name} close-up view`}
                            width={1800}
                            height={1200}
                            sizes="90vw"
                            className="pdp-gallery-modal-image"
                        />
                    </div>
                </div>
            )}

            {showFooter && <Footer />}
        </>
    );
}
