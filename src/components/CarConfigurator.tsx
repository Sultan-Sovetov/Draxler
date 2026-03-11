"use client";

import {
    Suspense,
    useRef,
    useState,
    useEffect,
    useMemo,
    useCallback,
    useTransition,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
    useGLTF,
    Environment,
    MeshReflectorMaterial,
    SoftShadows,
    OrbitControls,
    Html,
} from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, LoaderCircle, X } from "lucide-react";
import { Leva, useControls, button, folder } from "leva";
import ConfiguratorHUD from "./ConfiguratorHUD";
import AeroLoader from "./AeroLoader";
import { CAR_RIM_MAPPINGS } from "../data/car-rims-mesh";
import { CAR_PAINT_EXCLUSIONS } from "../data/car-paint-exclusions";
import { CAR_CALIBRATION_DATA } from "../data/CarCalibrationData";
import { applyMaterialFixes, logMeshInventory } from "../data/car-material-fixes";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Camera positions ─── */
const CAM_START: [number, number, number] = [0, 12, 2]; // top-down
const CAM_END: [number, number, number] = [6, 3, 10]; // front/side eye-level
const LOOK_AT = new THREE.Vector3(0, 0.5, 0);

/* ─── Scene colours ─── */
const BG = "#f2f2f5";
const SUN = "#fff0dd";
const IS_DEV = true;

type Car3DOption = {
    id: string;
    label: string;
    modelPath: string;
    displayName: string;
};

type Car3DBrandGroup = {
    brand: string;
    models: Car3DOption[];
};

type Car3DGroupSource = {
    brand: string;
    models: Array<{
        name: string;
        file: string;
    }>;
};

const CAR_3D_GROUP_SOURCES: Car3DGroupSource[] = [
    {
        brand: "Mercedes-Benz",
        models: [
          //  { name: "G-Class AMG 63 V2 (2020)", file: "mercedes/2020_mercedes-benz_g-class_amg_g_63.glb" },
                        { name: "G-Class 63 AMG", file: "mercedes/2025_mercedes-benz_g-class_amg_g_63.glb" },
          //  { name: "S-Class V1", file: "mercedes/Mercedes_Benz_S_class_V1.glb" },
          //norm { name: "S-Class V2", file: "mercedes/Mercedes_Benz_S_class_V2.glb" },
                 //       { name: "S-Class Brabus 850", file: "mercedes/s_brabus_850.glb" },
                        { name: "S-Class W223", file: "mercedes/mersedes-benz_s-class_w223_brabus_850 (1).glb" },
        ],
    },
    {
        brand: "Ford",
        models: [
            { name: "Mustang RTR (2015)", file: "ford/2015_ford_mustang_rtr.glb" },
            { name: "F-150 (2024)", file: "ford/2024_ford_f-150_raptor_r.glb" },
        ],
    },

    {
            brand: "Ferrari",
        models: [
            { name: "SF90", file: "ferrari/ferrari_sf90_stradale.glb" },
            { name: "GTC4 - lusso", file: "ferrari/ferrari_gtc4_lusso.glb" },
        ],
    },
    {
        brand: "Chevrolet",
        models: [
            { name: "Camaro", file: "chevrolet/2019_chevrolet_camaro-v1.glb" },
            { name: "Corvette C8 Stingray (2019)", file: "chevrolet/2019_chevrolet_corvette_c8_stingray.glb" },
        ],
    },
    {
        brand: "Dodge / RAM",
        models: [
           // { name: "Challenger 392 Scat Pack (2015)", file: "dodge/2015_dodge_challenger_392_hemi_scat_pack_shaker.glb" },
            { name: "Challenger SRT Hellcat", file: "dodge/dodge_challenger_srt_hellcat__free.glb" },
            { name: "RAM 1500 TRX (2021)", file: "dodge/2021_ram_1500_trx.glb" },
            { name: "RAM 1500 TRX V2 (2021)", file: "dodge/2021_ram_1500_trx (1).glb" },
        ],
    },
    {
        brand: "Porsche",
        models: [
           // { name: "Cayenne Turbo GT (2022)", file: "porsche/2022_porsche_cayenne_turbo_gt.glb" },
            { name: "Cayenne (2020)", file: "porsche/porsche_cayenne.glb" },
          //  { name: "911 V1", file: "porsche/porsche_911_V1.glb" },
           // { name: "911 V1 (Uncompressed)", file: "porsche/porsche_911_V1_(uncompressed).glb" },
            { name: "911 V2 (Uncompressed)", file: "porsche/porsche_911_V2_(uncompressed).glb" },
           // { name: "911 V2 Turbo S", file: "porsche/porsche_911_turbo_s.glb" },
            { name: "911 Turbo S", file: "porsche/2021_porsche_911_turbo_s_992.glb" },
        ],
    },
    {
        brand: "BMW",
        models: [
          //  { name: "X5 M G05", file: "bmw/bmw_x5_m_g05.glb" },
          //  { name: "5 Series V1", file: "bmw/bmw_5-v1.glb" },
            { name: "M5", file: "bmw/bmw_m5_2024.glb" },
          //  { name: "X5 (Uncompressed)", file: "bmw/bmw x5 new.glb" },
           // { name: "X5 M (Uncompressed)", file: "bmw/bmw_X5_M_(uncompressed).glb" },
        ],
    },
    {
        brand: "Lamborghini",
        models: [
           // { name: "Huracán", file: "lamborghini/lamborghini_huracan.glb" },
            { name: "Huracán EVO", file: "lamborghini/2019_lamborghini_huracan_evo.glb" },
           // { name: "Urus (2019)", file: "lamborghini/2019_lamborghini_urus.glb" },
           // { name: "Urus SE (2025)", file: "lamborghini/2025_lamborghini_urus_se.glb" },
        ],
    },
    {
        brand: "McLaren",
        models: [
            { name: "765LT", file: "mclaren/2022_mclaren_765lt.glb" },
            { name: "720 (Uncompressed)", file: "mclaren/mclaren_720_(uncompressed).glb" },
            { name: "720S udalit", file: "mclaren/2017_mclaren_720s.glb" },
           // { name: "720S v2 udalit", file: "mclaren/2017_mclaren720.glb" },
        ],
    },
    {
        brand: "Lexus",
        models: [
            { name: "LC 500 (2017)", file: "lexus/2017_lexus_lc_500_model.glb" },
            { name: "GX 550h Overtrail (2023)", file: "lexus/2023_lexus_gx_550_h_overtrail.glb" },
            { name: "LX 700h", file: "lexus/2025_lexus_lx700h.glb" },
        ],
    },
    {
        brand: "Audi",
        models: [
            { name: "A6 C8 Limousine", file: "audi/audi_a6_c8_limousine.glb" },
            { name: "A6 C8 Limousine V2", file: "audi/audi_a6_c8_limousine (1).glb" },
            { name: "RS6", file: "audi/audi.glb" },
           // { name: "RS5", file: "audi/2021_audi_rs5_sportback.glb" },
            { name: "R8", file: "audi/2019_audi_r8_coupe.glb" },
        ],
    },
    {
        brand: "Cadillac",
        models: [
            { name: "Escalade Premium (2021)", file: "cadillac/2021_cadillac_escalade_premium.glb" },
            { name: "Escalade Premium Luxury (2021)", file: "cadillac/2021_cadillac_escalade_premium_luxury.glb" },
        ],
    },
    {
        brand: "Rolls-Royce",
        models: [
            { name: "Ghost", file: "rr/rolls_royce_ghost_new.glb" },
        ],
    },
    {
        brand: "Land Rover",
        models: [
            { name: "Defender", file: "landrover/land_rover_defender-v1.glb" },
        ],
    },

];

