"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, LoaderCircle, Check } from "lucide-react";
import gsap from "gsap";
import { getProductBySlug } from "@/lib/catalog-data";
import { supabase } from "@/lib/supabase";
import { DBProduct } from "@/app/catalog/page";
import Footer from "@/components/Footer";

/* ═══════════════════════════════════════════ */
/*           CATEGORY HERO BACKGROUNDS         */
/* ═══════════════════════════════════════════ */
const categoryHeroImage: Record<string, string> = {
    vip: "/catalog/luxury phantom.jpg",
    offroad: "/catalog/offroad ford.jpg",
    sport: "/catalog/sport porsche.jpg",
};

/* ═══════════════════════════════════════════ */
/*              SEO ACCORDION DATA             */
/* ═══════════════════════════════════════════ */
interface SeoSection {
    title: string;
    content: React.ReactNode;
    defaultOpen?: boolean;
}

const SEO_SECTIONS: SeoSection[] = [
    {
        title: "DESCRIPTION",
        defaultOpen: true,
        content: (
            <>
                <h4>Exclusive Custom Forged Wheels Tailored to Your Vehicle</h4>
                <p>
                    Any wheel design presented can be custom-made for your car in any size and color
                    configuration. To ensure a 100% perfect fitment before manufacturing begins, we
                    provide precise 3D wheel renderings based on your vehicle&apos;s exact dimensions and
                    specifications.
                </p>
                <p className="seo-sub-label">Available Wheel Configurations:</p>
                <ul>
                    <li>Monoblock wheels</li>
                    <li>2-piece and 3-piece modular wheels</li>
                    <li>Beadlock wheels for drag racing and off-road applications</li>
                </ul>
            </>
        ),
    },
    {
        title: "PREMIUM MATERIALS & ENGINEERING SPECIFICATIONS",
        content: (
            <>
                <p>
                    At DRAXLER, we engineer and manufacture premium custom forged wheels with an
                    uncompromising attention to detail.
                </p>
                <ul>
                    <li>
                        <strong>Aerospace-Grade 6061-T6 Forged Aluminum:</strong> Our forged billet
                        blanks are produced using high-pressure forging (up to 12,000 tons). This
                        refines the grain structure, minimizes porosity, and delivers an exceptional
                        strength-to-weight ratio.
                    </li>
                    <li>
                        <strong>Forged Magnesium Option:</strong> For hardcore motorsport
                        applications, wheels can be manufactured from ultra-lightweight forged
                        magnesium to significantly reduce unsprung mass and improve track
                        performance.
                    </li>
                    <li>
                        <strong>Any Size &amp; Fitment (15&quot; to 30&quot;):</strong> Fully
                        customizable diameters, widths, offsets (ET), center bores (DIA), bolt
                        patterns (PCD), and centerlock setups. We calculate perfect geometry for
                        both staggered and square setups-ranging from OEM-spec to flush, mild, or
                        aggressive fitments.
                    </li>
                    <li>
                        <strong>Maximum Compatibility:</strong> Engineered for seamless integration
                        with OEM brake systems and Big Brake Kits (BBK), with precise caliper
                        clearances calculated for every application. Fully compatible with factory OE
                        TPMS sensors and factory lug hardware.
                    </li>
                    <li>
                        <strong>Strict Quality Control &amp; Global Standards:</strong> Our
                        manufacturing processes and testing align with leading JWL and VIA compliance
                        benchmarks. Every wheel undergoes rigorous checks for radial/lateral runout,
                        roundness, balance, and finish consistency.
                    </li>
                </ul>
            </>
        ),
    },
    {
        title: "CUSTOM DESIGNS & PREMIUM FINISHES (OPTIONS)",
        content: (
            <>
                <p>
                    Every finish undergoes a multi-stage surface preparation process, followed by
                    premium clear-coat or tinted-clear applications for maximum depth and long-term
                    corrosion resistance.
                </p>
                <ol>
                    <li>
                        <strong>Standard Finishes:</strong> Brushed, polished, satin or gloss clear,
                        precision-machined or milled accents, dual-tone, and advanced chrome options
                        (including gold, black, and electroplated chrome).
                    </li>
                    <li>
                        <strong>Exclusive Upgrades (Available at extra cost):</strong>
                        <ul>
                            <li>Wheel widths above 11.5J</li>
                            <li>Carbon fiber barrels and aerodynamic covers (aero-disc)</li>
                            <li>Titanium lug nuts</li>
                            <li>Weight-saving pocket cut-outs and drilled spokes</li>
                            <li>
                                Floating spinning center caps and custom alloy caps with a milled
                                logo
                            </li>
                            <li>Racing-spec knurled bead seats to prevent tire slippage</li>
                        </ul>
                    </li>
                </ol>
            </>
        ),
    },
    {
        title: "WARRANTY & CUSTOMER SERVICE",
        content: (
            <ul>
                <li>LIFETIME Structural Warranty</li>
                <li>Guaranteed perfect fitment for your specific vehicle</li>
                <li>Excellent wheel balance and absolute roundness guaranteed</li>
                <li>Exceptional, personalized after-sales support</li>
            </ul>
        ),
    },
    {
        title: "SECURE PAYMENT & WORLDWIDE SHIPPING",
        content: (
            <>
                <p className="seo-sub-label">Secured Payment Methods:</p>
                <ul>
                    <li>PayPal (+4.4% fee) | Visa / Mastercard / American Express (via PayPal)</li>
                    <li>Bank Wire Transfer (SWIFT)</li>
                    <li>Cryptocurrency (USDT, BTC, ETH)</li>
                    <li>Alipay / WeChat</li>
                </ul>
                <p className="seo-sub-label">Global Shipping Options:</p>
                <ul>
                    <li>Express Delivery: Fast shipping via DHL, UPS, TNT, or FedEx.</li>
                    <li>
                        AIR Shipping (10–15 days): Customs clearance included. Available for the
                        USA, UK, Australia, EU countries, and select Asian destinations.
                    </li>
                    <li>
                        SEA Shipping (25–45 days): Customs clearance included. Contact us to verify
                        availability for your country.
                    </li>
                    <li>Delivery is available directly to your local international airport or seaport.</li>
                </ul>
            </>
        ),
    },
];

