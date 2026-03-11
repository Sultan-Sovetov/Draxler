"use client";

import Image from "next/image";
import { useMemo, useState, useEffect, useRef, type WheelEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Car, CircleDot, Box, Paintbrush } from "lucide-react";
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
};

const SIGNATURE_FINISHES: SignatureFinish[] = [
    { name: "Phantom Black", hex: "#0F1115" },
    { name: "Silver Satin", hex: "#A8ADB7" },
    { name: "Draxler Purple", hex: "#5636A5" },
    { name: "Emerald Shadow", hex: "#0F4C46" },
    { name: "Royal Burgundy", hex: "#55202B" },
    { name: "Arctic Pearl", hex: "#F3F4F8" },
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
    "Mercedes-Benz": "/logos_names/Mercedes-Logo.svg.png",
    "Ford": "/logos_names/ford.png",
    "Chevrolet": "/logos_names/chevrolet.png",
    "Dodge / RAM": "/logos_names/dodge.png",
    "Porsche": "/logos_names/Porsche_logo.png",
    "BMW": "/logos_names/BMW.svg.png",
    "Lamborghini": "/logos_names/lamborghini-logo.png",
    "Ferrari": "/logos_names/ferrari logo.png",
    "McLaren": "/logos_names/mclaren.png",
    "Lexus": "/logos_names/Lexus.png",
    "Audi": "/logos_names/audi.png",
    "Cadillac": "/logos_names/cadillac.png",
};

const CATEGORY_SLUG_MAP: Record<string, string> = {
    "Off-Road": "offroad",
    "VIP": "vip",
    "Sport": "sport",
};

const WHEEL_MODELS = catalogCategories.flatMap((cat) => {
    const displayCategory =
        Object.entries(CATEGORY_SLUG_MAP).find(([, slug]) => slug === cat.slug)?.[0] ?? cat.name;
    return cat.products.map((p) => ({
        id: p.name,
        image: p.hoverImage,
        rimUrl: null as string | null,
        category: displayCategory,
    }));
});

const WHEEL_CATEGORIES = ["Off-Road", "Luxury", "Sport"] as const;

const LIGHT_TILE_BRANDS = new Set([
    "Mercedes-Benz",
    "Audi",
    "BMW",
    "Lexus",
    "Ford",
    "Porsche",
    "Cadillac",
]);

const EXCLUDED_VEHICLE_BRANDS = new Set(["McLaren"]);

const stripBracketDetails = (label: string) => label.replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, " ").trim();

const shouldExcludeVehicleModel = (brand: string, modelLabel: string) => {
    if (EXCLUDED_VEHICLE_BRANDS.has(brand)) return true;

    const normalized = stripBracketDetails(modelLabel).toLowerCase();
    if (brand === "Mercedes-Benz" && normalized.includes("brabus 850")) return true;

    return normalized.includes("f-150") ||
        normalized.includes("f 150") ||
        normalized.includes("cayenne") ||
        normalized.includes("lc 500") ||
        normalized.includes("gx 550") ||
        normalized.includes("gx550");
};