const CAR_3D_GROUPS: Car3DBrandGroup[] = CAR_3D_GROUP_SOURCES.map((group, groupIndex) => ({
    brand: group.brand,
    models: group.models.map((model, modelIndex) => ({
        id: `car-${groupIndex + 1}-${modelIndex + 1}`,
        label: model.name,
        modelPath: `/car-models/${model.file}`,
        displayName: model.name,
    })),
}));

const CAR_3D_OPTIONS: Car3DOption[] = CAR_3D_GROUPS.flatMap((group) => group.models);

// Hardcoded default: Mercedes G-Class AMG 63 (2025)
const DEFAULT_CAR = CAR_3D_OPTIONS.find(
    (car) => car.modelPath === "/car-models/mercedes/2025_mercedes-benz_g-class_amg_g_63.glb"
) ?? CAR_3D_OPTIONS[0];

/**
 * Applies rim finish from an encoded string: "hex|metalness|roughness|clearcoat"
 * Falls back to metallic defaults if only a bare hex is provided.
 * When clearcoat > 0 and the material is MeshStandardMaterial, it upgrades
 * it to MeshPhysicalMaterial so clearcoat works.
 */
const applyRimFinish = (mesh: THREE.Mesh, matIndex: number, encoded: string) => {
    const parts = encoded.split("|");
    const hex = parts[0];
    const metalness = parts[1] !== undefined ? parseFloat(parts[1]) : 0.8;
    const roughness = parts[2] !== undefined ? parseFloat(parts[2]) : 0.2;
    const clearcoat = parts[3] !== undefined ? parseFloat(parts[3]) : 0;

    let mat = Array.isArray(mesh.material) ? mesh.material[matIndex] : mesh.material;
    if (!mat) return;

    const std = mat as THREE.MeshStandardMaterial;
    if (!std.isMeshStandardMaterial) return;

    // Upgrade to MeshPhysicalMaterial when clearcoat is requested
    if (clearcoat > 0 && !(mat as THREE.MeshPhysicalMaterial).isMeshPhysicalMaterial) {
        const phys = new THREE.MeshPhysicalMaterial();
        phys.copy(std);
        phys.clearcoat = clearcoat;
        phys.clearcoatRoughness = 0.05;
        if (Array.isArray(mesh.material)) {
            mesh.material[matIndex] = phys;
        } else {
            mesh.material = phys;
        }
        mat = phys;
    }

    const target = mat as THREE.MeshPhysicalMaterial;
    target.color?.set(hex);
    target.metalness = metalness;
    target.roughness = roughness;

    if (target.isMeshPhysicalMaterial) {
        target.clearcoat = clearcoat;
        target.clearcoatRoughness = clearcoat > 0 ? 0.05 : 0;
    }

    mat.needsUpdate = true;
};

type RimMapping = {
    FL: string[];
    RL: string[];
    FR: string[];
    RR: string[];
};

type RimCalibration = {
    scale: number;
    offsetY: number;
    rotYLeft: number;
    rotYRight: number;
    offsetXLeft: number;
    offsetXRight: number;
    offsetZFront: number;
    offsetZRear: number;
    rimFile?: string | null;
};

// CAR_RIM_MAPPINGS is now imported from ../data/car-rims-mesh.js

const DEFAULT_RIM_CALIBRATION: RimCalibration = {
    scale: 0.88,
    offsetY: 0,
    rotYLeft: 180,
    rotYRight: 0,
    offsetXLeft: 0,
    offsetXRight: 0,
    offsetZFront: 0,
    offsetZRear: 0,
    rimFile: null,
};

export const CAR_RIM_CALIBRATION: Record<string, RimCalibration> = {
    // "2025_mercedes-benz_g-class_amg_g_63.glb": {
    //     rimFile: "vossen_1_front.glb",
    //     scale: 0.88,
    //     offsetY: 0,
    //     rotYLeft: 180,
    //     rotYRight: 0,
    //     offsetXLeft: 0,
    //     offsetXRight: 0,
    //     offsetZFront: 0,
    //     offsetZRear: 0,
    // },
};

const CAR_MODEL_GROUND_Y_OFFSETS: Record<string, number> = {
    "audi_a6_c8_limousine.glb": -2.75,
    "audi_a6_c8_limousine (1).glb": -2.75,
};

const HUB_MESHES_TO_REMOVE = ["hub_lf_high", "hub_lf_medium", "hub_lf_low", "hub_lf_very_low"] as const;