function SeoAccordion({ section }: { section: SeoSection }) {
    const [open, setOpen] = useState(!!section.defaultOpen);
    return (
        <div className={`seo-accordion ${open ? "is-open" : ""}`}>
            <button
                className="seo-accordion-trigger"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
            >
                <span className="seo-accordion-title font-bold">{section.title}</span>
                <span className="seo-accordion-icon">{open ? "–" : "+"}</span>
            </button>
            {open && <div className="seo-accordion-body">{section.content}</div>}
        </div>
    );
}

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
    { id: "bronze", label: "Bronze", hex: "#CD7F32", type: "polished" },
    { id: "white", label: "White", hex: "#f2f2f2", type: "satin" },
];
const AVAILABLE_SIZES = ["16\"", "17\"", "18\"", "19\"", "20\"", "21\"", "22\"", "23\"", "24\"", "25\"", "26\""];

/* ── Build metallic tile style per finish ── */
function metalTileStyle(finish: MetalFinish): React.CSSProperties {
    const { hex, type } = finish;

    const reflectionOpacity = type === "polished" ? 0.66 : type === "satin" ? 0.44 : 0.3;
    const highlightSize = type === "polished" ? "42% 32%" : type === "satin" ? "54% 40%" : "62% 48%";

    const brushedOverlay =
        type === "brushed"
            ? "repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 3px)"
            : "";

    const darkenedHex = adjustBrightness(hex, -32);
    const deeperHex = adjustBrightness(hex, -60);
    const edgeHighlightHex = adjustBrightness(hex, 18);

    return {
        width: "100%",
        height: "100%",
        background: [
            brushedOverlay,
            "radial-gradient(circle at 22% 18%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.12) 26%, transparent 46%)",
            "radial-gradient(circle at 78% 82%, rgba(255,255,255,0.16) 0%, transparent 36%)",
            `radial-gradient(ellipse ${highlightSize} at 33% 22%, rgba(255,255,255,${reflectionOpacity}) 0%, transparent 62%)`,
            `linear-gradient(145deg, ${edgeHighlightHex} 0%, ${hex} 42%, ${darkenedHex} 72%, ${deeperHex} 100%)`,
        ]
            .filter(Boolean)
            .join(", "),
        boxShadow: `
            inset -12px -10px 20px rgba(0,0,0,0.42),
            inset 10px 10px 16px rgba(255,255,255,${reflectionOpacity * 0.34}),
            inset 0 0 0 1px rgba(255,255,255,0.1)
        `,
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
    
    const localResult = getProductBySlug(categorySlug, productSlug);

    const [dbProduct, setDbProduct] = useState<DBProduct | null>(null);
    const [isLoadingDb, setIsLoadingDb] = useState(!localResult);
    const [isNotFound, setIsNotFound] = useState(false);

    useEffect(() => {
        if (localResult) {
            setIsLoadingDb(false);
            return;
        }

        const fetchDbProduct = async () => {
            setIsLoadingDb(true);

            // Try to extract the numeric DB id from the slug (e.g. "drx-101-42" → 42)
            const idMatch = productSlug.match(/-(\d+)$/);
            const dbId = idMatch ? parseInt(idMatch[1], 10) : null;

            let query = supabase
                .from("products")
                .select(`*, product_images ( image_url )`);

            if (dbId !== null) {
                // Fetch by exact ID for precision
                query = query.eq("id", dbId);
            }

            const { data, error } = await query;

            if (error) {
                console.error("SUPABASE QUERY ERROR:", error.message, error.details, error.hint);
                setIsNotFound(true);
            } else if (!data || data.length === 0) {
                setIsNotFound(true);
            } else {
                // If fetched by ID, use the first result; otherwise try slug-based match
                let found: DBProduct | undefined;
                if (dbId !== null) {
                    found = data[0] as DBProduct;
                } else {
                    found = data.find((p: DBProduct) => p.title.toLowerCase().replace(/\s+/g, '-') === productSlug.toLowerCase());
                }

                if (found) {
                    setDbProduct(found as DBProduct);
                } else {
                    setIsNotFound(true);
                }
            }
            setIsLoadingDb(false);
        };

        fetchDbProduct();
    }, [localResult, productSlug]);

    const resolvedProduct = localResult?.product || (dbProduct ? (() => {
        let tags: string[] = [];
        try {
            if (dbProduct.parameters) tags = JSON.parse(dbProduct.parameters).tags || [];
        } catch {}
        const rawImages = dbProduct.product_images || [];
        const imageUrls = rawImages.map((img: { image_url: string }) => img.image_url) || [];
        return {
            name: dbProduct.title,
            image: imageUrls[0] || "/placeholder.png",
            hoverImage: (imageUrls && imageUrls.length > 1) ? imageUrls[1] : (imageUrls[0] || "/placeholder.png"),
            description: dbProduct.description,
            sizes: Array.isArray(dbProduct.sizes) ? dbProduct.sizes : tags,
        };
    })() : null);

    const resolvedCategory = localResult?.category || {
        name: categorySlug === "vip" ? "Luxury Series" : categorySlug === "offroad" ? "Off-Road Series" : "Sport Series",
        displayTitle: categorySlug === "vip" ? "L U X U R Y   S E R I E S" : categorySlug === "offroad" ? "O F F - R O A D   S E R I E S" : "S P O R T   S E R I E S",
    };

    const [selectedFinish, setSelectedFinish] = useState<MetalFinish>(METAL_FINISHES[0]);
    const heroRef = useRef<HTMLDivElement>(null);

    /* ── Lead modal state ── */
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [leadIntent, setLeadIntent] = useState<"order" | "advice">("order");
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [leadName, setLeadName] = useState("");
    const [leadEmail, setLeadEmail] = useState("");
    const [leadPhone, setLeadPhone] = useState("");
    const [leadVehicle, setLeadVehicle] = useState("");
    const [leadCompany, setLeadCompany] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const openLeadModal = useCallback((intent: "order" | "advice") => {
        setLeadIntent(intent);
        setSubmitError("");
        setSubmitSuccess(false);
        setShowLeadModal(true);
    }, []);

    const handleCloseLead = useCallback(() => {
        setShowLeadModal(false);
        setIsSubmitting(false);
        if (submitSuccess) {
            setSubmitSuccess(false);
            setLeadName("");
            setLeadEmail("");
            setLeadPhone("");
            setLeadVehicle("");
        }
    }, [submitSuccess]);

    useEffect(() => {
        if (!showLeadModal) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") handleCloseLead();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [showLeadModal, handleCloseLead]);

    const leadEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(leadEmail.trim());
    const canSubmitLead = Boolean(leadName.trim() && leadEmailValid && leadPhone.replace(/\D/g, "").length >= 6);

    const handleSubmitLead = useCallback(async (event?: React.FormEvent) => {
        event?.preventDefault();
        if (!canSubmitLead || isSubmitting) return;
        setIsSubmitting(true);
        setSubmitError("");
        try {
            const res = await fetch("/api/configurator-lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    source: "Catalog product page",
                    intent: leadIntent === "order" ? "Order configuration" : "Fitment advice",
                    pageUrl: window.location.href,
                    selectedCarModel: leadVehicle.trim(),
                    wheel: {
                        model: resolvedProduct?.name ?? "N/A",
                        category: resolvedCategory.name,
                        finish: selectedFinish.label,
                        finishHex: selectedFinish.hex.toUpperCase(),
                        size: selectedSize ?? "Not selected",
                    },
                    customer: {
                        name: leadName.trim(),
                        email: leadEmail.trim(),
                        phone: leadPhone.trim(),
                    },
                    company: leadCompany,
                }),
            });
            const data = await res.json().catch(() => null);
            if (!res.ok || !data?.ok) {
                throw new Error(data?.message || "We could not send your request. Please try again.");
            }
            setSubmitSuccess(true);
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "We could not send your request. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }, [canSubmitLead, isSubmitting, leadIntent, leadVehicle, resolvedProduct?.name, resolvedCategory.name, selectedFinish, selectedSize, leadName, leadEmail, leadPhone, leadCompany]);

    /* ── Entrance animations ── */
    useEffect(() => {
        if (isLoadingDb || isNotFound || !resolvedProduct) return;

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
    }, [isLoadingDb, isNotFound, resolvedProduct]);

    /* ── Hero parallax on scroll ── */
    useEffect(() => {
        if (isLoadingDb || isNotFound || !resolvedProduct) return;
        
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
    }, [isLoadingDb, isNotFound, resolvedProduct]);

    if (isLoadingDb) {
        return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><LoaderCircle className="spin" size={32} /></div>;
    }

    /* ── 404 guard ── */
    if (isNotFound || !resolvedProduct) {
        return (
            <div className="catalog-not-found">
                <h1>Product Not Found</h1>
                <Link href="/catalog">Back to Catalog</Link>
            </div>
        );
    }

    const { name, image, hoverImage, sizes } = resolvedProduct;
    const previewFinish: MetalFinish = selectedFinish;

    const displaySizes = sizes && sizes.length > 0 ? sizes : AVAILABLE_SIZES;

    const dynamicSeoSections: SeoSection[] = SEO_SECTIONS.map((defaultSection, i) => {
        if (!dbProduct) return defaultSection;

        const sectionNum = i + 1;
        const titleKey = `section_${sectionNum}_title` as keyof DBProduct;
        const textKey = `section_${sectionNum}_text` as keyof DBProduct;

        const dbTitle = dbProduct[titleKey] as string | undefined;
        const dbText = dbProduct[textKey] as string | undefined;

        return {
            title: dbTitle || defaultSection.title,
            defaultOpen: defaultSection.defaultOpen,
            content: dbText ? (
                <div className="whitespace-pre-wrap break-words">
                    {dbText}
                </div>
            ) : defaultSection.content,
        };
    });

    return (
        <>
            {/* ===== TASK 1 — Slim Cinematic Header ===== */}
            <section ref={heroRef} className="pdp-hero" aria-label={resolvedCategory.name}>
                <div
                    className="pdp-hero-bg"
                    style={{
                        backgroundImage: `url('${categoryHeroImage[categorySlug] ?? "/catalog/luxury phantom.jpg"}')`,
                    }}
                />
                <div className="pdp-hero-gradient" />
                <span className="pdp-hero-series">{resolvedCategory.displayTitle}</span>
            </section>

            {/* ===== Breadcrumbs ===== */}
            <nav className="pdp-breadcrumbs" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span className="pdp-bc-sep">/</span>
                <Link href="/catalog">Catalog</Link>
                <span className="pdp-bc-sep">/</span>
                <Link href={`/catalog/${categorySlug}`}>{resolvedCategory.name}</Link>
                <span className="pdp-bc-sep">/</span>
                <span className="pdp-bc-active">{name}</span>
            </nav>

            {/* ===== TASK 2 — Split Screen Layout ===== */}
            <div className="pdp-split">
                {/* Left — Stacked Product Images */}
                <div className="pdp-image-stack">
                    <div className="pdp-img-wrap">
                        <Image
                            src={image}
                            alt={`${name} — Front`}
                            width={1400}
                            height={1400}
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            draggable={false}
                        />
                    </div>
                    {image !== hoverImage && (
                        <div className="pdp-img-wrap">
                            <Image
                                src={hoverImage}
                                alt={`${name} — Angle`}
                                width={1400}
                                height={1400}
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                draggable={false}
                            />
                        </div>
                    )}
                </div>

                {/* Right — Sticky Details & Configurator */}
                <div className="pdp-sticky-col">
                    {/* Title */}
                    <div className="pdp-info-block">
                        <h1 className="pdp-title">{name}</h1>
                    </div>

                    {/* Available Sizes */}
                    <div className="pdp-info-block">
                        <div className="pdp-sizes-label">Available Sizes<span className="pdp-sizes-selected">{selectedSize ? ` — Selected: ${selectedSize}` : " — Tap to select"}</span></div>
                        <div className="pdp-sizes-list">
                            {displaySizes.map((size: string, i: number) => (
                                <span key={size}>
                                    <button
                                        type="button"
                                        className={`pdp-size pdp-size-btn ${selectedSize === size ? "is-active" : ""}`}
                                        aria-pressed={selectedSize === size}
                                        onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                                    >
                                        {size}
                                    </button>
                                    {i < displaySizes.length - 1 && (
                                        <span className="pdp-size-sep">|</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* ===== TASK 3 — Metal Configurator ===== */}
                    <div className="pdp-info-block pdp-configurator">
                        <div className="pdp-cfg-header">
                            <span className="pdp-cfg-label">Popular Metal Finishes</span>
                            <span className="pdp-cfg-value">
                                Selected: <strong>{previewFinish.label}</strong>
                            </span>
                        </div>

                        <p className="pdp-cfg-note">
                            We curated the most requested premium metal tones for quick selection.
                        </p>

                        <div className="pdp-bespoke-copy" role="note" aria-label="Full bespoke options">
                            <p className="pdp-bespoke-copy-line">
                                Bring us your preferred <strong>design language</strong> or style reference, and we will tailor the build to match your order.
                            </p>
                            <p className="pdp-bespoke-copy-line">
                                Custom <strong>engraving</strong> and personalized <strong>wheel caps</strong> are available for every made-to-order set.
                            </p>
                        </div>

                        <div className="pdp-metal-grid" role="radiogroup" aria-label="Popular metal finishes">
                            {METAL_FINISHES.map((f) => (
                                <button
                                    key={f.id}
                                    className={`pdp-metal-card ${selectedFinish.id === f.id ? "is-active" : ""}`}
                                    aria-label={f.label}
                                    aria-checked={selectedFinish.id === f.id}
                                    role="radio"
                                    onClick={() => setSelectedFinish(f)}
                                >
                                    <span className="pdp-metal-chip" style={metalTileStyle(f)} />
                                    <span className="pdp-metal-card-label">{f.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="pdp-metal-selection" aria-live="polite">
                            <span className="pdp-metal-selection-name">{previewFinish.label}</span>
                            <span className="pdp-metal-selection-sep">•</span>
                            <span>{previewFinish.hex.toUpperCase()}</span>
                        </div>

                    </div>

                    {/* ===== TASK 4 — Purchase Actions ===== */}
                    <div className="pdp-actions">
                        <button
                            className="pdp-btn-primary"
                            onClick={() => openLeadModal("order")}
                        >
                            ORDER CONFIGURATION
                        </button>
                        <button
                            className="pdp-btn-secondary"
                            onClick={() => openLeadModal("advice")}
                        >
                            REQUEST FITMENT ADVICE
                        </button>
                    </div>
                </div>
            </div>

            {/* ===== SEO Content Sections ===== */}
            <div className="seo-section">
                {dynamicSeoSections.map((section, idx) => (
                    <SeoAccordion key={idx} section={section} />
                ))}
            </div>

            {/* ===== Lead Modal ===== */}
            <AnimatePresence>
                {showLeadModal && (
                    <motion.div
                        className="config-lead-modal-backdrop config-lead-modal-backdrop--fixed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCloseLead}
                    >
                        <motion.div
                            className="config-lead-modal config-lead-modal--light"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="lead-modal-title"
                            initial={{ opacity: 0, y: 30, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 18, scale: 0.98 }}
                            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                            onClick={(e) => e.stopPropagation()}
                            data-lenis-prevent
                        >
                            <button className="config-lead-close" onClick={handleCloseLead} aria-label="Close">
                                <X size={15} />
                            </button>

                            <AnimatePresence mode="wait" initial={false}>
                                {submitSuccess ? (
                                    <motion.div
                                        key="success"
                                        className="lead-success"
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        <motion.span
                                            className="lead-success-icon"
                                            initial={{ scale: 0.4, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                                        >
                                            <Check size={26} />
                                        </motion.span>
                                        <span className="lead-eyebrow">Request received</span>
                                        <h3 id="lead-modal-title">Thank you, {leadName.trim().split(" ")[0]}.</h3>
                                        <p className="lead-success-copy">
                                            We have received your request. A DRAXLER specialist will contact you shortly
                                            by phone or email to confirm fitment, finish and pricing.
                                        </p>
                                        <dl className="lead-summary">
                                            <div><dt>Wheel</dt><dd>{name}</dd></div>
                                            <div><dt>Finish</dt><dd>{previewFinish.label}</dd></div>
                                            <div><dt>Size</dt><dd>{selectedSize ?? "To be advised"}</dd></div>
                                        </dl>
                                        <button type="button" className="config-lead-submit lead-submit-dark" onClick={handleCloseLead}>
                                            <span>Close</span>
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        onSubmit={handleSubmitLead}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                        noValidate
                                    >
                                        <span className="lead-eyebrow">{leadIntent === "order" ? "Order configuration" : "Fitment advice"}</span>
                                        <h3 id="lead-modal-title">{leadIntent === "order" ? "Request Quote" : "Request Fitment Advice"}</h3>

                                        <dl className="lead-summary">
                                            <div><dt>Wheel</dt><dd>{name}</dd></div>
                                            <div>
                                                <dt>Finish</dt>
                                                <dd><span className="lead-swatch" style={{ ...metalTileStyle(previewFinish), width: 14, height: 14 }} />{previewFinish.label}</dd>
                                            </div>
                                            <div><dt>Size</dt><dd>{selectedSize ?? "Choose below"}</dd></div>
                                        </dl>

                                        <div className="lead-size-row" role="group" aria-label="Wheel size">
                                            {displaySizes.map((size: string) => (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    className={`lead-size-chip ${selectedSize === size ? "is-active" : ""}`}
                                                    aria-pressed={selectedSize === size}
                                                    onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="config-lead-step-content">
                                            <label htmlFor="lead-name">Name</label>
                                            <input
                                                id="lead-name"
                                                className="config-lead-input"
                                                value={leadName}
                                                onChange={(e) => setLeadName(e.target.value)}
                                                placeholder="Your name"
                                                autoComplete="name"
                                                required
                                            />

                                            <label htmlFor="lead-email">Email</label>
                                            <input
                                                id="lead-email"
                                                className="config-lead-input"
                                                type="email"
                                                value={leadEmail}
                                                onChange={(e) => setLeadEmail(e.target.value)}
                                                placeholder="name@email.com"
                                                autoComplete="email"
                                                required
                                            />

                                            <label htmlFor="lead-phone">Phone</label>
                                            <input
                                                id="lead-phone"
                                                className="config-lead-input"
                                                type="tel"
                                                value={leadPhone}
                                                onChange={(e) => setLeadPhone(e.target.value)}
                                                placeholder="+1 (___) ___-____"
                                                autoComplete="tel"
                                                required
                                            />

                                            <label htmlFor="lead-vehicle">Vehicle <small>(optional)</small></label>
                                            <input
                                                id="lead-vehicle"
                                                className="config-lead-input"
                                                value={leadVehicle}
                                                onChange={(e) => setLeadVehicle(e.target.value)}
                                                placeholder="e.g. 2024 Mercedes-AMG G 63"
                                            />

                                            <input
                                                className="lead-honeypot"
                                                tabIndex={-1}
                                                autoComplete="off"
                                                aria-hidden="true"
                                                value={leadCompany}
                                                onChange={(e) => setLeadCompany(e.target.value)}
                                                name="company"
                                            />

                                            <p className="lead-note">
                                                Leave your details and our team will contact you shortly to confirm fitment and pricing. No payment is taken at this stage.
                                            </p>

                                            <AnimatePresence>
                                                {submitError && (
                                                    <motion.p
                                                        className="lead-error"
                                                        role="alert"
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                    >
                                                        {submitError}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>

                                            <div className="config-lead-actions">
                                                <button
                                                    type="submit"
                                                    className="config-lead-submit lead-submit-dark"
                                                    disabled={!canSubmitLead || isSubmitting}
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <LoaderCircle size={16} className="spin" />
                                                            <span>Sending...</span>
                                                        </>
                                                    ) : (
                                                        <span>Send Request</span>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="pdp-page-footer">
                <Footer />
            </div>
        </>
    );
}
