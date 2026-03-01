import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════════════
   Material Fix System
   ─────────────────────────────────────────────────────────────────────
   Blender's Principled BSDF doesn't fully translate to glTF / Three.js:
   custom shader nodes, glass transmission, chrome reflections, emission
   layers and clearcoat are often lost or degraded on export.

   This module provides a dictionary-driven system that replaces broken
   materials at scene-clone time with high-quality Three.js equivalents.

   WORKFLOW (dev mode):
   1. Load a car model → click "Log Meshes" in Leva
   2. Check console for a full mesh + material inventory table
   3. Identify broken meshes (flat chrome, white glass, dead headlights…)
   4. Add entries to CAR_MATERIAL_FIXES below
   5. Reload — materials auto-applied on clone
   ═══════════════════════════════════════════════════════════════════════ */

// ── Types ──────────────────────────────────────────────────────────────

export type MaterialFixPreset =
    | "chrome"
    | "brushed-metal"
    | "dark-metal"
    | "glass-clear"
    | "glass-tinted"
    | "glass-dark"
    | "rubber"
    | "headlight-lens"
    | "taillight-lens"
    | "emission-white"
    | "emission-warm"
    | "emission-red"
    | "emission-amber"
    | "carbon-fiber"
    | "plastic-gloss-black"
    | "plastic-matte-black"
    | "leather-black"
    | "leather-tan"
    | "paint-metallic"
    | "paint-matte"
    | "paint-pearlescent"
    | "mirror"
    | "exhaust-tip"
    | "brake-caliper-red"
    | "custom";

export type MaterialFixOverrides = {
    color?: string;
    metalness?: number;
    roughness?: number;
    envMapIntensity?: number;
    emissive?: string;
    emissiveIntensity?: number;
    transmission?: number;
    ior?: number;
    thickness?: number;
    clearcoat?: number;
    clearcoatRoughness?: number;
    opacity?: number;
    transparent?: boolean;
    depthWrite?: boolean;
    side?: "front" | "back" | "double";
    sheenColor?: string;
    sheen?: number;
    attenuationColor?: string;
    attenuationDistance?: number;
};

export type MaterialFix = {
    preset: MaterialFixPreset;
    overrides?: MaterialFixOverrides;
    /** When true (default), copies texture maps (diffuse, normal, ao…) from the original material */
    preserveMaps?: boolean;
};

export type CarMaterialFixConfig = {
    /** Fix by exact mesh name — highest priority */
    byMesh?: Record<string, MaterialFix>;
    /** Fix meshes whose material.name matches a regex pattern */
    byMaterialPattern?: Array<{ pattern: string; fix: MaterialFix }>;
    /** Fix meshes whose mesh.name matches a regex pattern */
    byMeshPattern?: Array<{ pattern: string; fix: MaterialFix }>;
};

// ── Preset Definitions ────────────────────────────────────────────────

type InternalPreset = MaterialFixOverrides & { _physical?: boolean };

