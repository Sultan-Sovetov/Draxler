"use client";

import Image from "next/image";
import { useMemo, useState, useEffect, useRef, type WheelEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette } from "lucide-react";
import { CAR_RIM_MAPPINGS } from "../data/car-rims-mesh";

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

const WHEEL_MODELS = [
    { id: "DRX-101", image: "/logos_names/DRX_101.png", rimUrl: "/car-models/rims/vossen_1_front.glb" },
    { id: "DRX-102", image: "/logos_names/DRX_102.png", rimUrl: "/car-models/rims/vossen_2_front.glb" },
    { id: "DRX-103", image: "/logos_names/DRX_103.png", rimUrl: "/car-models/rims/vossen_3_angle.glb" },
    { id: "DRX-291", image: "/catalog/DRX_291_front-Photoroom.png", rimUrl: "/car-models/rims/DRX_291_front.glb" },
    { id: "DRX-292", image: "/catalog/DRX_292_front-Photoroom.png", rimUrl: "/car-models/rims/DRX_292_front.glb" },
    { id: "DRX-293", image: "/catalog/DRX_293_front-Photoroom.png", rimUrl: "/car-models/rims/DRX_293_front.glb" },
    { id: "DRX-295", image: "/catalog/DRX_295_front-Photoroom.png", rimUrl: "/car-models/rims/DRX_295_front.glb" },
    { id: "DRX-296", image: "/catalog/DRX_296_front-Photoroom.png", rimUrl: "/car-models/rims/DRX_296_front.glb" },
    { id: "DRX-297", image: "/catalog/DRX_297_front-Photoroom.png", rimUrl: "/car-models/rims/DRX_297_front.glb" },
    { id: "DRX-298", image: "/catalog/DRX_298_front-Photoroom.png", rimUrl: "/car-models/rims/DRX_298_angle.glb" },
    { id: "DRX-299", image: "/catalog/DRX_299_front-Photoroom.png", rimUrl: "/car-models/rims/DRX_299_angle.glb" },
    { id: "DRX-391", image: "/catalog/DRX_391_front-Photoroom.png", rimUrl: "/car-models/rims/DRX_391_front.glb" },
    { id: "DRX-393", image: "/catalog/DRX_393_front-Photoroom.png", rimUrl: "/car-models/rims/DRX_393_front.glb" },
    { id: "DRX-397", image: "/catalog/DRX_397_front-Photoroom.png", rimUrl: "/car-models/rims/DRX_397_front.glb" },
];