export default function ConfiguratorHUD({
    active,
    onSelectWheelModel,
    onOpenFinalize,
    carGroups,
    selectedCarId,
    onSelectCarModel,
    selectedFinishColor,
    onSelectFinishColor,
    selectedRimUrl,
    onSelectRimUrl,
}: {
    active: boolean;
    onSelectWheelModel: (wheel: string) => void;
    onOpenFinalize: () => void;
    carGroups: Car3DBrandGroup[];
    selectedCarId: string;
    onSelectCarModel: (car: Car3DOption) => void;
    selectedFinishColor: string;
    onSelectFinishColor: (hex: string) => void;
    selectedRimUrl: string | null;
    onSelectRimUrl: (rimUrl: string | null) => void;
}) {
    const [openSection, setOpenSection] = useState<"vehicle" | "wheels" | "cars" | "finish" | null>("vehicle");
    const [selectedBrand, setSelectedBrand] = useState<string>(carGroups[0]?.brand ?? "");
    const [openVehicleBrand, setOpenVehicleBrand] = useState<string | null>(carGroups[0]?.brand ?? null);
    const [selectedWheelCategory, setSelectedWheelCategory] = useState<(typeof WHEEL_CATEGORIES)[number]>("Off-Road");
    const [selectedWheelModel, setSelectedWheelModel] = useState<string>("DRX-301");
    const [showCustomFinish, setShowCustomFinish] = useState(false);
    const [openCarBrand, setOpenCarBrand] = useState<string | null>(carGroups[0]?.brand ?? null);
    const panelScrollRef = useRef<HTMLDivElement>(null);
    const initialHsl = useMemo(() => hexToHsl(selectedFinishColor), [selectedFinishColor]);
    const [customHuePercent, setCustomHuePercent] = useState(Math.round((initialHsl.h / 360) * 100));

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
        () => WHEEL_MODELS.filter((w) => w.category === selectedWheelCategory),
        [selectedWheelCategory]
    );

    useEffect(() => {
        const hsl = hexToHsl(selectedFinishColor);
        setCustomHuePercent(Math.round((hsl.h / 360) * 100));
    }, [selectedFinishColor]);

    const hueDegrees = useMemo(() => Math.round((customHuePercent / 100) * 360), [customHuePercent]);

    const customFinishHex = useMemo(
        () => hslToHex(hueDegrees, 100, 50),
        [hueDegrees]
    );

    const signatureMatch = useMemo(
        () => SIGNATURE_FINISHES.find((finish) => finish.hex.toLowerCase() === selectedFinishColor.toLowerCase()),
        [selectedFinishColor]
    );

    const handlePanelWheel = (event: WheelEvent<HTMLElement>) => {
        event.stopPropagation();

        const scroller = panelScrollRef.current;
        if (!scroller) return;

        if (scroller.scrollHeight > scroller.clientHeight) {
            event.preventDefault();
            scroller.scrollTop += event.deltaY;
        }
    };

    const SECTION_TABS = [
        { key: "vehicle" as const, label: "Vehicle", icon: Car },
        { key: "wheels" as const, label: "Wheels", icon: CircleDot },
        { key: "cars" as const, label: "3D Cars", icon: Box },
        { key: "finish" as const, label: "Finish", icon: Paintbrush },
    ];

    return (
        <AnimatePresence>
            {active && (
                <>
                    {/* ── Icon toolbar ── */}
                    <motion.nav
                        className="chud-toolbar"
                        initial={{ opacity: 0, x: -28 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -28 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
                                    <span className="chud-icon-label">{tab.label}</span>
                                </motion.button>
                            );
                        })}

                        <div className="chud-toolbar-divider" />

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
                        {openSection !== null && (
                            <motion.aside
                                key={openSection}
                                className="chud-panel"
                                onWheelCapture={handlePanelWheel}
                                initial={{ opacity: 0, x: -20, scale: 0.97 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -20, scale: 0.97 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="chud-panel-header">
                                    <h3 className="chud-panel-title">{SECTION_TABS.find(t => t.key === openSection)?.label}</h3>
                                </div>

                                <div ref={panelScrollRef} className="chud-panel-body configurator-scrollbar">
                                    {/* ── Vehicle section ── */}
                                    {openSection === "vehicle" && (
                                        <div className="chud-section-content">
                                            <div className="grid grid-cols-3 gap-2">
                                                {carBrands.map((brand) => {
                                                    const isActiveBrand = selectedBrand === brand.name;
                                                    const needsLightTile = LIGHT_TILE_BRANDS.has(brand.name);

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
                                                            <div className={`chud-brand-tile-inner${needsLightTile ? " chud-brand-tile-inner--light" : ""}`}>
                                                                <Image
                                                                    src={brand.logoPath}
                                                                    alt={brand.name}
                                                                    width={90}
                                                                    height={46}
                                                                    className="h-[42px] w-auto object-contain"
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
                                            <div className="mb-4 grid grid-cols-3 gap-2">
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
                                                                className="h-[200px] w-full object-contain"
                                                            />
                                                        </div>
                                                        <div className="chud-wheel-card-name">{wheel.id}</div>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        </div>
                                    )}

                                    {/* ── 3D Cars section ── */}
                                    {openSection === "cars" && (
                                        <div className="chud-section-content">
                                            <div className="chud-subsection-label">Brand / Model</div>
                                            <div className="configurator-scrollbar max-h-[420px] space-y-2 overflow-y-auto pr-1">
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

                                    {/* ── Rim Finish section ── */}
                                    {openSection === "finish" && (
                                        <div className="chud-section-content">
                                            <div className="chud-subsection-label">Signature Finishes</div>
                                            <div className="grid grid-cols-3 gap-2">
                                                {SIGNATURE_FINISHES.map((finish) => {
                                                    const isActive = selectedFinishColor.toLowerCase() === finish.hex.toLowerCase();
                                                    return (
                                                        <button
                                                            key={finish.name}
                                                            onClick={() => onSelectFinishColor(finish.hex)}
                                                            className={`chud-finish-swatch${isActive ? " chud-finish-swatch--active" : ""}`}
                                                        >
                                                            <span
                                                                className="chud-finish-color"
                                                                style={{ background: finish.hex }}
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
                                                    <span className="font-mono text-[12px] tracking-[0.08em] text-white/55">{selectedFinishColor.toUpperCase()}</span>
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
                                                                            onSelectFinishColor(hslToHex(nextHue, 100, 50));
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
                </>
            )}
        </AnimatePresence>
    );
}