const PRESET_DEFAULTS: Record<string, InternalPreset> = {
    /* ── Metals ─────────────────────────────────────────────── */
    chrome: {
        _physical: true,
        color: "#fafafa",
        metalness: 1.0,
        roughness: 0.03,
        envMapIntensity: 2.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
    },
    "brushed-metal": {
        color: "#c0c0c0",
        metalness: 0.95,
        roughness: 0.25,
        envMapIntensity: 1.8,
    },
    "dark-metal": {
        color: "#2a2a2a",
        metalness: 0.9,
        roughness: 0.3,
        envMapIntensity: 1.5,
    },
    mirror: {
        _physical: true,
        color: "#ffffff",
        metalness: 1.0,
        roughness: 0.0,
        envMapIntensity: 3.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
    },
    "exhaust-tip": {
        _physical: true,
        color: "#333333",
        metalness: 1.0,
        roughness: 0.1,
        envMapIntensity: 2.0,
        clearcoat: 0.5,
        clearcoatRoughness: 0.1,
    },

    /* ── Glass ──────────────────────────────────────────────── */
    "glass-clear": {
        _physical: true,
        color: "#ffffff",
        metalness: 0.0,
        roughness: 0.0,
        transmission: 0.95,
        ior: 1.5,
        thickness: 0.5,
        transparent: true,
        opacity: 1.0,
        depthWrite: false,
        envMapIntensity: 1.0,
        side: "double",
    },
    "glass-tinted": {
        _physical: true,
        color: "#1a1a2e",
        metalness: 0.0,
        roughness: 0.05,
        transmission: 0.7,
        ior: 1.5,
        thickness: 0.8,
        transparent: true,
        opacity: 1.0,
        depthWrite: false,
        envMapIntensity: 0.8,
        side: "double",
    },
    "glass-dark": {
        _physical: true,
        color: "#080810",
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.5,
        ior: 1.5,
        thickness: 1.0,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        envMapIntensity: 0.6,
    },

    /* ── Lights ─────────────────────────────────────────────── */
    "headlight-lens": {
        _physical: true,
        color: "#ffffff",
        metalness: 0.0,
        roughness: 0.0,
        transmission: 0.92,
        ior: 1.5,
        thickness: 0.3,
        transparent: true,
        emissive: "#fffde8",
        emissiveIntensity: 0.5,
        envMapIntensity: 1.2,
        depthWrite: false,
    },
    "taillight-lens": {
        _physical: true,
        color: "#cc1111",
        metalness: 0.0,
        roughness: 0.05,
        transmission: 0.65,
        ior: 1.5,
        thickness: 0.5,
        transparent: true,
        emissive: "#ff0000",
        emissiveIntensity: 0.4,
        envMapIntensity: 0.8,
        depthWrite: false,
    },
    "emission-white": {
        color: "#ffffff",
        metalness: 0.0,
        roughness: 0.2,
        emissive: "#ffffff",
        emissiveIntensity: 1.5,
    },
    "emission-warm": {
        color: "#fff5e6",
        metalness: 0.0,
        roughness: 0.2,
        emissive: "#ffd699",
        emissiveIntensity: 1.2,
    },
    "emission-red": {
        color: "#ff0000",
        metalness: 0.0,
        roughness: 0.2,
        emissive: "#ff0000",
        emissiveIntensity: 1.0,
    },
    "emission-amber": {
        color: "#ff8800",
        metalness: 0.0,
        roughness: 0.2,
        emissive: "#ff8800",
        emissiveIntensity: 1.0,
    },

    /* ── Rubber / Plastic ───────────────────────────────────── */
    rubber: {
        color: "#0a0a0a",
        metalness: 0.0,
        roughness: 0.85,
        envMapIntensity: 0.3,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
    },
    "plastic-gloss-black": {
        color: "#111111",
        metalness: 0.0,
        roughness: 0.15,
        envMapIntensity: 1.2,
    },
    "plastic-matte-black": {
        color: "#1a1a1a",
        metalness: 0.0,
        roughness: 0.7,
        envMapIntensity: 0.5,
    },

    /* ── Carbon / Composites ────────────────────────────────── */
    "carbon-fiber": {
        _physical: true,
        color: "#1a1a1a",
        metalness: 0.2,
        roughness: 0.35,
        clearcoat: 0.85,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.5,
    },

    /* ── Leather / Interior ─────────────────────────────────── */
    "leather-black": {
        color: "#1a1a1a",
        metalness: 0.0,
        roughness: 0.6,
        envMapIntensity: 0.4,
    },
    "leather-tan": {
        color: "#c4a35a",
        metalness: 0.0,
        roughness: 0.55,
        envMapIntensity: 0.4,
    },

    /* ── Paint ──────────────────────────────────────────────── */
    "paint-metallic": {
        _physical: true,
        metalness: 0.8,
        roughness: 0.18,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        envMapIntensity: 2.0,
    },
    "paint-matte": {
        metalness: 0.0,
        roughness: 0.9,
        envMapIntensity: 0.3,
    },
    "paint-pearlescent": {
        _physical: true,
        metalness: 0.6,
        roughness: 0.12,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        envMapIntensity: 2.5,
        sheenColor: "#ffffff",
        sheen: 0.5,
    },

    /* ── Special ────────────────────────────────────────────── */
    "brake-caliper-red": {
        _physical: true,
        color: "#cc0000",
        metalness: 0.3,
        roughness: 0.4,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2,
        envMapIntensity: 1.5,
    },

    /* ── Custom — all values come from overrides ────────────── */
    custom: {},
};