/* ================================================================== */
/*  RimInjector – hides factory rims, attaches custom rim clones      */
/* ================================================================== */
function RimInjector({
    rimUrl,
    rimColor,
    modelUrl,
    modelScene,
    rimCalibration,
    isDev,
}: {
    rimUrl: string;
    rimColor: string;
    modelUrl: string;
    modelScene: THREE.Object3D;
    rimCalibration: RimCalibration;
    isDev: boolean;
}) {
    const { scene: rimSourceScene } = useGLTF(rimUrl, true);
    const injectedRimsRef = useRef<Array<{
        mesh: THREE.Object3D;
        baseScale: number;
        basePosition: THREE.Vector3;
        baseRotation: THREE.Euler;
        isLeft: boolean;
        isFront: boolean;
        swapXZ: boolean;
    }>>([]);

    useFrame(() => {
        if (!isDev) return;

        injectedRimsRef.current.forEach(({ mesh, baseScale, basePosition, baseRotation, isLeft, isFront, swapXZ }) => {
            const offsetX = isLeft ? rimCalibration.offsetXLeft : rimCalibration.offsetXRight;
            const rotY = isLeft ? rimCalibration.rotYLeft : rimCalibration.rotYRight;
            const offsetZ = isFront ? rimCalibration.offsetZFront : rimCalibration.offsetZRear;

            mesh.scale.setScalar(baseScale * rimCalibration.scale);
            // For swapXZ models, track-width slider (X) moves along Z and wheelbase slider (Z) moves along X
            mesh.position.set(
                basePosition.x + (swapXZ ? offsetZ : offsetX),
                basePosition.y + rimCalibration.offsetY,
                basePosition.z + (swapXZ ? offsetX : offsetZ)
            );

            mesh.rotation.copy(baseRotation);
            mesh.rotation.y = THREE.MathUtils.degToRad(rotY);
        });
    });

    useEffect(() => {
        if (!rimSourceScene || !modelScene) return;

        const fileName = modelUrl.split("/").pop() ?? "";
        const targetRims = (CAR_RIM_MAPPINGS as Record<string, RimMapping>)[fileName];
        const calibData = CAR_CALIBRATION_DATA[fileName];
        const forceFallback = calibData?.forceBboxFallback === true;

        // Ensure world matrices are current
        modelScene.updateWorldMatrix(true, true);

        // ── Compute car bounding box for fallback positioning + scale sanity ──
        const carBox = new THREE.Box3().setFromObject(modelScene);
        const carSize = new THREE.Vector3();
        carBox.getSize(carSize);
        const carCenter = new THREE.Vector3();
        carBox.getCenter(carCenter);
        const carMaxDim = Math.max(carSize.x, carSize.y, carSize.z);

        // Bbox-derived fallback wheel positions (~42% track width, ~38% wheelbase)
        // Some models are oriented 90° differently (Z = track width, X = wheelbase)
        const swapXZ = calibData?.swapFallbackXZ === true;
        const fbHalfTrack = (swapXZ ? carSize.z : carSize.x) * 0.42;
        const fbHalfWheelbase = (swapXZ ? carSize.x : carSize.z) * 0.38;
        const fbWheelY = carBox.min.y;
        const fallbackPositions: Record<string, THREE.Vector3> = swapXZ ? {
            FL: new THREE.Vector3(carCenter.x + fbHalfWheelbase, fbWheelY, carCenter.z - fbHalfTrack),
            FR: new THREE.Vector3(carCenter.x + fbHalfWheelbase, fbWheelY, carCenter.z + fbHalfTrack),
            RL: new THREE.Vector3(carCenter.x - fbHalfWheelbase, fbWheelY, carCenter.z - fbHalfTrack),
            RR: new THREE.Vector3(carCenter.x - fbHalfWheelbase, fbWheelY, carCenter.z + fbHalfTrack),
        } : {
            FL: new THREE.Vector3(carCenter.x - fbHalfTrack, fbWheelY, carCenter.z + fbHalfWheelbase),
            FR: new THREE.Vector3(carCenter.x + fbHalfTrack, fbWheelY, carCenter.z + fbHalfWheelbase),
            RL: new THREE.Vector3(carCenter.x - fbHalfTrack, fbWheelY, carCenter.z - fbHalfWheelbase),
            RR: new THREE.Vector3(carCenter.x + fbHalfTrack, fbWheelY, carCenter.z - fbHalfWheelbase),
        };
        // Heuristic rim diameter: ~15% of car's longest dimension
        const heuristicWheelDiameter = carMaxDim * 0.15;

        if (IS_DEV) {
            console.log(`[RimInjector] ${fileName}: carSize(${carSize.x.toFixed(2)}, ${carSize.y.toFixed(2)}, ${carSize.z.toFixed(2)}) maxDim=${carMaxDim.toFixed(2)} heurWheel=${heuristicWheelDiameter.toFixed(3)} forceFallback=${forceFallback}`);
        }

        // Always iterate all 4 positions — even if mapping is empty/missing
        const targets: Array<keyof RimMapping> = ["FL", "RL", "FR", "RR"];
        const hiddenFactoryRims: THREE.Object3D[] = [];
        injectedRimsRef.current = [];

        // ── Per-car substring-based factory hiding (e.g. Lexus GX with unicode names) ──
        // Sanitize both the scene name and patterns (strip colons + dots) before matching.
        const hidePatterns = calibData?.hideFactoryBySubstrings;
        if (hidePatterns?.length) {
            const sanitizedPatterns = hidePatterns.map((p) => p.replace(/[:.]/g, ""));
            modelScene.traverse((child: THREE.Object3D) => {
                if (!child.name) return;
                const sanitizedName = child.name.replace(/[:.]/g, "");
                if (sanitizedPatterns.some((sub) => sanitizedName.includes(sub))) {
                    child.visible = false;
                    hiddenFactoryRims.push(child);
                }
            });
            if (IS_DEV) {
                console.log(`[RimHidePatterns] ${fileName}: hid ${hiddenFactoryRims.length} factory meshes by substring`);
            }
        }

        // Helper: colon/dot-tolerant name lookup. Some GLB exporters (FBX→GLB) leave
        // colons and dots in node names (e.g. "L:ALLgx.gltfScene...") while mappings
        // may have them stripped.  Try exact match first, then fall back to sanitized comparison.
        const findByName = (name: string): THREE.Object3D | null => {
            const exact = modelScene.getObjectByName(name);
            if (exact) return exact;

            const sanitized = name.replace(/[:.]/g, "");
            let found: THREE.Object3D | null = null;
            modelScene.traverse((child: THREE.Object3D) => {
                if (!found && child.name.replace(/[:.]/g, "") === sanitized) {
                    found = child;
                }
            });
            if (IS_DEV && found) {
                console.log(`[RimName] "${name}" not found by exact match → matched "${(found as THREE.Object3D).name}" (sanitized)`);
            }
            return found;
        };

        targets.forEach((position) => {
            const meshNames = targetRims?.[position] ?? [];

            // 1. Hide ALL factory parts listed in the mapping
            meshNames.forEach((name) => {
                const part = findByName(name);
                if (part) {
                    part.visible = false;
                    hiddenFactoryRims.push(part);
                }
            });

            // 2. Try to find the anchor mesh (first element)
            const anchorName = meshNames.length > 0 ? meshNames[0] : null;
            const factoryRim = anchorName ? findByName(anchorName) : null;

            const isFL = position === "FL";
            const isFR = position === "FR";
            const isRL = position === "RL";
            const isLeftSide = isFL || isRL;
            const isFrontSide = isFL || isFR;

            // Clone the custom rim
            const clonedCustomRim = clone(rimSourceScene);
            clonedCustomRim.traverse((c: THREE.Object3D) => {
                const mesh = c as THREE.Mesh;
                if (!mesh.isMesh) return;
                mesh.geometry.center();
            });

            // Measure custom rim (needed for both paths)
            const customSize = new THREE.Vector3();
            new THREE.Box3().setFromObject(clonedCustomRim).getSize(customSize);
            const customDiameter = Math.max(customSize.y, customSize.z);

            let baseScaleFactor = 1;
            let basePosition = new THREE.Vector3();
            const baseRotation = new THREE.Euler();
            let attachParent: THREE.Object3D = modelScene;

            if (!forceFallback && factoryRim && factoryRim.parent) {
                /* ── PATH A: Anchor found — use factory rim position ── */
                // Always attach to modelScene (not factoryRim.parent) so that all
                // 4 rims share the same coordinate system. Some models (e.g. G63)
                // have per-wheel parent groups with different rotations/mirroring,
                // which causes Leva offsets to move in different world directions.
                attachParent = modelScene;

                const factoryBox = new THREE.Box3().setFromObject(factoryRim);
                const worldCenter = new THREE.Vector3();
                factoryBox.getCenter(worldCenter);
                basePosition = modelScene.worldToLocal(worldCenter.clone());

                const factorySize = new THREE.Vector3();
                factoryBox.getSize(factorySize);
                const factoryDiameter = Math.max(factorySize.y, factorySize.z);

                // Scale sanity: if the anchor is unreasonably small (< 5% of car),
                // it’s probably a logo/bolt/sub-component → use heuristic scale
                if (factoryDiameter > 0 && factoryDiameter >= carMaxDim * 0.05 && customDiameter > 0) {
                    baseScaleFactor = factoryDiameter / customDiameter;
                } else if (customDiameter > 0 && heuristicWheelDiameter > 0) {
                    baseScaleFactor = heuristicWheelDiameter / customDiameter;
                    if (IS_DEV) {
                        console.log(`[RimScale] ${fileName} ${position}: anchor too small (${factoryDiameter.toFixed(3)}), using heuristic scale`);
                    }
                }

                if (IS_DEV) {
                    console.log(`[RimAnchor] ${fileName} ${position}: factoryDiam=${factoryDiameter.toFixed(3)} customDiam=${customDiameter.toFixed(3)} baseScale=${baseScaleFactor.toFixed(3)} worldPos(${worldCenter.x.toFixed(3)},${worldCenter.y.toFixed(3)},${worldCenter.z.toFixed(3)})`);
                }

                // Compensate for attachment parent's world scale.
                // factoryDiameter is in world space (includes the outer <group scale={s}> etc.),
                // but when the rim is a child of attachParent it inherits that same scale chain.
                // Dividing by the world scale avoids double-counting.
                const parentWS_A = new THREE.Vector3();
                attachParent.getWorldScale(parentWS_A);
                if (parentWS_A.x > 0.0001) {
                    baseScaleFactor /= parentWS_A.x;
                }

                if (IS_DEV) {
                    console.log(`[RimScale] ${fileName} ${position}: parentWorldScale=${parentWS_A.x.toFixed(4)} compensated baseScale=${baseScaleFactor.toFixed(4)}`);
                }

                // NOTE: we do NOT copy factoryRim.rotation. Hub meshes in some models
                // (e.g. G63) have non-zero X/Z local rotations that tilt the custom rim.
                // Our calibration rotYLeft/rotYRight fully controls the Y orientation.
            } else {
                /* ── PATH B: No anchor — bbox-derived fallback positions ── */
                attachParent = modelScene;
                // Convert world-space fallback position to modelScene's local space
                basePosition = modelScene.worldToLocal(fallbackPositions[position].clone());

                // Heuristic scale from bounding box
                if (customDiameter > 0 && heuristicWheelDiameter > 0) {
                    baseScaleFactor = heuristicWheelDiameter / customDiameter;
                }

                // Compensate for attachment parent's world scale (same as PATH A)
                const parentWS_B = new THREE.Vector3();
                attachParent.getWorldScale(parentWS_B);
                if (parentWS_B.x > 0.0001) {
                    baseScaleFactor /= parentWS_B.x;
                }

                if (IS_DEV) {
                    console.log(
                        `[RimFallback] ${fileName} ${position}: no anchor → bbox pos(${basePosition.x.toFixed(2)}, ${basePosition.y.toFixed(2)}, ${basePosition.z.toFixed(2)}) scale=${baseScaleFactor.toFixed(3)} parentWS=${parentWS_B.x.toFixed(4)}`
                    );
                }
            }

            // Apply per-wheel corrections (baked into basePosition for both paths)
            const pwc = calibData?.perWheelCorrections?.[position];
            if (pwc) {
                basePosition.x += pwc.x ?? 0;
                basePosition.y += pwc.y ?? 0;
                basePosition.z += pwc.z ?? 0;
            }

            const finalPosition = basePosition.clone();

            if (IS_DEV) {
                const path = (!forceFallback && factoryRim) ? "A" : "B";
                console.log(`[Rim] ${position}: path=${path} baseScaleFactor=${baseScaleFactor.toFixed(3)} pos(${finalPosition.x.toFixed(2)},${finalPosition.y.toFixed(2)},${finalPosition.z.toFixed(2)})`);
            }

            let effectiveBaseScale = calibData?.scaleOverride ?? baseScaleFactor;
            // Per-wheel scale multiplier (e.g. front wheels slightly larger than rear)
            if (pwc?.scaleMul) {
                effectiveBaseScale *= pwc.scaleMul;
            }
            clonedCustomRim.scale.setScalar(effectiveBaseScale);
            clonedCustomRim.rotation.copy(baseRotation);
            clonedCustomRim.position.copy(finalPosition);

            clonedCustomRim.traverse((c: THREE.Object3D) => {
                const mesh = c as THREE.Mesh;
                if (!mesh.isMesh) return;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                const mats = Array.isArray(mesh.material)
                    ? mesh.material
                    : [mesh.material];
                mats.forEach((mat) => {
                    if ((mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
                        (mat as THREE.MeshStandardMaterial).envMapIntensity = 1.5;
                    }
                });
            });

            clonedCustomRim.userData.isInjectedRim = true;
            attachParent.add(clonedCustomRim);

            // Store basePosition (WITHOUT offsets) so useFrame can recompute correctly
            injectedRimsRef.current.push({
                mesh: clonedCustomRim,
                baseScale: effectiveBaseScale,
                basePosition: basePosition.clone(),
                baseRotation: baseRotation.clone(),
                isLeft: isLeftSide,
                isFront: isFrontSide,
                swapXZ: calibData?.swapFallbackXZ === true,
            });

            clonedCustomRim.userData = {
                ...clonedCustomRim.userData,
                isInjectedRim: true,
                isLeft: isLeftSide,
                isFront: isFrontSide,
                basePosition: basePosition.clone(),
            };
        });

        /* Cleanup ───────────────────────────────────────────── */
        return () => {
            const injectedRims: THREE.Object3D[] = [];
            modelScene.traverse((child: THREE.Object3D) => {
                if (child.userData?.isInjectedRim) {
                    injectedRims.push(child);
                }
            });

            injectedRims.forEach((rim) => {
                if (rim.parent) {
                    rim.parent.remove(rim);
                }

                rim.traverse((c: THREE.Object3D) => {
                    const mesh = c as THREE.Mesh;
                    if (!mesh.isMesh) return;
                    mesh.geometry?.dispose();
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach((material) => material.dispose());
                    } else {
                        mesh.material?.dispose();
                    }
                });
            });

            hiddenFactoryRims.forEach((rim) => {
                rim.visible = true;
            });

            injectedRimsRef.current = [];
        };
    }, [modelScene, modelUrl, rimSourceScene]);

    useEffect(() => {
        injectedRimsRef.current.forEach(({ mesh }) => {
            mesh.traverse((child: THREE.Object3D) => {
                const m = child as THREE.Mesh;
                if (!m.isMesh) return;
                const mats = Array.isArray(m.material) ? m.material : [m.material];
                mats.forEach((_mat, idx) => applyRimFinish(m, idx, rimColor));
            });
        });
    }, [rimColor]);

    return null;
}