const WHEEL_CATEGORIES = ["Off-Road", "VIP", "Sport"] as const;

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
    const [selectedWheelModel, setSelectedWheelModel] = useState<string>("DRX-101");
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
        () => WHEEL_MODELS.map((wheel) => ({ ...wheel, category: selectedWheelCategory })),
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

    return (
        <AnimatePresence>
            {active && (
                <>
                    <motion.aside
                        className="fixed bottom-6 right-4 top-24 z-30 w-[400px] overflow-hidden rounded-[10px] border border-white/10 bg-[#111]/80 text-white backdrop-blur-xl"
                        onWheelCapture={handlePanelWheel}
                        initial={{ opacity: 0, x: 56 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 56 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="flex h-full flex-col">
                            <div ref={panelScrollRef} className="configurator-scrollbar flex-1 overflow-x-hidden overflow-y-auto px-6 pb-6 pt-8">
                                <button
                                    className="flex w-full items-center justify-between border-b border-white/10 pb-4 text-left"
                                    onClick={() => setOpenSection((prev) => (prev === "vehicle" ? null : "vehicle"))}
                                >
                                    <span className="text-[11px] font-medium uppercase tracking-[0.36em] text-white/80">1. Vehicle</span>
                                    <span className="text-white/60">{openSection === "vehicle" ? "−" : "+"}</span>
                                </button>

                                <AnimatePresence initial={false}>
                                    {openSection === "vehicle" && (
                                        <motion.div
                                            key="vehicle"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.24, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="grid grid-cols-3 gap-2 pt-4">
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
                                                            className={`rounded-lg border p-2 transition ${
                                                                isActiveBrand
                                                                    ? "border-white/60 bg-white/10"
                                                                    : "border-white/10 bg-white/[0.03] hover:border-white/30"
                                                            }`}
                                                            aria-label={`Select ${brand.name}`}
                                                        >
                                                            <div
                                                                className={`flex h-[58px] items-center justify-center rounded-md ${
                                                                    needsLightTile ? "bg-white/90" : "bg-transparent"
                                                                }`}
                                                            >
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

                                            <div className="mt-4 space-y-2">
                                                <div className="text-[10px] uppercase tracking-[0.32em] text-white/50">Models</div>
                                                {(activeBrand?.name === openVehicleBrand ? activeBrand.models : []).map((model) => {
                                                    const isActiveModel = selectedCarId === model.id;
                                                    const cleanedLabel = stripBracketDetails(model.displayName);

                                                    return (
                                                        <button
                                                            key={model.id}
                                                            className={`w-full rounded-md border px-3 py-2 text-left text-sm tracking-[0.12em] transition ${
                                                                isActiveModel
                                                                    ? "border-white/60 bg-white/15 text-white"
                                                                    : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/35 hover:text-white"
                                                            }`}
                                                            onClick={() => {
                                                                onSelectCarModel(model);
                                                            }}
                                                        >
                                                            {cleanedLabel}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    className="mt-6 flex w-full items-center justify-between border-b border-white/10 pb-4 text-left"
                                    onClick={() => setOpenSection((prev) => (prev === "wheels" ? null : "wheels"))}
                                >
                                    <span className="text-[11px] font-medium uppercase tracking-[0.36em] text-white/80">2. Wheels</span>
                                    <span className="text-white/60">{openSection === "wheels" ? "−" : "+"}</span>
                                </button>

                                <AnimatePresence initial={false}>
                                    {openSection === "wheels" && (
                                        <motion.div
                                            key="wheels"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.24, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pt-5">
                                                <div className="mb-4 grid grid-cols-3 gap-2">
                                                    {WHEEL_CATEGORIES.map((category) => (
                                                        <button
                                                            key={category}
                                                            className={`rounded-md border px-2 py-2 text-[11px] uppercase tracking-[0.16em] transition ${
                                                                selectedWheelCategory === category
                                                                    ? "border-white/70 bg-white/15 text-white"
                                                                    : "border-white/10 bg-white/[0.03] text-white/65 hover:border-white/30 hover:text-white"
                                                            }`}
                                                            onClick={() => {
                                                                setSelectedWheelCategory(category);
                                                                setSelectedWheelModel("DRX-101");
                                                                onSelectWheelModel("DRX-101");
                                                            }}
                                                        >
                                                            {category}
                                                        </button>
                                                    ))}
                                                </div>

                                                <motion.div
                                                    key={selectedWheelCategory}
                                                    className="mx-auto w-[98%] space-y-3"
                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.22, ease: "easeOut" }}
                                                >
                                                    {/* Factory Wheels reset */}
                                                    <button
                                                        className={`mb-2 w-full rounded-md border px-3 py-2 text-center text-[11px] uppercase tracking-[0.18em] transition ${
                                                            selectedRimUrl === null
                                                                ? "border-white/65 bg-white/15 text-white"
                                                                : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/35 hover:text-white"
                                                        }`}
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
                                                            className={`w-full rounded-xl border p-3 text-left transition ${
                                                                selectedWheelModel === wheel.id && selectedRimUrl === wheel.rimUrl
                                                                    ? "border-white/70 bg-white/14"
                                                                    : "border-white/10 bg-white/[0.02] hover:border-white/35"
                                                            }`}
                                                            onClick={() => {
                                                                setSelectedWheelModel(wheel.id);
                                                                onSelectWheelModel(wheel.id);
                                                                onSelectRimUrl(wheel.rimUrl);
                                                            }}
                                                        >
                                                            <div className="flex h-[235px] w-full items-center justify-center">
                                                                <Image
                                                                    src={wheel.image}
                                                                    alt={wheel.id}
                                                                    width={360}
                                                                    height={235}
                                                                    className="h-[235px] w-full object-contain"
                                                                />
                                                            </div>
                                                            <div className="mt-2 text-base uppercase tracking-[0.2em] text-white/92">{wheel.id}</div>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    className="mt-6 flex w-full items-center justify-between border-b border-white/10 pb-4 text-left"
                                    onClick={() => setOpenSection((prev) => (prev === "cars" ? null : "cars"))}
                                >
                                    <span className="text-[11px] font-medium uppercase tracking-[0.36em] text-white/80">3. 3D CARS</span>
                                    <span className="text-white/60">{openSection === "cars" ? "−" : "+"}</span>
                                </button>

                                <AnimatePresence initial={false}>
                                    {openSection === "cars" && (
                                        <motion.div
                                            key="cars"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.24, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pt-5">
                                                <div className="mb-4 text-[10px] uppercase tracking-[0.32em] text-white/50">Brand / Model</div>
                                                <div className="configurator-scrollbar max-h-[360px] space-y-2 overflow-y-auto pr-1">
                                                    {carGroups.map((group) => {
                                                        const isOpen = openCarBrand === group.brand;

                                                        return (
                                                            <div key={group.brand} className="rounded-md border border-white/10 bg-white/[0.02]">
                                                                <button
                                                                    className="flex w-full items-center justify-between px-3 py-2 text-left"
                                                                    onClick={() => setOpenCarBrand((prev) => (prev === group.brand ? null : group.brand))}
                                                                >
                                                                    <span className="text-[11px] uppercase tracking-[0.22em] text-white/85">{group.brand}</span>
                                                                    <span className="text-white/55">{isOpen ? "−" : "+"}</span>
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
                                                                            <div className="space-y-1 border-t border-white/10 px-2 py-2">
                                                                                {group.models.map((car) => {
                                                                                    const isSelected = selectedCarId === car.id;
                                                                                    return (
                                                                                        <button
                                                                                            key={car.id}
                                                                                            className={`w-full rounded-md border px-3 py-2 text-left text-xs uppercase tracking-[0.14em] transition ${
                                                                                                isSelected
                                                                                                    ? "border-white/60 bg-white/15 text-white"
                                                                                                    : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/35 hover:text-white"
                                                                                            }`}
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
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    className="mt-6 flex w-full items-center justify-between border-b border-white/10 pb-4 text-left"
                                    onClick={() => setOpenSection((prev) => (prev === "finish" ? null : "finish"))}
                                >
                                    <span className="text-[11px] font-medium uppercase tracking-[0.36em] text-white/80">4. R I M  F I N I S H</span>
                                    <span className="text-white/60">{openSection === "finish" ? "−" : "+"}</span>
                                </button>

                                <AnimatePresence initial={false}>
                                    {openSection === "finish" && (
                                        <motion.div
                                            key="finish"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.24, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="space-y-4 pt-5">
                                                <div>
                                                    <div className="mb-3 text-[10px] uppercase tracking-[0.32em] text-white/50">Signature Rim Finishes</div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {SIGNATURE_FINISHES.map((finish) => {
                                                            const isActive = selectedFinishColor.toLowerCase() === finish.hex.toLowerCase();
                                                            return (
                                                                <button
                                                                    key={finish.name}
                                                                    onClick={() => onSelectFinishColor(finish.hex)}
                                                                    className={`rounded-md border p-2 text-left transition ${
                                                                        isActive
                                                                            ? "border-white/65 bg-white/12"
                                                                            : "border-white/10 bg-white/[0.03] hover:border-white/35"
                                                                    }`}
                                                                >
                                                                    <span
                                                                        className="mb-2 block h-6 w-full rounded-sm border border-white/20"
                                                                        style={{ background: finish.hex }}
                                                                    />
                                                                    <span className="block text-[10px] uppercase tracking-[0.12em] text-white/80">{finish.name}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                                                    <button
                                                        onClick={() => setShowCustomFinish((prev) => !prev)}
                                                        className="flex w-full items-center justify-between"
                                                    >
                                                        <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/80">
                                                            <Palette size={14} />
                                                            Custom
                                                        </span>
                                                        <span className="font-mono text-[12px] tracking-[0.08em] text-white/65">{selectedFinishColor.toUpperCase()}</span>
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
                                                                        className="h-10 w-full rounded-md border border-white/15"
                                                                        style={{
                                                                            background: customFinishHex,
                                                                        }}
                                                                    />
                                                                    <label className="block text-[10px] uppercase tracking-[0.18em] text-white/50">
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

                                                                    <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-3 py-2">
                                                                        <span className="text-[10px] uppercase tracking-[0.22em] text-white/45">Live Color</span>
                                                                        <div className="flex items-center gap-2">
                                                                            <span
                                                                                className="h-4 w-4 rounded-full border border-white/25"
                                                                                style={{ background: customFinishHex }}
                                                                            />
                                                                            <span className="font-mono text-[12px] tracking-[0.08em] text-white/75">{customFinishHex}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                                                    {signatureMatch ? `Selected: ${signatureMatch.name}` : "Selected: Custom Finish"}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="border-t border-white/10 p-6">
                                <button
                                    className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-black transition hover:bg-white/90"
                                    onClick={onOpenFinalize}
                                >
                                    Finalize Configuration
                                </button>
                            </div>
                        </div>
                    </motion.aside>

                    <motion.div
                        className="pointer-events-none absolute bottom-6 left-6 z-20 flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-black/55"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            transition: { delay: 0.5, duration: 0.6 },
                        }}
                        exit={{ opacity: 0, y: 10 }}
                    >
                        <span className="h-[5px] w-[5px] rounded-full bg-black/30" />
                        <span>Drag to Rotate</span>
                        <span className="opacity-45">|</span>
                        <span>Scroll to Zoom</span>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