// ── Factory ───────────────────────────────────────────────────────────

function needsPhysicalMaterial(config: InternalPreset): boolean {
    return (
        !!config._physical ||
        config.transmission !== undefined ||
        config.clearcoat !== undefined ||
        config.sheen !== undefined ||
        config.sheenColor !== undefined ||
        config.ior !== undefined ||
        config.thickness !== undefined ||
        config.attenuationColor !== undefined ||
        config.attenuationDistance !== undefined
    );
}

function applySide(mat: THREE.Material, side?: string) {
    if (!side) return;
    mat.side =
        side === "double"
            ? THREE.DoubleSide
            : side === "back"
              ? THREE.BackSide
              : THREE.FrontSide;
}

/** Copy texture maps from the original material so we keep UV-baked detail */
function preserveTexturesFromOriginal(
    newMat: THREE.MeshStandardMaterial,
    original: THREE.Material,
) {
    const orig = original as THREE.MeshStandardMaterial;
    if (!orig.isMeshStandardMaterial) return;

    if (orig.map) newMat.map = orig.map;
    if (orig.normalMap) {
        newMat.normalMap = orig.normalMap;
        newMat.normalScale.copy(orig.normalScale);
    }
    if (orig.roughnessMap) newMat.roughnessMap = orig.roughnessMap;
    if (orig.metalnessMap) newMat.metalnessMap = orig.metalnessMap;
    if (orig.aoMap) {
        newMat.aoMap = orig.aoMap;
        newMat.aoMapIntensity = orig.aoMapIntensity;
    }
    if (orig.emissiveMap) newMat.emissiveMap = orig.emissiveMap;
    if (orig.envMap) newMat.envMap = orig.envMap;
    if (orig.lightMap) newMat.lightMap = orig.lightMap;
    if (orig.alphaMap) newMat.alphaMap = orig.alphaMap;

    // Physical-specific maps
    const physOrig = original as THREE.MeshPhysicalMaterial;
    const physNew = newMat as THREE.MeshPhysicalMaterial;
    if (physOrig.isMeshPhysicalMaterial && physNew.isMeshPhysicalMaterial) {
        if (physOrig.clearcoatMap) physNew.clearcoatMap = physOrig.clearcoatMap;
        if (physOrig.clearcoatRoughnessMap)
            physNew.clearcoatRoughnessMap = physOrig.clearcoatRoughnessMap;
        if (physOrig.clearcoatNormalMap)
            physNew.clearcoatNormalMap = physOrig.clearcoatNormalMap;
        if (physOrig.transmissionMap)
            physNew.transmissionMap = physOrig.transmissionMap;
        if (physOrig.thicknessMap) physNew.thicknessMap = physOrig.thicknessMap;
        if (physOrig.sheenColorMap)
            physNew.sheenColorMap = physOrig.sheenColorMap;
        if (physOrig.sheenRoughnessMap)
            physNew.sheenRoughnessMap = physOrig.sheenRoughnessMap;
    }
}

/**
 * Creates a fixed Three.js material from a preset + optional overrides.
 * Optionally preserves texture maps from the original material.
 */