/* ================================================================== */
/*  ScrollCamera – GSAP-driven camera that animates from top to front */
/* ================================================================== */
function ScrollCamera({
    scrollProgress,
    isActive,
}: {
    scrollProgress: React.MutableRefObject<number>;
    isActive: boolean;
}) {
    const { camera } = useThree();
    const lastT = useRef(-1);

    useFrame(() => {
        if (isActive) return; // OrbitControls take over

        const t = scrollProgress.current;
        if (t === lastT.current) return;
        lastT.current = t;

        camera.position.set(
            THREE.MathUtils.lerp(CAM_START[0], CAM_END[0], t),
            THREE.MathUtils.lerp(CAM_START[1], CAM_END[1], t),
            THREE.MathUtils.lerp(CAM_START[2], CAM_END[2], t)
        );
        camera.lookAt(LOOK_AT);
    });

    return null;
}

/* ================================================================== */
/*  CarModel – loads the GLB, scales & centres it                     */
/* ================================================================== */
function CarModel({
    modelUrl,
    rimColor,
    rimUrl,
}: {
    modelUrl: string;
    rimColor: string;
    rimUrl: string | null;
}) {
    const { scene } = useGLTF(modelUrl, true);
    const groupRef = useRef<THREE.Group>(null);
    const fileName = useMemo(() => modelUrl.split("/").pop() ?? "", [modelUrl]);
    const rimFileName = useMemo(() => rimUrl?.split("/").pop() ?? null, [rimUrl]);

    /* ── Clone scene & bake hard-fixes at creation time (runs ONCE per model) ── */
    const modelScene = useMemo(() => {
        const cloned = clone(scene);
        const fName = modelUrl.split("/").pop() ?? "";

        /* Phase 1 — Data-driven material fixes (chrome, glass, rubber, etc.) */
        const fixCount = applyMaterialFixes(cloned, fName);
        if (IS_DEV && fixCount > 0) {
            console.log(`[MaterialFix] ${fName}: ${fixCount} material(s) fixed`);
        }

        /* Phase 2 — Isolate paint-excluded materials + remove hub meshes */
        const exclusions = new Set(CAR_PAINT_EXCLUSIONS[fName] ?? []);
        const hubsToRemove: THREE.Object3D[] = [];

        cloned.traverse((child: THREE.Object3D) => {
            const mesh = child as THREE.Mesh;

            if (HUB_MESHES_TO_REMOVE.includes(child.name as (typeof HUB_MESHES_TO_REMOVE)[number])) {
                hubsToRemove.push(child);
            }

            if (!mesh.isMesh) return;

            // Skip meshes already fixed by the material fix system
            if (mesh.userData.__materialFixed) return;

            // Isolate excluded meshes: clone their materials so they no longer
            // share instances with body meshes (prevents paint leak permanently)
            if (exclusions.has(mesh.name)) {
                if (Array.isArray(mesh.material)) {
                    mesh.material = mesh.material.map((m) => m.clone());
                } else if (mesh.material) {
                    mesh.material = mesh.material.clone();
                }
                mesh.userData.__paintExcluded = true;
            }
        });

        hubsToRemove.forEach((hub) => {
            hub.removeFromParent();
        });

        /* Phase 3 — Nuclear hard-fix for Brabus tires (Object_356/Object_364)
           These meshes share a glass/transmission material from the GLB that
           survives cloning. We force-replace with a brand-new opaque material
           and kill every transparency-related property. */
        if (fName === "s_brabus_850.glb") {
            const BRABUS_TIRE_NAMES = new Set(["Object_356", "Object_364"]);
            const forceTireMaterial = () => {
                const mat = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(0x0a0a0a),
                    roughness: 0.85,
                    metalness: 0.0,
                    transparent: false,
                    opacity: 1.0,
                    depthWrite: true,
                    side: THREE.FrontSide,
                });
                mat.needsUpdate = true;
                return mat;
            };

            cloned.traverse((child: THREE.Object3D) => {
                if (!BRABUS_TIRE_NAMES.has(child.name)) return;

                // Fix the object itself if it's a mesh
                const mesh = child as THREE.Mesh;
                if (mesh.isMesh) {
                    mesh.material = forceTireMaterial();
                    mesh.visible = true;
                    mesh.userData.__materialFixed = true;
                    mesh.userData.__paintExcluded = true;
                }

                // Also fix any child meshes inside this object
                child.traverse((sub: THREE.Object3D) => {
                    const subMesh = sub as THREE.Mesh;
                    if (!subMesh.isMesh) return;
                    subMesh.material = forceTireMaterial();
                    subMesh.visible = true;
                    subMesh.userData.__materialFixed = true;
                    subMesh.userData.__paintExcluded = true;
                });
            });

            if (IS_DEV) {
                console.log("[HardFix] Brabus tires Object_356/Object_364 forced to opaque black rubber");
            }
        }

          /* Phase 3b — G-Class white tire fix (Object_601/615/643/629)
           Same issue: tire meshes have a broken white material. Force black. */
        if (fName === "mersedes-benz_s-class_w223_brabus_850 (1).glb") {
            const SCLASS_TIRE_NAMES = new Set(["Object_601", "Object_615", "Object_643", "Object_629"]);
            const forceTireMat = () => {
                const mat = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(0x0a0a0a),
                    roughness: 0.85,
                    metalness: 0.0,
                    transparent: false,
                    opacity: 1.0,
                    depthWrite: true,
                    side: THREE.FrontSide,
                });
                mat.needsUpdate = true;
                return mat;
            };

            cloned.traverse((child: THREE.Object3D) => {
                if (!SCLASS_TIRE_NAMES.has(child.name)) return;
                const mesh = child as THREE.Mesh;
                if (mesh.isMesh) {
                    mesh.material = forceTireMat();
                    mesh.visible = true;
                    mesh.userData.__materialFixed = true;
                    mesh.userData.__paintExcluded = true;
                }
                child.traverse((sub: THREE.Object3D) => {
                    const subMesh = sub as THREE.Mesh;
                    if (!subMesh.isMesh) return;
                    subMesh.material = forceTireMat();
                    subMesh.visible = true;
                    subMesh.userData.__materialFixed = true;
                    subMesh.userData.__paintExcluded = true;
                });
            });

            if (IS_DEV) {
                console.log("[HardFix] G-Class tires Object_601/615/643/629 forced to opaque black rubber");
            }
        }

        return cloned;
    }, [scene, modelUrl]);
    const defaultCalibration = useMemo(
        () => CAR_CALIBRATION_DATA[fileName] ?? DEFAULT_RIM_CALIBRATION,
        [fileName]
    );

    const [rimControls, setRimControls] = useControls(
        "Rim Calibration",
        () => ({
            Global: folder({
                scale: { value: defaultCalibration.scale, min: 0.1, max: 20.0, step: 0.01 },
                offsetY: { value: defaultCalibration.offsetY, min: -20, max: 20, step: 0.001 },
            }),
            Rotation_Y: folder({
                rotYLeft: { value: defaultCalibration.rotYLeft ?? 180, min: -360, max: 360, step: 1 },
                rotYRight: { value: defaultCalibration.rotYRight ?? 0, min: -360, max: 360, step: 1 },
            }),
            Track_Width_X: folder({
                offsetXLeft: { value: defaultCalibration.offsetXLeft ?? 0, min: -20, max: 20, step: 0.001 },
                offsetXRight: { value: defaultCalibration.offsetXRight ?? 0, min: -20, max: 20, step: 0.001 },
            }),
            Wheelbase_Z: folder({
                offsetZFront: { value: defaultCalibration.offsetZFront ?? 0, min: -20, max: 20, step: 0.001 },
                offsetZRear: { value: defaultCalibration.offsetZRear ?? 0, min: -20, max: 20, step: 0.001 },
            }),
            Actions: folder({
                "Copy Config": button((get) => {
                    if (!IS_DEV) return;

                    const carName = modelUrl.split("/").pop() ?? fileName;
                    const rimName = rimUrl ? rimUrl.split("/").pop() ?? "unknown_rim" : null;
                    const wheelPositions = (CAR_RIM_MAPPINGS as Record<string, RimMapping>)[carName] ?? null;

                    const global = {
                        scale: get("Rim Calibration.Global.scale") as number,
                        offsetY: get("Rim Calibration.Global.offsetY") as number,
                    };

                    const rotationY = {
                        rotYLeft: get("Rim Calibration.Rotation_Y.rotYLeft") as number,
                        rotYRight: get("Rim Calibration.Rotation_Y.rotYRight") as number,
                    };

                    const trackWidthX = {
                        offsetXLeft: get("Rim Calibration.Track_Width_X.offsetXLeft") as number,
                        offsetXRight: get("Rim Calibration.Track_Width_X.offsetXRight") as number,
                    };

                    const wheelbaseZ = {
                        offsetZFront: get("Rim Calibration.Wheelbase_Z.offsetZFront") as number,
                        offsetZRear: get("Rim Calibration.Wheelbase_Z.offsetZRear") as number,
                    };

                    const config = {
                        carModelFile: carName,
                        carModelPath: modelUrl,
                        rimFile: rimName,
                        rimPath: rimUrl,
                        wheelPositions,
                        devMode: {
                            Global: global,
                            Rotation_Y: rotationY,
                            Track_Width_X: trackWidthX,
                            Wheelbase_Z: wheelbaseZ,
                        },
                        calibration: {
                            rimFile: rimFileName,
                            ...global,
                            ...rotationY,
                            ...trackWidthX,
                            ...wheelbaseZ,
                        },
                    };

                    const exportString = `"${carName}": ${JSON.stringify(config, null, 2)},`;

                    navigator.clipboard.writeText(exportString).then(() => {
                        alert("📋 Config copied to clipboard!");
                        console.log("Copied:", exportString);
                    }).catch((error) => {
                        console.error("Failed to copy to clipboard:", error);
                        alert("⚠️ Clipboard copy failed. Check console.");
                    });
                }),
                "Log Meshes": button(() => {
                    if (!IS_DEV) return;
                    const entries = logMeshInventory(modelScene, fileName);
                    alert(`📊 ${entries.length} meshes logged to console. Template copied to clipboard.`);
                }),
            }),
        }),
        [defaultCalibration, fileName, rimFileName]
    );

    const activeRimCalibration = useMemo<RimCalibration>(() => {
        if (!IS_DEV) {
            return defaultCalibration;
        }

        return {
            rimFile: rimFileName,
            scale: rimControls.scale,
            offsetY: rimControls.offsetY,
            rotYLeft: rimControls.rotYLeft,
            rotYRight: rimControls.rotYRight,
            offsetXLeft: rimControls.offsetXLeft,
            offsetXRight: rimControls.offsetXRight,
            offsetZFront: rimControls.offsetZFront,
            offsetZRear: rimControls.offsetZRear,
        };
    }, [
        defaultCalibration,
        rimControls.offsetXLeft,
        rimControls.offsetXRight,
        rimControls.offsetY,
        rimControls.offsetZFront,
        rimControls.offsetZRear,
        rimControls.rotYLeft,
        rimControls.rotYRight,
        rimControls.scale,
        rimFileName,
    ]);

    useEffect(() => {
        if (!IS_DEV) return;

        setRimControls({
            scale: defaultCalibration.scale,
            offsetY: defaultCalibration.offsetY,
            rotYLeft: defaultCalibration.rotYLeft,
            rotYRight: defaultCalibration.rotYRight,
            offsetXLeft: defaultCalibration.offsetXLeft,
            offsetXRight: defaultCalibration.offsetXRight,
            offsetZFront: defaultCalibration.offsetZFront,
            offsetZRear: defaultCalibration.offsetZRear,
        });
    }, [defaultCalibration, fileName, setRimControls]);

    // Compute bounding-box based scale + centre offset once
    const { scale, center } = useMemo(() => {
        const box = new THREE.Box3().setFromObject(modelScene);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        // Target ~6 units wide so it fills the viewport nicely
        const s = 6 / maxDim;
        const c = box.getCenter(new THREE.Vector3()).multiplyScalar(-s);
        // Sit on the floor: offset so bottom of bounding box == y:0
        const modelGroundOffsetY = CAR_MODEL_GROUND_Y_OFFSETS[fileName] ?? 0;
        c.y = -box.min.y * s + modelGroundOffsetY;
        return { scale: s, center: c };
    }, [fileName, modelScene]);

    /* ── Dispose Three.js GPU resources ONLY when the model changes or unmounts ── */
    useEffect(() => {
        return () => {
            modelScene.traverse((child: THREE.Object3D) => {
                const mesh = child as THREE.Mesh;
                if (!mesh.isMesh) return;
                mesh.geometry?.dispose();
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach((m) => m.dispose());
                } else {
                    mesh.material?.dispose();
                }
            });
        };
    }, [modelScene]);

    /* ── Shadows + default paint for G-Class (Nardo Grey) ── */
    useEffect(() => {
        const isGClass = fileName === "2025_mercedes-benz_g-class_amg_g_63.glb";
        const nardoGrey = new THREE.Color("#6B6D6E");

        modelScene.traverse((child: THREE.Object3D) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;

                // Apply Nardo Grey to G-Class body panels only
                if (isGClass && !mesh.userData.__paintExcluded && !mesh.userData.__materialFixed) {
                    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                    mats.forEach((mat) => {
                        const std = mat as THREE.MeshStandardMaterial;
                        if (std.isMeshStandardMaterial && std.metalness > 0.1) {
                            std.color.copy(nardoGrey);
                            std.metalness = 0.75;
                            std.roughness = 0.22;
                            std.needsUpdate = true;
                        }
                    });
                }
            }
        });
    }, [modelScene, fileName]);

    return (
        <group ref={groupRef} scale={scale} position={[center.x, center.y, center.z]}>
            <primitive object={modelScene} />
            {rimUrl && (
                <Suspense fallback={null}>
                    <RimInjector
                        key={rimUrl}
                        rimUrl={rimUrl}
                        rimColor={rimColor}
                        modelUrl={modelUrl}
                        modelScene={modelScene}
                        rimCalibration={activeRimCalibration}
                        isDev={IS_DEV}
                    />
                </Suspense>
            )}
        </group>
    );
}

