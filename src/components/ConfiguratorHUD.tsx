"use client";

import Image from "next/image";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Car, CircleDot, Paintbrush, Menu, X as XIcon, Download } from "lucide-react";
import { CAR_RIM_MAPPINGS } from "../data/car-rims-mesh";
import { catalogCategories } from "@/lib/catalog-data";

interface CarBrand {
    name: string;
    logoPath: string;
    models: Car3DOption[];
}

interface Car3DOption {
    id: string;
    label: string;
    modelPath: string;
    displayName: string;
}

interface Car3DBrandGroup {
    brand: string;
    models: Car3DOption[];
}

type SignatureFinish = {
    name: string;
    hex: string;
    /** Encoded value sent to applyRimFinish: "hex|metalness|roughness|clearcoat" */
    value: string;
    /** Optional React style for the swatch (gradients for special finishes) */
    swatchStyle?: Record<string, string>;
};

const SIGNATURE_FINISHES: SignatureFinish[] = [
    { name: "Gloss Black", hex: "#0A0A0A", value: "#0A0A0A|0.85|0.15|0" },
    { name: "Matte Black", hex: "#1A1A1A", value: "#1A1A1A|0.1|0.85|0" },
    { name: "Satin Black", hex: "#121212", value: "#121212|0.45|0.55|0" },
    { name: "Dark Gunmetal", hex: "#3B3B3F", value: "#3B3B3F|0.82|0.18|0" },
    { name: "Gunmetal Silver", hex: "#6D6D75", value: "#6D6D75|0.8|0.2|0" },
    { name: "Silver Metallic", hex: "#A8ADB7", value: "#A8ADB7|0.82|0.18|0" },
    { name: "Bright Silver", hex: "#C5C9D0", value: "#C5C9D0|0.88|0.12|0" },
    { name: "Polished Silver", hex: "#D8DCE2", value: "#D8DCE2|1.0|0.03|0.9", swatchStyle: { background: "linear-gradient(135deg,#bfc4cc 0%,#f0f2f5 40%,#d0d4da 60%,#eef0f3 100%)" } },
    { name: "Arctic White", hex: "#F3F4F8", value: "#F3F4F8|0.75|0.2|0" },
    { name: "Bronze", hex: "#7A5C3A", value: "#7A5C3A|0.85|0.18|0" },
    { name: "Dark Bronze", hex: "#4E3A25", value: "#4E3A25|0.82|0.22|0" },
    { name: "Champagne Gold", hex: "#B8A67E", value: "#B8A67E|0.88|0.15|0" },
];

type CarBodyColor = {
    name: string;
    value: string;
    swatchStyle?: Record<string, string>;
};

const CAR_COLORS: CarBodyColor[] = [
    { name: "Nardo Grey", value: "#6B6D6E" },
    { name: "Obsidian Black", value: "#111111" },
    { name: "Pearl White", value: "#F6F6F2" },
    { name: "Graphite", value: "#3A3D42" },
    { name: "Rosso Corsa", value: "#B90D18" },
    { name: "Portofino Blue", value: "#1B3E7A" },
    { name: "Miami Blue", value: "#00A9E0" },
    { name: "British Racing", value: "#0A4B3A" },
    { name: "Champagne", value: "#B4A17D" },
    { name: "Liquid Silver", value: "#B8BDC6", swatchStyle: { background: "linear-gradient(135deg,#a9afb8 0%,#d6dbe2 45%,#b7bdc7 100%)" } },
    { name: "Burnt Orange", value: "#B5562C" },
    { name: "Amethyst", value: "#5E3A6E" },
];

const hexToHsl = (hex: string) => {
    const normalized = hex.replace("#", "");
    const value = normalized.length === 3
        ? normalized.split("").map((char) => `${char}${char}`).join("")
        : normalized;

    const red = parseInt(value.slice(0, 2), 16) / 255;
    const green = parseInt(value.slice(2, 4), 16) / 255;
    const blue = parseInt(value.slice(4, 6), 16) / 255;

    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const delta = max - min;

    let hue = 0;
    if (delta !== 0) {
        if (max === red) hue = ((green - blue) / delta) % 6;
        else if (max === green) hue = (blue - red) / delta + 2;
        else hue = (red - green) / delta + 4;
        hue *= 60;
        if (hue < 0) hue += 360;
    }

    const lightness = (max + min) / 2;
    const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

    return {
        h: Math.round(hue),
        s: Math.round(saturation * 100),
        l: Math.round(lightness * 100),
    };
};