export function createFixedMaterial(
    fix: MaterialFix,
    originalMaterial?: THREE.Material,
): THREE.Material {
    const presetConfig = PRESET_DEFAULTS[fix.preset] ?? {};
    const merged: InternalPreset = { ...presetConfig, ...fix.overrides };
    const isPhysical = needsPhysicalMaterial(merged);

    const mat = isPhysical
        ? new THREE.MeshPhysicalMaterial()
        : new THREE.MeshStandardMaterial();

    // Scalar properties (shared between Standard + Physical)
    if (merged.color !== undefined) mat.color.set(merged.color);
    if (merged.metalness !== undefined) mat.metalness = merged.metalness;
    if (merged.roughness !== undefined) mat.roughness = merged.roughness;
    if (merged.envMapIntensity !== undefined)
        mat.envMapIntensity = merged.envMapIntensity;
    if (merged.emissive !== undefined) mat.emissive.set(merged.emissive);
    if (merged.emissiveIntensity !== undefined)
        mat.emissiveIntensity = merged.emissiveIntensity;
    if (merged.opacity !== undefined) mat.opacity = merged.opacity;
    if (merged.transparent !== undefined) mat.transparent = merged.transparent;
    if (merged.depthWrite !== undefined) mat.depthWrite = merged.depthWrite;
    applySide(mat, merged.side);

    // Physical-only properties
    if (isPhysical) {
        const phys = mat as THREE.MeshPhysicalMaterial;
        if (merged.transmission !== undefined)
            phys.transmission = merged.transmission;
        if (merged.ior !== undefined) phys.ior = merged.ior;
        if (merged.thickness !== undefined) phys.thickness = merged.thickness;
        if (merged.clearcoat !== undefined) phys.clearcoat = merged.clearcoat;
        if (merged.clearcoatRoughness !== undefined)
            phys.clearcoatRoughness = merged.clearcoatRoughness;
        if (merged.sheen !== undefined) phys.sheen = merged.sheen;
        if (merged.sheenColor !== undefined)
            phys.sheenColor.set(merged.sheenColor);
        if (merged.attenuationColor !== undefined)
            phys.attenuationColor.set(merged.attenuationColor);
        if (merged.attenuationDistance !== undefined)
            phys.attenuationDistance = merged.attenuationDistance;
    }

    // Optionally preserve texture maps from the original material
    if (fix.preserveMaps !== false && originalMaterial) {
        preserveTexturesFromOriginal(mat, originalMaterial);
    }

    mat.needsUpdate = true;
    return mat;
}

// ══════════════════════════════════════════════════════════════════════
//  Per-Car Fix Data
// ══════════════════════════════════════════════════════════════════════

export const CAR_MATERIAL_FIXES: Record<string, CarMaterialFixConfig> = {
    /*
     * ── GLOBAL FALLBACK ──
     * Material-name patterns that apply to ALL cars unless a per-car
     * byMesh entry overrides the same mesh first.
     * Uses word-boundary \b so "glass" matches but "fiberglass" doesn't.
     */
    __global__: {
        byMaterialPattern: [
            {
                pattern: "\\bglass\\b|\\bwindshield\\b|\\bwindscreen\\b|\\bglazing\\b",
                fix: { preset: "glass-tinted", preserveMaps: false },
            },
            {
                pattern: "\\bchrome\\b",
                fix: { preset: "chrome", preserveMaps: false },
            },
        ],
    },

    /*
     * ── Mercedes Brabus 850 ──
     * Known: tires share glass mat → white/invisible, exhaust tips flat,
     * headlight lenses opaque
     */
    "s_brabus_850.glb": {
        byMesh: {
            // Tires — shipped sharing a glass material → force opaque black
            Object_356: {
                preset: "rubber",
                preserveMaps: false,
                overrides: { color: "#0a0a0a", transparent: false, opacity: 1.0, depthWrite: true },
            },
            Object_364: {
                preset: "rubber",
                preserveMaps: false,
                overrides: { color: "#0a0a0a", transparent: false, opacity: 1.0, depthWrite: true },
            },
            // Exhaust tips — should be reflective dark chrome
            "TwiXeR_W223_brabus_exhaust_L_53": {
                preset: "exhaust-tip",
                preserveMaps: false,
            },
            "TwiXeR_W223_brabus_exhaust_R_52": {
                preset: "exhaust-tip",
                preserveMaps: false,
            },
            // Headlight lenses — lost transmission on export
            "TwiXeR_W223_headlight_L_23": {
                preset: "headlight-lens",
                preserveMaps: false,
            },
            "TwiXeR_W223_headlight_R_22": {
                preset: "headlight-lens",
                preserveMaps: false,
            },
        },
    },

    // ── Add more cars below — use "Log Meshes" in Leva to identify broken materials ──
    // "2025_mercedes-benz_g-class_amg_g_63.glb": {
    //     byMesh: { },
    //     byMaterialPattern: [ ],
    // },
};