function ModelLoadingFallback() {
    return (
        <Html center>
            <AeroLoader inline={true} />
        </Html>
    );
}



/* ================================================================== */
/*  ReflectiveFloor                                                   */
/* ================================================================== */
function ReflectiveFloor() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[80, 80]} />
            <MeshReflectorMaterial
                blur={[300, 100]}
                resolution={1024}
                mixBlur={1}
                mixStrength={0.5}
                roughness={0.7}
                depthScale={1.2}
                minDepthThreshold={0.4}
                maxDepthThreshold={1.4}
                color={BG}
                metalness={0.5}
                mirror={0.5}
            />
        </mesh>
    );
}

/* ================================================================== */
/*  Main export                                                       */
/* ================================================================== */
export default function CarConfigurator() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const scrollProgress = useRef(0);
    const isSmallScreen = typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches;
    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shouldLightenUi = isSmallScreen || prefersReducedMotion;
    const [isActive, setIsActive] = useState(false);
    const [isPreparing, setIsPreparing] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const [, startTransition] = useTransition();
    const [selectedModel, setSelectedModel] = useState(DEFAULT_CAR.displayName);
    const [selectedWheelModel, setSelectedWheelModel] = useState("DRX-101");
    const [showFinalize, setShowFinalize] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [selectedCar, setSelectedCar] = useState<Car3DOption>(DEFAULT_CAR);
    const [selectedFinishColor, setSelectedFinishColor] = useState("#0A0A0A|0.85|0.15|0");
    const [selectedRimUrl, setSelectedRimUrl] = useState<string | null>(null);

    /* ── GSAP: pin section + drive scrollProgress ── */
    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const isMobile = window.matchMedia("(max-width: 900px)").matches;
        const prefersReducedMotionLocal = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const profileStart = performance.now();

        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: section,
                start: "top top",
                end: isMobile ? "+=170%" : "+=200%",
                pin: true,
                scrub: prefersReducedMotionLocal ? 0.6 : 1,
                anticipatePin: 1,
                fastScrollEnd: true,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    scrollProgress.current = self.progress;

                    // Show button when scroll finishes
                    if (self.progress > 0.95 && !isActive) {
                        setShowButton(true);
                    } else if (self.progress <= 0.95) {
                        setShowButton(false);
                    }
                },
            });
        });

        if (process.env.NODE_ENV !== "production") {
            const setupMs = Math.round(performance.now() - profileStart);
            console.info(`[perf][CarConfigurator] ScrollTrigger setup: ${setupMs}ms`);
        }

        return () => ctx.revert();
    }, [isActive]);

    const handleEnter = useCallback(() => {
        setIsPreparing(true);
        setShowButton(false);

        // Simulate brief environment preparation, then activate
        setTimeout(() => {
            setIsPreparing(false);
            setIsActive(true);
        }, 1200);
    }, []);

    const handleExit = useCallback(() => {
        setIsActive(false);
        setIsPreparing(false);
        setShowFinalize(false);
    }, []);

    /* ── Scroll lock when configurator is active ── */
    useEffect(() => {
        if (isActive) {
            document.body.style.overflow = "hidden";
            window.dispatchEvent(new CustomEvent("configurator-active", { detail: { active: true } }));
        } else {
            document.body.style.overflow = "auto";
            window.dispatchEvent(new CustomEvent("configurator-active", { detail: { active: false } }));
        }
        return () => {
            document.body.style.overflow = "auto";
            window.dispatchEvent(new CustomEvent("configurator-active", { detail: { active: false } }));
        };
    }, [isActive]);

    const canShowActionButton = isActive || showButton;

    const handleCloseFinalize = useCallback(() => {
        setShowFinalize(false);
        setSubmitSuccess(false);
        setIsSubmitting(false);
    }, []);

    const handleSubmitLead = useCallback(async () => {
        if (!name.trim() || !email.trim() || !phone.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/configurator-lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    selectedCarModel: selectedModel,
                    selectedWheelModel,
                    customer: {
                        name: name.trim(),
                        email: email.trim(),
                        phone: phone.trim(),
                    },
                }),
            });

            if (!response.ok) throw new Error("Failed to submit lead");

            setSubmitSuccess(true);
            setTimeout(() => {
                setShowFinalize(false);
                setName("");
                setEmail("");
                setPhone("");
                setSubmitSuccess(false);
            }, 1300);
        } catch {
            setSubmitSuccess(false);
        } finally {
            setIsSubmitting(false);
        }
    }, [email, name, phone, selectedModel, selectedWheelModel]);

    return (
        <section ref={sectionRef} className="car-configurator-section" id="configurator">
            {IS_DEV && <Leva collapsed oneLineLabels hideCopyButton />}

            {/* 3D Canvas */}
            <Canvas
                dpr={[1, 2]}
                shadows
                camera={{
                    fov: 45,
                    near: 0.1,
                    far: 200,
                    position: CAM_START,
                }}
                gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
                style={{ width: "100%", height: "100%" }}
            >
                {/* Background + Fog */}
                <color attach="background" args={[BG]} />
                <fog attach="fog" args={[BG, 15, 60]} />

                {/* Lighting */}
                <SoftShadows size={25} samples={16} focus={0.5} />
                <ambientLight intensity={0.3} color="#e8e0d4" />
                <directionalLight
                    castShadow
                    position={[8, 12, 5]}
                    intensity={2.5}
                    color={SUN}
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                    shadow-camera-far={50}
                    shadow-camera-left={-15}
                    shadow-camera-right={15}
                    shadow-camera-top={15}
                    shadow-camera-bottom={-15}
                    shadow-bias={-0.0004}
                />
                <directionalLight
                    position={[-5, 6, -3]}
                    intensity={0.6}
                    color="#c4d4f0"
                />

                {/* Environment (lighting only, no bg) */}
                <Environment preset="sunset" background={false} />

                {/* Camera controller */}
                <ScrollCamera scrollProgress={scrollProgress} isActive={isActive} />

                {/* OrbitControls – only when configurator is active */}
                {isActive && (
                    <OrbitControls
                        enablePan={false}
                        enableZoom
                        minPolarAngle={0}
                        maxPolarAngle={Math.PI / 2 - 0.1}
                        minDistance={4}
                        maxDistance={20}
                        target={[0, 0.5, 0]}
                    />
                )}

                {/* Scene */}
                <Suspense fallback={<ModelLoadingFallback />}>
                    <CarModel
                        modelUrl={selectedCar.modelPath}
                        rimColor={selectedFinishColor}
                        rimUrl={selectedRimUrl}
                    />
                    <ReflectiveFloor />
                </Suspense>
            </Canvas>

            {/* UI Overlay */}
            <div className="car-config-overlay">
                <div className={`car-config-title ${isActive ? "car-config-title--hidden" : ""}`}>
                    <span className="car-config-label">Interactive Experience</span>
                </div>

                <AnimatePresence>
                    {canShowActionButton && (
                        <motion.div
                            className="car-config-action-anchor"
                            style={{
                                position: "absolute",
                                bottom: "80px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                zIndex: 50,
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <AnimatePresence mode="wait">
                                {!isActive ? (
                                    <motion.button
                                        key="enter"
                                        className="car-config-action-btn"
                                        onClick={handleEnter}
                                        initial={shouldLightenUi ? { opacity: 0, scale: 0.97 } : { opacity: 0, scale: 0.94 }}
                                        animate={shouldLightenUi ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
                                        exit={shouldLightenUi ? { opacity: 0, scale: 1.01 } : { opacity: 0, scale: 1.03 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        Enter Configurator
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        key="exit"
                                        className="car-config-action-btn car-config-action-btn--exit"
                                        onClick={handleExit}
                                        initial={shouldLightenUi ? { opacity: 0, scale: 0.97 } : { opacity: 0, scale: 0.96 }}
                                        animate={shouldLightenUi ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
                                        exit={shouldLightenUi ? { opacity: 0, scale: 1.01 } : { opacity: 0, scale: 1.03 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <X size={16} />
                                        <span>Exit</span>
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <ConfiguratorHUD
                active={isActive}
                onSelectWheelModel={(wheel) => setSelectedWheelModel(wheel)}
                onOpenFinalize={() => setShowFinalize(true)}
                carGroups={CAR_3D_GROUPS}
                selectedCarId={selectedCar.id}
                onSelectCarModel={(car) => {
                    startTransition(() => {
                        setSelectedCar(car);
                        setSelectedModel(car.displayName);
                    });
                }}
                selectedFinishColor={selectedFinishColor}
                onSelectFinishColor={(hex) => setSelectedFinishColor(hex)}
                selectedRimUrl={selectedRimUrl}
                onSelectRimUrl={(url) => setSelectedRimUrl(url)}
            />

            <AnimatePresence>
                {isActive && !showFinalize && (
                    <motion.div
                        className="car-config-summary"
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                    >
                        <span className="car-config-summary-label">Current Build</span>
                        <h4>Your {selectedModel} on {selectedWheelModel}</h4>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preparing overlay – localized to this section */}
            <AnimatePresence>
                {isPreparing && (
                    <motion.div
                        className="car-config-preparing-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <AeroLoader inline={true} />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isActive && showFinalize && (
                    <motion.div
                        className="config-lead-modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="config-lead-modal"
                            initial={{ opacity: 0, y: 30, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 18, scale: 0.98 }}
                        >
                            <button className="config-lead-close" onClick={handleCloseFinalize}>
                                <X size={15} />
                            </button>

                            <h3>Request Quote</h3>
                            <p>Your {selectedModel} on {selectedWheelModel}</p>

                            <div className="config-lead-step-content">
                                <label>Name</label>
                                <input
                                    className="config-lead-input"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    placeholder="Your name"
                                />

                                <label>Email</label>
                                <input
                                    className="config-lead-input"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="name@email.com"
                                />

                                <label>Phone</label>
                                <input
                                    className="config-lead-input"
                                    value={phone}
                                    onChange={(event) => setPhone(event.target.value)}
                                    placeholder="+1 (___) ___-____"
                                />

                                <div className="config-lead-actions">
                                    <button
                                        className="config-lead-submit"
                                        onClick={handleSubmitLead}
                                        disabled={!name.trim() || !email.trim() || !phone.trim() || isSubmitting || submitSuccess}
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
        </section>
    );
}