const hslToHex = (h: number, s: number, l: number) => {
    const saturation = s / 100;
    const lightness = l / 100;
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const huePrime = h / 60;
    const second = chroma * (1 - Math.abs((huePrime % 2) - 1));

    let red = 0;
    let green = 0;
    let blue = 0;

    if (huePrime >= 0 && huePrime < 1) {
        red = chroma;
        green = second;
    } else if (huePrime >= 1 && huePrime < 2) {
        red = second;
        green = chroma;
    } else if (huePrime >= 2 && huePrime < 3) {
        green = chroma;
        blue = second;
    } else if (huePrime >= 3 && huePrime < 4) {
        green = second;
        blue = chroma;
    } else if (huePrime >= 4 && huePrime < 5) {
        red = second;
        blue = chroma;
    } else {
        red = chroma;
        blue = second;
    }

    const match = lightness - chroma / 2;
    const toHex = (value: number) => Math.round((value + match) * 255).toString(16).padStart(2, "0");
    return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toUpperCase();
};

const BRAND_LOGO_BY_NAME: Record<string, string> = {
    "Mercedes-Benz": "/logos_names/mercedes.png",
    "Ford": "/logos_names/ford.png",
    "Chevrolet": "/logos_names/chevrolet.png",
    "Dodge / RAM": "/logos_names/dodge.png",
    "Porsche": "/logos_names/porsche.png",
    "BMW": "/logos_names/bmw.png",
    "Lamborghini": "/logos_names/lamborghini.png",
    "Ferrari": "/logos_names/ferrari.png",
    "McLaren": "/logos_names/mclaren.png",
    "Lexus": "/logos_names/lexus.png",
    "Toyota": "/logos_names/toyota.png",
    "Audi": "/logos_names/audi.png",
    "Cadillac": "/logos_names/cadillac.png",
    "Rolls-Royce": "/logos_names/rolls royce.png",
    "Land Rover": "/logos_names/land rover.png",
};

const BRAND_LOGO_SCALE_BY_NAME: Record<string, number> = {
    "Mercedes-Benz": 1.08,
    "Ford": 0.714,
    "Chevrolet": 1.32,
    "Dodge / RAM": 1.28,
    "Porsche": 1.1,
    "BMW": 1.12,
    "Lamborghini": 1.2,
    "Ferrari": 1.34,
    "McLaren": 1.615,
    "Lexus": 1.26,
    "Toyota": 1.18,
    "Audi": 1.18,
    "Cadillac": 1.18,
    "Rolls-Royce": 1.1,
    "Land Rover": 1.14,
};

const CATEGORY_SLUG_MAP: Record<string, string> = {
    "Off-Road": "offroad",
    "Luxury": "vip",
    "Sport": "sport",
};

const GLB_RIMS: Record<string, string> = {
    "DRX-102": "/car-models/rims/DRX_102.glb",
    "DRX-103": "/car-models/rims/DRX_103.glb",
    "DRX-104": "/car-models/rims/DRX_104.glb",
    "DRX-105": "/car-models/rims/DRX_105.glb",
    "DRX-106": "/car-models/rims/DRX_106.glb",
    "DRX-107": "/car-models/rims/DRX_107.glb",
    "DRX-110": "/car-models/rims/DRX_110.glb",
    "DRX-112": "/car-models/rims/DRX_112.glb",
    "DRX-113": "/car-models/rims/DRX_113.glb",
    "DRX-114": "/car-models/rims/DRX_114.glb",
    "DRX-201": "/car-models/rims/DRX_201.glb",
    "DRX-202": "/car-models/rims/DRX_202.glb",
    "DRX-203": "/car-models/rims/DRX_203.glb",
    "DRX-204": "/car-models/rims/DRX_204.glb",
    "DRX-205": "/car-models/rims/DRX_205.glb",
    "DRX-207": "/car-models/rims/DRX_207.glb",
    "DRX-208": "/car-models/rims/DRX_208.glb",
    "DRX-210": "/car-models/rims/DRX_210.glb",
    "DRX-213": "/car-models/rims/DRX_213.glb",
    "DRX-301": "/car-models/rims/DRX_301.glb",
    "DRX-302": "/car-models/rims/DRX_302.glb",
    "DRX-304": "/car-models/rims/DRX_304.glb",
    "DRX-305": "/car-models/rims/DRX_305.glb",
    "DRX-306": "/car-models/rims/DRX_306.glb",
    "DRX-307": "/car-models/rims/DRX_307.glb",
    "DRX-309": "/car-models/rims/DRX_309.glb",
    "DRX-311": "/car-models/rims/DRX_311.glb",
    "DRX-312": "/car-models/rims/DRX_312.glb",
    "DRX-314": "/car-models/rims/DRX_314.glb",
};