// ══════════════════════════════════════════════════════════════════════
//  Applicator — call once at scene-clone time
// ══════════════════════════════════════════════════════════════════════

/**
 * Walks every mesh in `scene` and applies material fixes from
 * `CAR_MATERIAL_FIXES`. Returns the number of materials replaced.
 *
 * Priority order:
 *   1. Per-car exact mesh name (byMesh)
 *   2. Per-car mesh-name pattern (byMeshPattern)
 *   3. Per-car material-name pattern (byMaterialPattern)
 *   4. Global material-name pattern
 *   5. Global mesh-name pattern
 */
export function applyMaterialFixes(
    scene: THREE.Object3D,
    fileName: string,
): number {
    const carConfig = CAR_MATERIAL_FIXES[fileName];
    const globalConfig = CAR_MATERIAL_FIXES["__global__"];
    let fixCount = 0;

    scene.traverse((child: THREE.Object3D) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        if (mesh.userData.__materialFixed) return;

        const originalMaterial = Array.isArray(mesh.material)
            ? mesh.material[0]
            : mesh.material;

        // ── Priority 1: Per-car exact mesh name ──
        if (carConfig?.byMesh && mesh.name in carConfig.byMesh) {
            mesh.material = createFixedMaterial(
                carConfig.byMesh[mesh.name],
                originalMaterial,
            );
            mesh.userData.__materialFixed = true;
            mesh.userData.__paintExcluded = true;
            fixCount++;
            return;
        }

        // ── Priority 2: Per-car mesh-name pattern ──
        if (carConfig?.byMeshPattern) {
            for (const { pattern, fix } of carConfig.byMeshPattern) {
                if (new RegExp(pattern, "i").test(mesh.name)) {
                    mesh.material = createFixedMaterial(fix, originalMaterial);
                    mesh.userData.__materialFixed = true;
                    mesh.userData.__paintExcluded = true;
                    fixCount++;
                    return;
                }
            }
        }

        // ── Priority 3: Per-car material-name pattern ──
        if (carConfig?.byMaterialPattern) {
            const matName = originalMaterial?.name ?? "";
            for (const { pattern, fix } of carConfig.byMaterialPattern) {
                if (new RegExp(pattern, "i").test(matName)) {
                    mesh.material = createFixedMaterial(fix, originalMaterial);
                    mesh.userData.__materialFixed = true;
                    mesh.userData.__paintExcluded = true;
                    fixCount++;
                    return;
                }
            }
        }

        // ── Priority 4: Global material-name pattern ──
        if (globalConfig?.byMaterialPattern) {
            const matName = originalMaterial?.name ?? "";
            for (const { pattern, fix } of globalConfig.byMaterialPattern) {
                if (new RegExp(pattern, "i").test(matName)) {
                    mesh.material = createFixedMaterial(fix, originalMaterial);
                    mesh.userData.__materialFixed = true;
                    fixCount++;
                    return;
                }
            }
        }

        // ── Priority 5: Global mesh-name pattern ──
        if (globalConfig?.byMeshPattern) {
            for (const { pattern, fix } of globalConfig.byMeshPattern) {
                if (new RegExp(pattern, "i").test(mesh.name)) {
                    mesh.material = createFixedMaterial(fix, originalMaterial);
                    mesh.userData.__materialFixed = true;
                    fixCount++;
                    return;
                }
            }
        }
    });

    return fixCount;
}

