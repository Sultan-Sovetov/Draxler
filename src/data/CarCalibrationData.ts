export type CarCalibration = {
    scale: number;
    offsetY: number;
    rotYLeft: number;
    rotYRight: number;
    offsetXLeft: number;
    offsetXRight: number;
    offsetZFront: number;
    offsetZRear: number;
    perWheelCorrections?: Partial<Record<"FL" | "RL" | "FR" | "RR", { x?: number; y?: number; z?: number; scaleMul?: number }>>;
    /** When set, replaces auto-computed baseScaleFactor (rimCalibration.scale still applies on top) */
    scaleOverride?: number;
    /** When true, always use bounding-box derived positions for all 4 wheels (skip anchor PATH A) */
    forceBboxFallback?: boolean;
    /** When true, swap X and Z in bbox fallback positions (model oriented 90° differently) */
    swapFallbackXZ?: boolean;
    /** When set, hide any scene mesh whose name includes one of these substrings (for cars with messy / unicode names) */
    hideFactoryBySubstrings?: string[];
};

export const CAR_CALIBRATION_DATA: Record<string, CarCalibration> = {
    // ── Mercedes G63 2025 ──
    "2025_mercedes-benz_g-class_amg_g_63.glb": {
        scale: 1,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: 270,
        offsetXLeft: 0,
        offsetXRight: 0,
        offsetZFront: 0,
        offsetZRear: 0,
    },
    // ── BMW M5 2024 ──
    "bmw_m5_2024.glb": {
        scale: 0.98,
        offsetY: 0.01,
        rotYLeft: 90,
        rotYRight: 270,
        offsetXLeft: -0.07,
        offsetXRight: 0.07,
        offsetZFront: 0,
        offsetZRear: 0,
        perWheelCorrections: {
            FL: { scaleMul: 1.04 },
            FR: { scaleMul: 1.04 },
        },
    },
    // ── BMW M4 Competition 2025: user-provided dev calibration ──
    "2025_bmw_m4_competition.glb": {
        scale: 1,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: -90,
        offsetXLeft: -0.0003,
        offsetXRight: 0.0004,
        offsetZFront: 0,
        offsetZRear: 0,
    },
    // ── BMW X5 xDrive40i 2024: user-provided dev calibration ──
    "2024_bmw_x5_xdrive40i.glb": {
        scale: 1.03,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: -90,
        offsetXLeft: 0.0004,
        offsetXRight: -0.0003,
        offsetZFront: 0,
        offsetZRear: 0,
    },
    "2015_ford_mustang_rtr.glb": {
        scale: 1,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: 270,
        offsetXLeft: 0,
        offsetXRight: 0,
        offsetZFront: 0,
        offsetZRear: 0,
    },
    "s_brabus_850.glb": {
        scale: 0.94,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: -90,
        offsetXLeft: 0,
        offsetXRight: 0,
        offsetZFront: 0,
        offsetZRear: 0,
    },
    "2019_chevrolet_corvette_c8_stingray.glb": {
        scale: 0.99,
        offsetY: 0,
        rotYLeft: 270,
        rotYRight: 90,
        offsetXLeft: -0.02,
        offsetXRight: 0.02,
        offsetZFront: 0,
        offsetZRear: 0,
    },
    "dodge_challenger_srt_hellcat__free.glb": {
        scale: 1.02,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: -90,
        offsetXLeft: 0.01,
        offsetXRight: -0.01,
        offsetZFront: 0,
        offsetZRear: 0,
    },
    "porsche_911_V2_(uncompressed).glb": {
        scale: 1,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: -90,
        offsetXLeft: 0.03,
        offsetXRight: -0.03,
        offsetZFront: 0,
        offsetZRear: 0,
    },
    "lamb hurr2.glb": {
        scale: 0.76,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: -90,
        offsetXLeft: 0.01,
        offsetXRight: -0.01,
        offsetZFront: 0,
        offsetZRear: 0,
    },
    "lamb_urus-v1.glb": {
        scale: 0.75,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: -90,
        offsetXLeft: -0.12,
        offsetXRight: 0.12,
        offsetZFront: 0,
        offsetZRear: 0,
    },
    "lamb urus se.glb": {
        scale: 0.88,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: -90,
        offsetXLeft: -0.01,
        offsetXRight: 0.01,
        offsetZFront: 0,
        offsetZRear: 0,
    },
    "audi_a6_c8_limousine.glb": {
        scale: 1.03,
        offsetY: 0,
        rotYLeft: -90,
        rotYRight: 90,
        offsetXLeft: 0.09,
        offsetXRight: -0.09,
        offsetZFront: 0,
        offsetZRear: 0,
    },
    "audi_a6_c8_limousine (1).glb": {
        scale: 1.03,
        offsetY: 0,
        rotYLeft: -90,
        rotYRight: 90,
        offsetXLeft: 0.11,
        offsetXRight: -0.11,
        offsetZFront: 0,
        offsetZRear: 0,
    },
    "2021_cadillac_escalade_premium.glb": {
        scale: 0.99,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: -90,
        offsetXLeft: -0.001,
        offsetXRight: 0.001,
        offsetZFront: 0,
        offsetZRear: 0,
    },
    "2021_cadillac_escalade_premium_luxury.glb": {
        scale: 0.99,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: -90,
        offsetXLeft: -0.18,
        offsetXRight: 0.18,
        offsetZFront: 0,
        offsetZRear: 0,
    },
    "rrc2.glb": {
        scale: 0.88,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: -90,
        offsetXLeft: 0,
        offsetXRight: 0,
        offsetZFront: 0,
        offsetZRear: 0,
    },

    // ── Raptor: anchor meshes (Ani_Wheel / Disc_Scale) inside animated groups produce
    //    wildly wrong world positions → force bbox fallback for reliable placement ──
    "2024_ford_f-150_raptor_r.glb": {
        scale: 1.09,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: 270,
        offsetXLeft: 0.01,
        offsetXRight: -0.01,
        offsetZFront: 0,
        offsetZRear: 0,
        forceBboxFallback: true,
    },

    // ── Lexus LC 500: bbox fallback, NO scaleOverride (heuristic sizing) ──
    "2017_lexus_lc_500_model.glb": {
        scale: 0.68,
        offsetY: 0,
        rotYLeft: -90,
        rotYRight: 90,
        offsetXLeft: -0.04,
        offsetXRight: 0.03,
        offsetZFront: 0,
        offsetZRear: 0,
        forceBboxFallback: true,
    },

    // ── Huracan EVO: user-tuned from dev mode ──
    "2019_lamborghini_huracan_evo.glb": {
        scale: 0.99,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: 270,
        offsetXLeft: 0,
        offsetXRight: 0,
        offsetZFront: 0,
        offsetZRear: 0,
    },

    // ── Mercedes GLS: user-provided dev calibration ──
    "mersedes-_benz_gls.glb": {
        scale: 0.99,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: 270,
        offsetXLeft: 0.01,
        offsetXRight: -0.01,
        offsetZFront: 0,
        offsetZRear: 0,
    },

    // ── Mercedes-Benz Maybach 2022: 2 wheel anchors (front/rear), force bbox 4-wheel placement ──
    "mercedes-benz_maybach_2022.glb": {
        scale: 0.96,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: 270,
        offsetXLeft: 0,
        offsetXRight: 0,
        offsetZFront: 0,
        offsetZRear: 0,
        forceBboxFallback: true,
    },

    // ── Toyota Supra: user-provided dev calibration ──
    "toyota_supra.glb": {
        scale: 1,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: -90,
        offsetXLeft: 0.03,
        offsetXRight: -0.03,
        offsetZFront: 0,
        offsetZRear: 0,
    },

    // ── Toyota Land Cruiser 250 (2025): user-provided dev calibration ──
    "2025_toyota_land_cruiser_250.glb": {
        scale: 0.97,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: -90,
        offsetXLeft: 0,
        offsetXRight: 0,
        offsetZFront: 0,
        offsetZRear: 0,
    },
    // ── Toyota Land Cruiser 250 v1 (2025): mirrors 250 calibration ──
    "2025_toyota_land_cruiser_250-v1.glb": {
        scale: 0.97,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: -90,
        offsetXLeft: 0,
        offsetXRight: 0,
        offsetZFront: 0,
        offsetZRear: 0,
    },

    // ── Force bbox fallback: Lexus GX (scrambled/unicode names) ──
    "2023_lexus_gx_550_h_overtrail.glb": {
        scale: 0.7,
        offsetY: 0.0044,
        rotYLeft: 270,
        rotYRight: 90,
        offsetXLeft: 0.0003,
        offsetXRight: -0.0003,
        offsetZFront: -0.0037,
        offsetZRear: 0.0055,
        forceBboxFallback: true,
        // Only target leaf mesh nodes (rim/chrome/logo) — NOT parent groups (which contain tire)
        // FL logos + FR rim/logo/chrome have unicode chars that prevent findByName matching
        hideFactoryBySubstrings: [
            "FBXAS_Llogo_0",     // FL logo (unicode between MX and FBXAS)
            "FBXAS1_Llogo_0",    // FL logo
            "FBXAS2_Llogo_0",    // FL logo
            "F2_Lrim_0",         // FR rim (unicode between MX and F2)
            "F1_Llogo_0",        // FR logo (unicode between MX and F1)
            "MX_LZv3d_chrome_0", // FR chrome (unicode before 011_4)
        ],
    },
    "2021_ram_1500_trx.glb": {
        scale: 0.58,
        offsetY: 0.0045,
        rotYLeft: 270,
        rotYRight: 90,
        offsetXLeft: 0.0009,
        offsetXRight: -0.0009,
        offsetZFront: -0.003,
        offsetZRear: 0.0054,
        forceBboxFallback: true,
    },
    "2021_ram_1500_trx (1).glb": {
        scale: 0.58,
        offsetY: 0.0045,
        rotYLeft: 270,
        rotYRight: 90,
        offsetXLeft: 0.0009,
        offsetXRight: -0.0009,
        offsetZFront: -0.003,
        offsetZRear: 0.0054,
        forceBboxFallback: true,
    },

    // ── Bbox-fallback squad: forceBboxFallback → user tunes via Leva sliders ──
    "2017_ford_mustang_gt.glb": {
        scale: 0.82,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: 90,
        offsetXLeft: 0,
        offsetXRight: 0,
        offsetZFront: 0,
        offsetZRear: 0,
        forceBboxFallback: true,
    },
    "2019_chevrolet_camaro-v1.glb": {
        scale: 0.77,
        offsetY: 0.34,
        rotYLeft: 180,
        rotYRight: 0,
        offsetXLeft: 0.05,
        offsetXRight: -0.05,
        offsetZFront: -0.48,
        offsetZRear: 0.35,
        forceBboxFallback: true,
        swapFallbackXZ: true,
    },
    "land_rover_range_rover_sport_-_2023.glb": {
        scale: 1,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: 270,
        offsetXLeft: -0.16,
        offsetXRight: 0.16,
        offsetZFront: 0,
        offsetZRear: 0,
    },
    "porsche_cayenne.glb": {
        scale: 0.83,
        offsetY: 16.5,
        rotYLeft: -90,
        rotYRight: 90,
        offsetXLeft: 3,
        offsetXRight: -2.852,
        offsetZFront: -20,
        offsetZRear: 17.3,
        forceBboxFallback: true,
    },
    "lamborghini_huracan.glb": {
        scale: 0.80,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: 90,
        offsetXLeft: 0,
        offsetXRight: 0,
        offsetZFront: 0,
        offsetZRear: 0,
        forceBboxFallback: true,
    },
    // ── RS5: only 2 shared meshes, no per-wheel anchors ──
    "2021_audi_rs5_sportback.glb": {
        scale: 0.88,
        offsetY: 0,
        rotYLeft: 180,
        rotYRight: 0,
        offsetXLeft: 0,
        offsetXRight: 0,
        offsetZFront: 0,
        offsetZRear: 0,
        forceBboxFallback: true,
        swapFallbackXZ: true,
    },
    // ── GTC4 Lusso: only 2 shared meshes, no per-wheel anchors ──
    "ferrari_gtc4_lusso.glb": {
        scale: 0.778,
        offsetY: 1.44,
        rotYLeft: 180,
        rotYRight: 0,
        offsetXLeft: 0.01,
        offsetXRight: 0.02,
        offsetZFront: -1.72,
        offsetZRear: 1.36,
        forceBboxFallback: true,
        swapFallbackXZ: true,
    },

    // ── S-Class W223 Brabus: user-tuned from dev mode ──
    "mersedes-benz_s-class_w223_brabus_850 (1).glb": {
        scale: 0.96,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: 270,
        offsetXLeft: -0.11,
        offsetXRight: 0.11,
        offsetZFront: 0,
        offsetZRear: 0,
    },

    // ── Ferrari SF90 Stradale: user-tuned from dev mode ──
    "ferrari_sf90_stradale.glb": {
        scale: 1,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: 270,
        offsetXLeft: -0.08,
        offsetXRight: 0.08,
        offsetZFront: 0,
        offsetZRear: 0,
    },

    // ── Audi R8: user-tuned from dev mode ──
    "2019_audi_r8_coupe.glb": {
        scale: 1.02,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: 270,
        offsetXLeft: 0,
        offsetXRight: 0,
        offsetZFront: 0,
        offsetZRear: 0,
    },

    // ── Audi RS6: user-tuned from dev mode ──
    "audi.glb": {
        scale: 0.99,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: 270,
        offsetXLeft: 0.004,
        offsetXRight: -0.003,
        offsetZFront: 0,
        offsetZRear: 0,
    },

    // ── Porsche 911 Turbo S (2021): no per-wheel anchors, bbox fallback ──
    "2021_porsche_911_turbo_s_992.glb": {
        scale: 0.80,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: -90,
        offsetXLeft: 0,
        offsetXRight: 0,
        offsetZFront: 0,
        offsetZRear: 0,
        forceBboxFallback: true,
    },

    // ── McLaren 765LT: no per-wheel anchors, bbox fallback ──
    "2022_mclaren_765lt.glb": {
        scale: 0.80,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: -90,
        offsetXLeft: 0,
        offsetXRight: 0,
        offsetZFront: 0,
        offsetZRear: 0,
        forceBboxFallback: true,
    },

    // ── McLaren 720 (Uncompressed): user-tuned from dev mode ──
    "mclaren_720_(uncompressed).glb": {
        scale: 1.04,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: 270,
        offsetXLeft: 0.03,
        offsetXRight: -0.03,
        offsetZFront: 0,
        offsetZRear: 0,
    },

    // ── McLaren 720S Spider: user-provided dev calibration ──
    "mclaren_720S_spider.glb": {
        scale: 0.94,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: -90,
        offsetXLeft: 0,
        offsetXRight: 0,
        offsetZFront: 0,
        offsetZRear: 0,
    },

    // ── McLaren 720S: no per-wheel anchors, bbox fallback ──
    "2017_mclaren_720s.glb": {
        scale: 0.80,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: -90,
        offsetXLeft: 0,
        offsetXRight: 0,
        offsetZFront: 0,
        offsetZRear: 0,
        forceBboxFallback: true,
    },

    // ── McLaren 720S v2: no per-wheel anchors, bbox fallback ──
    "2017_mclaren720.glb": {
        scale: 0.80,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: -90,
        offsetXLeft: 0,
        offsetXRight: 0,
        offsetZFront: 0,
        offsetZRear: 0,
        forceBboxFallback: true,
    },

    // ── Lexus LX 700h: user-provided DRX_301 dev calibration ──
    "2025_lexus_lx700h.glb": {
        scale: 0.99,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: -90,
        offsetXLeft: -0.0014,
        offsetXRight: 0.0014,
        offsetZFront: 0,
        offsetZRear: 0,
    },

    // ── Land Rover Defender v1: user-provided dev calibration ──
    "land_rover_defender-v1.glb": {
        scale: 0.97,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: 270,
        offsetXLeft: 0.09,
        offsetXRight: -0.09,
        offsetZFront: 0,
        offsetZRear: 0,
    },

    // ── Rolls-Royce Ghost new: user-provided dev calibration ──
    "rolls_royce_ghost_new.glb": {
        scale: 0.93,
        offsetY: 0,
        rotYLeft: 90,
        rotYRight: 270,
        offsetXLeft: 0.04,
        offsetXRight: -0.04,
        offsetZFront: 0,
        offsetZRear: 0,
    },
};