const WHEEL_MODELS = catalogCategories.flatMap((cat) => {
    const displayCategory =
        Object.entries(CATEGORY_SLUG_MAP).find(([, slug]) => slug === cat.slug)?.[0] ?? cat.name;
    return cat.products
        .filter((p) => Boolean(GLB_RIMS[p.name]))
        .map((p) => ({
            id: p.name,
            image: p.hoverImage,
            rimUrl: GLB_RIMS[p.name],
            category: displayCategory,
        }));
});

const WHEEL_CATEGORIES = ["Off-Road", "Luxury", "Sport"] as const;

const stripBracketDetails = (label: string) => label.replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, " ").trim();

const shouldExcludeVehicleModel = (brand: string, modelLabel: string) => {
    const normalized = stripBracketDetails(modelLabel).toLowerCase();
    if (brand === "Mercedes-Benz" && normalized.includes("brabus 850")) return true;

    return normalized.includes("f-150") ||
        normalized.includes("f 150");
};

export default function ConfiguratorHUD({
    active,
    onSelectWheelModel,
    onOpenFinalize,
    onSaveScreenshot,
    isCapturingScreenshot,
    hideHudForScreenshot,
    carGroups,
    selectedCarId,
    onSelectCarModel,
    selectedFinishColor,
    onSelectFinishColor,
    selectedRimUrl,
    onSelectRimUrl,
    carColor,
    setCarColor,
    selectedModelLabel,
    selectedWheelLabel,
}: {
    active: boolean;
    onSelectWheelModel: (wheel: string) => void;
    onOpenFinalize: () => void;
    onSaveScreenshot?: () => void;
    isCapturingScreenshot?: boolean;
    hideHudForScreenshot?: boolean;
    carGroups: Car3DBrandGroup[];
    selectedCarId: string;
    onSelectCarModel: (car: Car3DOption) => void;
    selectedFinishColor: string;
    onSelectFinishColor: (hex: string) => void;
    selectedRimUrl: string | null;
    onSelectRimUrl: (rimUrl: string | null) => void;
    carColor: string;
    setCarColor: (color: string) => void;
    selectedModelLabel?: string;
    selectedWheelLabel?: string;
}) {
    const [openSection, setOpenSection] = useState<"vehicle" | "wheels" | "cars" | "color" | "finish" | null>("vehicle");

    /* ── Hover-to-reveal logic + mobile fallback ───────────────────────────────
       The HUD is hidden by default so it doesn't block the 3D car. When the
       user hovers near the left edge (or over the HUD itself) the toolbar +
       panel + Current Build summary fade in together. Touch devices can't hover
       so we expose a tap-to-toggle button instead. */
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [isPointerInZone, setIsPointerInZone] = useState(false);
    const [touchOpen, setTouchOpen] = useState(false);
    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        // Use the touch UX whenever (a) the device is hover/touch-incapable, OR
        // (b) the viewport is narrow enough that the hover-strip would cover too
        // much of the canvas. This keeps the HUD reachable on narrow desktop
        // browsers (≤768px) where matchMedia('(hover:none)') is still false.
        const mql = window.matchMedia("(hover: none), (pointer: coarse), (max-width: 768px)");
        const update = () => setIsTouchDevice(mql.matches);
        update();
        mql.addEventListener?.("change", update);
        return () => mql.removeEventListener?.("change", update);
    }, []);

    const handleZoneEnter = useCallback(() => {
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
        setIsPointerInZone(true);
    }, []);

    const handleZoneLeave = useCallback(() => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        // Small delay so quick mouse-jitter doesn't flicker the HUD.
        hoverTimerRef.current = setTimeout(() => setIsPointerInZone(false), 140);
    }, []);

    useEffect(() => () => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    }, []);

    const hudVisible = active && (isTouchDevice ? touchOpen : isPointerInZone);

    useEffect(() => {
        if (!active || isTouchDevice || typeof window === "undefined") return;

        const handlePointerMove = (event: PointerEvent) => {
            if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;

            const revealWidth = isPointerInZone ? 490 : 96;

            if (event.clientX <= revealWidth) {
                handleZoneEnter();
                return;
            }

            if (isPointerInZone) {
                handleZoneLeave();
            }
        };

        const configSection = document.getElementById("configurator");
        configSection?.addEventListener("pointermove", handlePointerMove, { passive: true });
        return () => configSection?.removeEventListener("pointermove", handlePointerMove);
    }, [active, handleZoneEnter, handleZoneLeave, isPointerInZone, isTouchDevice]);

    // When the configurator is inactive, never show the HUD or any of its parts.
    useEffect(() => {
        if (!active) {
            setIsPointerInZone(false);
            setTouchOpen(false);
        }
    }, [active]);
    const [selectedBrand, setSelectedBrand] = useState<string>(carGroups[0]?.brand ?? "");
    const [openVehicleBrand, setOpenVehicleBrand] = useState<string | null>(carGroups[0]?.brand ?? null);
    const [selectedWheelCategory, setSelectedWheelCategory] = useState<(typeof WHEEL_CATEGORIES)[number]>("Off-Road");
    const [selectedWheelModel, setSelectedWheelModel] = useState<string>("DRX-301");
    const [showCustomBodyColor, setShowCustomBodyColor] = useState(false);
    const [showCustomFinish, setShowCustomFinish] = useState(false);
    const [openCarBrand, setOpenCarBrand] = useState<string | null>(carGroups[0]?.brand ?? null);
    const initialHsl = useMemo(() => hexToHsl(selectedFinishColor.split("|")[0]), [selectedFinishColor]);
    const [customHuePercent, setCustomHuePercent] = useState(Math.round((initialHsl.h / 360) * 100));
    const [customBodyHuePercent, setCustomBodyHuePercent] = useState(
        () => Math.round((hexToHsl(carColor).h / 360) * 100)
    );

    const selectedCar = useMemo(() => {
        for (const group of carGroups) {
            const car = group.models.find(m => m.id === selectedCarId);
            if (car) return { brand: group.brand, model: car };
        }
        return null;
    }, [carGroups, selectedCarId]);

    const excludedRims = useMemo(() => {
        if (!selectedCar) return [];
        const brand = selectedCar.brand;
        const name = selectedCar.model.displayName;

        if (brand === "Ferrari" && name === "SF90") return ["DRX-302", "DRX-304"];
        if (brand === "Chevrolet" && name === "Corvette C8 Stingray (2019)") return ["DRX-304"];
        if (brand === "Dodge / RAM" && name === "Challenger SRT Hellcat") return ["DRX-304"];
        if (brand === "BMW" && name === "X5 xDrive40i (2024)") return ["DRX-213"];
        if (brand === "Audi" && name === "A6") return ["DRX-314", "DRX-309", "DRX-306", "DRX-301", "DRX-302", "DRX-303", "DRX-304", "DRX-102", "DRX-105", "DRX-113", "DRX-114"];

        return [];
    }, [selectedCar]);

    const carBrands = useMemo<CarBrand[]>(
        () => carGroups
            .map((group) => ({
                name: group.brand,
                logoPath: BRAND_LOGO_BY_NAME[group.brand] ?? "/logos_names/mercedes.png",
                models: group.models.filter((model) => !shouldExcludeVehicleModel(group.brand, model.displayName)),
            }))
            .filter((brand) => brand.models.length > 0),
        [carGroups]
    );

    const activeBrand = useMemo(
        () => carBrands.find((brand) => brand.name === selectedBrand) ?? carBrands[0],
        [carBrands, selectedBrand]
    );

    useEffect(() => {
        if (carBrands.length === 0) return;

        const selectedBrandExists = carBrands.some((brand) => brand.name === selectedBrand);
        if (selectedBrandExists) {
            if (!openVehicleBrand) {
                setOpenVehicleBrand(selectedBrand);
            }
            return;
        }

        const fallbackBrand = carBrands[0];

        setSelectedBrand(fallbackBrand.name);
        setOpenVehicleBrand(fallbackBrand.name);
    }, [carBrands, openVehicleBrand, selectedBrand]);

    useEffect(() => {
        if (!active) return;
        onSelectWheelModel(selectedWheelModel);
    }, [active, onSelectWheelModel, selectedWheelModel]);

    const currentCategoryWheels = useMemo(
        () => WHEEL_MODELS.filter((w) => w.category === selectedWheelCategory && !excludedRims.includes(w.id)),
        [selectedWheelCategory, excludedRims]
    );

    useEffect(() => {
        if (selectedWheelModel && excludedRims.includes(selectedWheelModel)) {
            setSelectedWheelModel("");
            onSelectRimUrl(null);
        }
    }, [selectedCarId, excludedRims, selectedWheelModel, onSelectRimUrl]);

    useEffect(() => {
        const hsl = hexToHsl(selectedFinishColor.split("|")[0]);
        setCustomHuePercent(Math.round((hsl.h / 360) * 100));
    }, [selectedFinishColor]);

    useEffect(() => {
        const hsl = hexToHsl(carColor);
        setCustomBodyHuePercent(Math.round((hsl.h / 360) * 100));
    }, [carColor]);

    const hueDegrees = useMemo(() => Math.round((customHuePercent / 100) * 360), [customHuePercent]);
    const bodyHueDegrees = useMemo(() => Math.round((customBodyHuePercent / 100) * 360), [customBodyHuePercent]);

    const customFinishHex = useMemo(
        () => hslToHex(hueDegrees, 100, 50),
        [hueDegrees]
    );
    const customBodyHex = useMemo(
        () => hslToHex(bodyHueDegrees, 100, 50),
        [bodyHueDegrees]
    );

    const signatureMatch = useMemo(
        () => SIGNATURE_FINISHES.find((finish) => finish.value === selectedFinishColor),
        [selectedFinishColor]
    );
    const bodyColorMatch = useMemo(
        () => CAR_COLORS.find((color) => color.value.toLowerCase() === carColor.toLowerCase()),
        [carColor]
    );

    const SECTION_TABS = [
        { key: "vehicle" as const, label: "Vehicle", icon: Car },
        { key: "wheels" as const, label: "Wheels", icon: CircleDot },
        // { key: "cars" as const, label: "3D Cars", icon: Box },
        { key: "color" as const, label: "Car Color", icon: Palette },
        { key: "finish" as const, label: "Rim Color", icon: Paintbrush },
    ];

    /* Build label fallback so the summary always renders something readable. */
    const currentVehicleLabel = selectedModelLabel ?? "Vehicle";
    const currentWheelLabel = selectedWheelLabel ?? selectedWheelModel;

    return (
        <AnimatePresence>
            {active && !hideHudForScreenshot && (
                <div
                    className={`chud-shell${hudVisible ? " chud-shell--visible" : ""}${isTouchDevice ? " chud-shell--touch" : ""}`}
                    onMouseEnter={isTouchDevice ? undefined : handleZoneEnter}
                    onMouseLeave={isTouchDevice ? undefined : handleZoneLeave}
                    onPointerEnter={isTouchDevice ? undefined : handleZoneEnter}
                    onPointerLeave={isTouchDevice ? undefined : handleZoneLeave}
                >
                    {!isTouchDevice && (
                        <motion.button
                            type="button"
                            className="chud-edge-hint"
                            onFocus={handleZoneEnter}
                            onClick={handleZoneEnter}
                            initial={false}
                            animate={hudVisible
                                ? { opacity: 0, x: -16, y: "-50%", pointerEvents: "none" }
                                : { opacity: 1, x: 0, y: "-50%", pointerEvents: "auto" }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            aria-label="Show configurator controls"
                        >
                            <span className="chud-edge-hint__text">Hover to Control</span>
                        </motion.button>
                    )}

                    {/* ── Mobile-only tap toggle (top-left, doesn't block car) ── */}
                    {isTouchDevice && (
                        <button
                            type="button"
                            className="chud-touch-toggle"
                            onClick={() => setTouchOpen((v) => !v)}
                            aria-label={touchOpen ? "Hide configurator" : "Show configurator"}
                            aria-expanded={touchOpen}
                        >
                            {touchOpen ? <XIcon size={18} strokeWidth={1.7} /> : <Menu size={18} strokeWidth={1.7} />}
                        </button>
                    )}

                    {/* ── Current build summary (aligned to left edge, top of stack) ── */}
                    <motion.div
                        className="chud-current-build"
                        initial={false}
                        animate={hudVisible ? { opacity: 1, x: 0, pointerEvents: "auto" } : { opacity: 0, x: -16, pointerEvents: "none" }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <span className="chud-current-build__label">Current Build</span>
                        <h4 className="chud-current-build__title">
                            Your {currentVehicleLabel} on {currentWheelLabel}
                        </h4>
                    </motion.div>

                    {/* ── Icon toolbar ── */}
                    <motion.nav
                        className="chud-toolbar"
                        initial={false}
                        animate={hudVisible
                            ? { opacity: 1, x: 0, pointerEvents: "auto" }
                            : { opacity: 0, x: -28, pointerEvents: "none" }}
                        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {SECTION_TABS.map((tab, i) => {
                            const Icon = tab.icon;
                            const isActive = openSection === tab.key;
                            return (
                                <motion.button
                                    key={tab.key}
                                    className={`chud-icon-btn${isActive ? " chud-icon-btn--active" : ""}`}
                                    onClick={() => setOpenSection((prev) => (prev === tab.key ? null : tab.key))}
                                    initial={{ opacity: 0, scale: 0.7 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.08 * i + 0.12, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                    aria-label={tab.label}
                                >
                                    <Icon size={20} strokeWidth={1.5} />
                                    <span className="chud-icon-label">
                                        {tab.key === "finish" ? (
                                            <>
                                                Rim
                                                <br />
                                                Color
                                            </>
                                        ) : tab.label}
                                    </span>
                                </motion.button>
                            );
                        })}

                        <div className="chud-toolbar-divider" />

                        <motion.button
                            className="chud-icon-btn chud-icon-btn--save"
                            onClick={onSaveScreenshot}
                            disabled={isCapturingScreenshot}
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.42, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            aria-label="Save Screenshot"
                            title="Save Screenshot"
                        >
                            <Download size={20} strokeWidth={1.5} />
                            <span className="chud-icon-label">Save</span>
                        </motion.button>

                        <motion.button
                            className="chud-icon-btn chud-icon-btn--finalize"
                            onClick={onOpenFinalize}
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            aria-label="Finalize"
                        >
                            <span className="chud-finalize-text">Finalize</span>
                        </motion.button>
                    </motion.nav>

                    {/* ── Slide-out panel ── */}
                    <AnimatePresence mode="wait">
                        {hudVisible && openSection !== null && (
                            <motion.aside
                                key={openSection}
                                className="chud-panel"
                                initial={{ opacity: 0, x: -20, scale: 0.97 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -20, scale: 0.97 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="chud-panel-header">
                                    <h3 className="chud-panel-title">{SECTION_TABS.find(t => t.key === openSection)?.label}</h3>
                                </div>

                                <div
                                    className="chud-panel-body configurator-scrollbar"
                                    data-lenis-prevent="true"
                                    onWheel={(event) => event.stopPropagation()}
                                    onTouchStart={(event) => event.stopPropagation()}
                                    onTouchMove={(event) => event.stopPropagation()}
                                >
                                    {/* ── Vehicle section ── */}
                                    {openSection === "vehicle" && (
                                        <div className="chud-section-content">
                                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                {carBrands.map((brand) => {
                                                    const isActiveBrand = selectedBrand === brand.name;
                                                    const logoScale = BRAND_LOGO_SCALE_BY_NAME[brand.name] ?? 1;

                                                    return (
                                                        <button
                                                            key={brand.name}
                                                            onClick={() => {
                                                                setSelectedBrand(brand.name);
                                                                setOpenVehicleBrand((prev) => (prev === brand.name ? null : brand.name));
                                                            }}
                                                            className={`chud-brand-tile${isActiveBrand ? " chud-brand-tile--active" : ""}`}
                                                            aria-label={`Select ${brand.name}`}
                                                        >
                                                            <div className="chud-brand-tile-inner" style={{ transform: `scale(${logoScale})` }}>
                                                                <Image
                                                                    src={brand.logoPath}
                                                                    alt={brand.name}
                                                                    width={90}
                                                                    height={46}
                                                                    className="h-[40px] w-auto max-w-[124px] object-contain"
                                                                />
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <div className="chud-subsection">
                                                <div className="chud-subsection-label">Models</div>
                                                <div className="space-y-1.5">
                                                    {(activeBrand?.name === openVehicleBrand ? activeBrand.models : []).map((model) => {
                                                        const isActiveModel = selectedCarId === model.id;
                                                        const cleanedLabel = stripBracketDetails(model.displayName);

                                                        return (
                                                            <button
                                                                key={model.id}
                                                                className={`chud-model-btn${isActiveModel ? " chud-model-btn--active" : ""}`}
                                                                onClick={() => onSelectCarModel(model)}
                                                            >
                                                                {cleanedLabel}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Wheels section ── */}
                                    {openSection === "wheels" && (
                                        <div className="chud-section-content">
                                            <div className="mb-4 grid grid-cols-3 gap-1.5 sm:gap-2">
                                                {WHEEL_CATEGORIES.map((category) => (
                                                    <button
                                                        key={category}
                                                        className={`chud-cat-btn${selectedWheelCategory === category ? " chud-cat-btn--active" : ""}`}
                                                        onClick={() => {
                                                            setSelectedWheelCategory(category);
                                                            const firstWheel = WHEEL_MODELS.find((w) => w.category === category);
                                                            if (firstWheel) {
                                                                setSelectedWheelModel(firstWheel.id);
                                                                onSelectWheelModel(firstWheel.id);
                                                            }
                                                        }}
                                                    >
                                                        {category}
                                                    </button>
                                                ))}
                                            </div>

                                            <motion.div
                                                key={selectedWheelCategory}
                                                className="space-y-3"
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.22, ease: "easeOut" }}
                                            >
                                                <button
                                                    className={`chud-model-btn chud-model-btn--factory${selectedRimUrl === null ? " chud-model-btn--active" : ""}`}
                                                    onClick={() => {
                                                        setSelectedWheelModel("");
                                                        onSelectRimUrl(null);
                                                    }}
                                                >
                                                    Factory Wheels
                                                </button>

                                                {currentCategoryWheels.map((wheel) => (
                                                    <button
                                                        key={`${selectedWheelCategory}-${wheel.id}`}
                                                        className={`chud-wheel-card${selectedWheelModel === wheel.id && selectedRimUrl === wheel.rimUrl ? " chud-wheel-card--active" : ""}`}
                                                        onClick={() => {
                                                            setSelectedWheelModel(wheel.id);
                                                            onSelectWheelModel(wheel.id);
                                                            onSelectRimUrl(wheel.rimUrl);
                                                        }}
                                                    >
                                                        <div className="chud-wheel-card-img">
                                                            <Image
                                                                src={wheel.image}
                                                                alt={wheel.id}
                                                                width={360}
                                                                height={235}
                                                                sizes="320px"
                                                                quality={72}
                                                                className="h-[150px] w-full object-contain sm:h-[180px] md:h-[200px]"
                                                            />
                                                        </div>
                                                        <div className="chud-wheel-card-name">
                                                            {wheel.id}
                                                        </div>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        </div>
                                    )}

                                    {/* ── 3D Cars section ── */}
                                    {openSection === "cars" && (
                                        <div className="chud-section-content">
                                            <div className="chud-subsection-label">Brand / Model</div>
                                            <div 
                                                className="configurator-scrollbar max-h-[300px] space-y-2 overflow-y-auto pr-1 sm:max-h-[420px]"
                                                data-lenis-prevent="true"
                                                onTouchStart={(event) => event.stopPropagation()}
                                                onTouchMove={(event) => event.stopPropagation()}
                                                onWheel={(event) => event.stopPropagation()}
                                            >
                                                {carGroups.map((group) => {
                                                    const isOpen = openCarBrand === group.brand;

                                                    return (
                                                        <div key={group.brand} className="chud-car-group">
                                                            <button
                                                                className="chud-car-group-header"
                                                                onClick={() => setOpenCarBrand((prev) => (prev === group.brand ? null : group.brand))}
                                                            >
                                                                <span>{group.brand}</span>
                                                                <span className="chud-car-group-chevron">{isOpen ? "−" : "+"}</span>
                                                            </button>

                                                            <AnimatePresence initial={false}>
                                                                {isOpen && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: "auto", opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        transition={{ duration: 0.2, ease: "easeInOut" }}
                                                                        className="overflow-hidden"
                                                                    >
                                                                        <div className="chud-car-group-models">
                                                                            {group.models.map((car) => {
                                                                                const isSelected = selectedCarId === car.id;
                                                                                return (
                                                                                    <button
                                                                                        key={car.id}
                                                                                        className={`chud-model-btn${isSelected ? " chud-model-btn--active" : ""}`}
                                                                                        onClick={() => onSelectCarModel(car)}
                                                                                        title={car.label}
                                                                                    >
                                                                                        <span className="block truncate">
                                                                                            {car.label}
                                                                                            {(() => {
                                                                                                const fName = car.modelPath.split('/').pop() ?? '';
                                                                                                const isMapped = CAR_RIM_MAPPINGS.hasOwnProperty(fName);
                                                                                                return isMapped ? <span className="text-[10px] text-red-400 opacity-90 ml-1">checked</span> : null;
                                                                                            })()}
                                                                                        </span>
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Car Color section ── */}
                                    {openSection === "color" && (
                                        <div className="chud-section-content">
                                            <div className="chud-subsection-label">Body Color</div>
                                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                {CAR_COLORS.map((color) => {
                                                    const isActive = carColor.toLowerCase() === color.value.toLowerCase();
                                                    return (
                                                        <button
                                                            key={color.name}
                                                            onClick={() => setCarColor(color.value)}
                                                            className={`chud-finish-swatch chud-finish-swatch--large${isActive ? " chud-finish-swatch--active" : ""}`}
                                                            title={color.name}
                                                        >
                                                            <span
                                                                className="chud-finish-color chud-finish-color--large"
                                                                style={color.swatchStyle ?? { background: color.value }}
                                                            />
                                                            <span className="chud-finish-name chud-finish-name--large">{color.name}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <div className="chud-custom-finish">
                                                <button
                                                    onClick={() => setShowCustomBodyColor((prev) => !prev)}
                                                    className="chud-custom-finish-toggle"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <Palette size={14} />
                                                        Custom
                                                    </span>
                                                    <span className="font-mono text-[12px] tracking-[0.08em] text-white/55">{carColor.toUpperCase()}</span>
                                                </button>

                                                <AnimatePresence initial={false}>
                                                    {showCustomBodyColor && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="mt-3 space-y-3">
                                                                <div
                                                                    className="h-10 w-full rounded-lg border border-white/10"
                                                                    style={{ background: customBodyHex }}
                                                                />
                                                                <label className="block text-[10px] uppercase tracking-[0.18em] text-white/45">
                                                                    Hue Spectrum
                                                                    <input
                                                                        type="range"
                                                                        min={0}
                                                                        max={100}
                                                                        value={customBodyHuePercent}
                                                                        onChange={(event) => {
                                                                            const nextPercent = Number(event.target.value);
                                                                            setCustomBodyHuePercent(nextPercent);
                                                                            const nextHue = Math.round((nextPercent / 100) * 360);
                                                                            setCarColor(hslToHex(nextHue, 100, 50));
                                                                        }}
                                                                        className="configurator-hue-slider mt-2 h-2 w-full cursor-pointer appearance-none rounded-full"
                                                                    />
                                                                </label>

                                                                <div className="chud-live-color">
                                                                    <span>Live Color</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span
                                                                            className="h-4 w-4 rounded-full border border-white/20"
                                                                            style={{ background: customBodyHex }}
                                                                        />
                                                                        <span className="font-mono text-[12px] tracking-[0.08em] text-white/65">{customBodyHex}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            <div className="chud-selected-finish">
                                                {bodyColorMatch ? `Selected: ${bodyColorMatch.name}` : "Selected: Custom Body Color"}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Rim Finish section ── */}
                                    {openSection === "finish" && (
                                        <div className="chud-section-content">
                                            <div className="chud-subsection-label">Signature Finishes</div>
                                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                                {SIGNATURE_FINISHES.map((finish) => {
                                                    const isActive = selectedFinishColor === finish.value;
                                                    return (
                                                        <button
                                                            key={finish.name}
                                                            onClick={() => onSelectFinishColor(finish.value)}
                                                            className={`chud-finish-swatch${isActive ? " chud-finish-swatch--active" : ""}`}
                                                        >
                                                            <span
                                                                className="chud-finish-color"
                                                                style={finish.swatchStyle ?? { background: finish.hex }}
                                                            />
                                                            <span className="chud-finish-name">{finish.name}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <div className="chud-custom-finish">
                                                <button
                                                    onClick={() => setShowCustomFinish((prev) => !prev)}
                                                    className="chud-custom-finish-toggle"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <Palette size={14} />
                                                        Custom
                                                    </span>
                                                    <span className="font-mono text-[12px] tracking-[0.08em] text-white/55">{selectedFinishColor.split("|")[0].toUpperCase()}</span>
                                                </button>

                                                <AnimatePresence initial={false}>
                                                    {showCustomFinish && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="mt-3 space-y-3">
                                                                <div
                                                                    className="h-10 w-full rounded-lg border border-white/10"
                                                                    style={{ background: customFinishHex }}
                                                                />
                                                                <label className="block text-[10px] uppercase tracking-[0.18em] text-white/45">
                                                                    Hue Spectrum
                                                                    <input
                                                                        type="range"
                                                                        min={0}
                                                                        max={100}
                                                                        value={customHuePercent}
                                                                        onChange={(event) => {
                                                                            const nextPercent = Number(event.target.value);
                                                                            setCustomHuePercent(nextPercent);
                                                                            const nextHue = Math.round((nextPercent / 100) * 360);
                                                                            onSelectFinishColor(`${hslToHex(nextHue, 100, 50)}|0.8|0.2|0`);
                                                                        }}
                                                                        className="configurator-hue-slider mt-2 h-2 w-full cursor-pointer appearance-none rounded-full"
                                                                    />
                                                                </label>

                                                                <div className="chud-live-color">
                                                                    <span>Live Color</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span
                                                                            className="h-4 w-4 rounded-full border border-white/20"
                                                                            style={{ background: customFinishHex }}
                                                                        />
                                                                        <span className="font-mono text-[12px] tracking-[0.08em] text-white/65">{customFinishHex}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            <div className="chud-selected-finish">
                                                {signatureMatch ? `Selected: ${signatureMatch.name}` : "Selected: Custom Finish"}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.aside>
                        )}
                    </AnimatePresence>

                    {/* ── Bottom instruction ── */}
                    <motion.div
                        className="chud-bottom-hint"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.6 } }}
                        exit={{ opacity: 0, y: 10 }}
                    >
                        <span className="chud-bottom-dot" />
                        <span>Drag to Rotate</span>
                        <span className="opacity-40">|</span>
                        <span>Scroll to Zoom</span>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
