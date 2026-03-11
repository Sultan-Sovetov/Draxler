"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, LoaderCircle, Check } from "lucide-react";
import gsap from "gsap";
import { getProductBySlug } from "@/lib/catalog-data";
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
                    <li>Duoblock wheels</li>
                    <li>Beadlock wheels for drag racing and off-road applications</li>
                    <li>Dually truck, armored vehicle, and UTV/ATV applications</li>
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
        title: "VINTAGE, CLASSIC & HOT ROD APPLICATIONS",
        content: (
            <p>
                We also specialize in manufacturing custom wheels for classic cars, hot rods, and
                vintage Indy vehicles. Our lineup includes authentic wire wheels and traditional
                magnesium-style &quot;mag wheels.&quot; Options include period-correct &quot;dog
                dish&quot; hubcaps, &quot;knock-off&quot; center caps, and deep-lip profiles. Get
                the heritage look you want without compromising on modern engineering, safety, and
                quality standards.
            </p>
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
                <span className="seo-accordion-title">{section.title}</span>
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
    const [customColorChanged, setCustomColorChanged] = useState(false);
    const [usingCustomColor, setUsingCustomColor] = useState(false);
    const heroRef = useRef<HTMLDivElement>(null);

    /* ── Lead modal state ── */
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [leadName, setLeadName] = useState("");
    const [leadEmail, setLeadEmail] = useState("");
    const [leadPhone, setLeadPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleCloseLead = useCallback(() => {
        setShowLeadModal(false);
        setSubmitSuccess(false);
        setIsSubmitting(false);
    }, []);

    const handleSubmitLead = useCallback(async () => {
        if (!leadName.trim() || !leadEmail.trim() || !leadPhone.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/configurator-lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    selectedCarModel: result?.product?.name ?? "N/A",
                    selectedWheelModel: result?.product?.name ?? "N/A",
                    customer: {
                        name: leadName.trim(),
                        email: leadEmail.trim(),
                        phone: leadPhone.trim(),
                    },
                }),
            });
            if (!res.ok) throw new Error("Failed");
            setSubmitSuccess(true);
            setTimeout(() => {
                setShowLeadModal(false);
                setLeadName("");
                setLeadEmail("");
                setLeadPhone("");
                setSubmitSuccess(false);
            }, 1300);
        } catch {
            setSubmitSuccess(false);
        } finally {
            setIsSubmitting(false);
        }
    }, [leadEmail, leadName, leadPhone, result?.product?.name]);

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
                <div
                    className="pdp-hero-bg"
                    style={{
                        backgroundImage: `url('${categoryHeroImage[categorySlug] ?? "/catalog/luxury phantom.jpg"}')`,
                    }}
                />
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
                                <span
                                    className={`pdp-swatch-inner ${customColorChanged ? "" : "pdp-swatch-inner--rainbow"}`}
                                    style={customColorChanged ? sphereStyle({ id: "custom", label: "Custom", hex: customColor, type: "polished" }) : undefined}
                                />
                            </button>
                        </div>

                        {usingCustomColor && (
                            <label className="pdp-custom-color-input-wrap" htmlFor="pdp-custom-color">
                                <span className="pdp-custom-color-label">Custom HEX</span>
                                <input
                                    id="pdp-custom-color"
                                    type="color"
                                    value={customColor}
                                    onChange={(event) => {
                                        setCustomColor(event.target.value);
                                        setCustomColorChanged(true);
                                    }}
                                    className="pdp-custom-color-input"
                                />
                            </label>
                        )}
                    </div>

                    {/* ===== TASK 4 — Purchase Actions ===== */}
                    <div className="pdp-actions">
                        <button
                            className="pdp-btn-primary"
                            onClick={() => setShowLeadModal(true)}
                        >
                            ORDER CONFIGURATION
                        </button>
                        <button
                            className="pdp-btn-secondary"
                            onClick={() => setShowLeadModal(true)}
                        >
                            REQUEST FITMENT ADVICE
                        </button>
                    </div>
                </div>
            </div>

            {/* ===== SEO Content Sections ===== */}
            <div className="seo-section">
                {SEO_SECTIONS.map((section) => (
                    <SeoAccordion key={section.title} section={section} />
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
                            className="config-lead-modal"
                            initial={{ opacity: 0, y: 30, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 18, scale: 0.98 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="config-lead-close" onClick={handleCloseLead}>
                                <X size={15} />
                            </button>

                            <h3>Request Quote</h3>
                            <p>{product.name} — {previewFinish.label} ({previewFinish.hex.toUpperCase()})</p>

                            <div className="config-lead-step-content">
                                <label>Name</label>
                                <input
                                    className="config-lead-input"
                                    value={leadName}
                                    onChange={(e) => setLeadName(e.target.value)}
                                    placeholder="Your name"
                                />

                                <label>Email</label>
                                <input
                                    className="config-lead-input"
                                    type="email"
                                    value={leadEmail}
                                    onChange={(e) => setLeadEmail(e.target.value)}
                                    placeholder="name@email.com"
                                />

                                <label>Phone</label>
                                <input
                                    className="config-lead-input"
                                    value={leadPhone}
                                    onChange={(e) => setLeadPhone(e.target.value)}
                                    placeholder="+1 (___) ___-____"
                                />

                                <div className="config-lead-actions">
                                    <button
                                        className="config-lead-submit"
                                        onClick={handleSubmitLead}
                                        disabled={!leadName.trim() || !leadEmail.trim() || !leadPhone.trim() || isSubmitting || submitSuccess}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <LoaderCircle size={16} className="spin" />
                                                <span>Sending...</span>
                                            </>
                                        ) : submitSuccess ? (
                                            <>
                                                <Check size={16} />
                                                <span>Sent</span>
                                            </>
                                        ) : (
                                            <span>Send Request</span>
                                        )}
                                    </button>
                                </div>
                            </div>
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