// ══════════════════════════════════════════════════════════════════════
//  Dev Mesh Inventory Logger
// ══════════════════════════════════════════════════════════════════════

export type MeshInventoryEntry = {
    meshName: string;
    materialName: string;
    materialType: string;
    color: string;
    metalness: string;
    roughness: string;
    opacity: string;
    transparent: boolean;
    transmission: string;
    emissive: string;
    envMapIntensity: string;
    hasMap: boolean;
    hasNormal: boolean;
    fixed: boolean;
};

/**
 * Logs every mesh in a scene with material details to the console
 * (console.table) and copies a ready-to-paste template for
 * `CAR_MATERIAL_FIXES` to the clipboard.
 */
export function logMeshInventory(
    scene: THREE.Object3D,
    fileName: string,
): MeshInventoryEntry[] {
    const entries: MeshInventoryEntry[] = [];

    scene.traverse((child: THREE.Object3D) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;

        const mat = Array.isArray(mesh.material)
            ? mesh.material[0]
            : mesh.material;
        if (!mat) return;

        const std = mat as THREE.MeshStandardMaterial;
        const phys = mat as THREE.MeshPhysicalMaterial;

        entries.push({
            meshName: mesh.name || "(unnamed)",
            materialName: mat.name || "(unnamed)",
            materialType: phys.isMeshPhysicalMaterial
                ? "Physical"
                : std.isMeshStandardMaterial
                  ? "Standard"
                  : (mat as THREE.MeshBasicMaterial).isMeshBasicMaterial
                    ? "Basic"
                    : (mat.type ?? "Unknown"),
            color: std.color ? "#" + std.color.getHexString() : "—",
            metalness: std.metalness?.toFixed(2) ?? "—",
            roughness: std.roughness?.toFixed(2) ?? "—",
            opacity: mat.opacity?.toFixed(2) ?? "1.00",
            transparent: mat.transparent ?? false,
            transmission: (phys.transmission ?? 0).toFixed(2),
            emissive: std.emissive ? "#" + std.emissive.getHexString() : "—",
            envMapIntensity: std.envMapIntensity?.toFixed(1) ?? "—",
            hasMap: !!std.map,
            hasNormal: !!std.normalMap,
            fixed: !!mesh.userData.__materialFixed,
        });
    });

    /* ── Pretty console output ── */
    console.group(
        `%c🔍 Mesh Inventory: ${fileName} (${entries.length} meshes)`,
        "font-weight:bold;font-size:13px;color:#4fc3f7",
    );
    console.table(entries);

    /* ── Generate paste-able template for car-material-fixes.ts ── */
    const lines = entries
        .filter((e) => e.meshName !== "(unnamed)")
        .map(
            (e) =>
                `        // "${e.meshName}": { preset: "custom" },` +
                `  // mat:${e.materialName} (${e.materialType})` +
                ` color:${e.color} M:${e.metalness} R:${e.roughness}` +
                ` T:${e.transmission}` +
                `${e.hasMap ? " 📷map" : ""}${e.hasNormal ? " 📐normal" : ""}` +
                `${e.fixed ? " ✅fixed" : ""}`,
        );

    const template = [
        `    "${fileName}": {`,
        `        byMesh: {`,
        ...lines,
        `        },`,
        `    },`,
    ].join("\n");

    console.log(
        "%c\n📋 Template for car-material-fixes.ts:\n\n" + template,
        "color:#aed581",
    );
    console.groupEnd();

    // Copy template to clipboard
    if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(template).then(
            () => console.log("✅ Template copied to clipboard!"),
            () =>
                console.log(
                    "⚠️ Clipboard copy failed — grab template from console above",
                ),
        );
    }

    return entries;
}
