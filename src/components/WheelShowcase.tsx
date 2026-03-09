"use client";

import { Suspense, useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useFBX, useGLTF, Environment, Html, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AeroLoader from "./AeroLoader";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface HotspotData {
    id: number;
    position: [number, number, number];
    label: string;
    side: "left" | "right";
    info: {
        title: string;
        value: string;
        description: string;
    };
}

interface ModelBounds {
    width: number;
    height: number;
    depth: number;
}

const TARGET_MAX_DIMENSION = 4;
const TARGET_VIEWPORT_OCCUPANCY = 0.58;
const CAMERA_FOV = 45;
const WHEEL_MODEL_PATH = "/media/car%20rim.fbx";

/* в”Ђв”Ђ Parallax look-at constants в”Ђв”Ђ */
const MAX_TILT_X = THREE.MathUtils.degToRad(15);
const MAX_TILT_Y = THREE.MathUtils.degToRad(20);
const LERP_FACTOR = 0.05;

const hotspots: HotspotData[] = [
    {
        id: 1,
        position: [-1.97, 1.5, 1.05],
        label: "Forging",
        side: "left",
        info: {
            title: "6061-T6 Forged Alloy",
            value: "6061-T6",
            description:
                "Forged from aerospace-grade 6061-T6 aluminum under 8,000 tons of pressure. Maximum structural integrity with minimum weight.",
        },
    },
    {
        id: 2,
        position: [-2.12, 0.05, 1.12],
        label: "Weight",
        side: "left",
        info: {
            title: "Ultra-Lightweight",
            value: "8.2 kg",
            description:
                "Each wheel weighs just 8.2 kg вЂ” 40% lighter than cast equivalents. Less unsprung mass means sharper response.",
        },
    },
    {
        id: 3,
        position: [-1.97, -1.5, 1.05],
        label: "Finish",
        side: "left",
        info: {
            title: "Brushed Titanium",
            value: "PVD Coat",
            description:
                "Physical Vapor Deposition coating provides a mirror-finish that resists brake dust, road salts, and UV degradation.",
        },
    },
    {
        id: 4,
        position: [2.33, 1.5, 1.05],
        label: "Precision",
        side: "right",
        info: {
            title: "CNC Precision Machining",
            value: "В±0.02 mm",
            description:
                "Five-axis CNC machining ensures perfect spoke symmetry and true rotational balance at high speed.",
        },
    },
    {
        id: 5,
        position: [2.48, 0.05, 1.12],
        label: "Cooling",
        side: "right",
        info: {
            title: "Optimized Brake Cooling",
            value: "+18% Airflow",
            description:
                "Spoke channels are tuned for improved brake ventilation, reducing fade under repeated hard braking.",
        },
    },
    {
        id: 6,
        position: [2.33, -1.5, 1.05],
        label: "Durability",
        side: "right",
        info: {
            title: "Track-Grade Durability",
            value: "JWL / VIA",
            description:
                "Engineered to endure repeated load cycles and impact testing while maintaining structural rigidity.",
        },
    },
];

function GLBAsset({
    src,
    onLoad,
}: {
    src: string;
    onLoad: (model: THREE.Object3D) => void;
}) {
    const { scene } = useGLTF(src);

    useEffect(() => {
        onLoad(scene);
    }, [scene, onLoad]);

    return null;
}

function FBXAsset({
    src,
    onLoad,
}: {
    src: string;
    onLoad: (model: THREE.Object3D) => void;
}) {
    const fbx = useFBX(src);

    useEffect(() => {
        onLoad(fbx);
    }, [fbx, onLoad]);

    return null;
}

function WheelModel({
    onHotspotClick,
    onBoundsReady,
    mouseRef,
}: {
    onHotspotClick: (data: HotspotData) => void;
    onBoundsReady: (bounds: ModelBounds) => void;
    mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const targetRotation = useRef({ x: 0, y: 0 });
    const [rawModel, setRawModel] = useState<THREE.Object3D | null>(null);

    const modelExtension = useMemo(() => {
        const cleanPath = WHEEL_MODEL_PATH.split("?")[0];
        const ext = cleanPath.split(".").pop();
        return ext?.toLowerCase() ?? "";
    }, []);

    const useGlbReader = modelExtension === "glb" || modelExtension === "gltf";

    const { normalizedModel, normalizedScale, modelOffset, bounds } = useMemo(() => {
        if (!rawModel) {
            return {
                normalizedModel: null,
                normalizedScale: 1,
                modelOffset: new THREE.Vector3(0, 0, 0),
                bounds: {
                    width: TARGET_MAX_DIMENSION,
                    height: TARGET_MAX_DIMENSION,
                    depth: TARGET_MAX_DIMENSION,
                },
            };
        }

        const cloned = rawModel.clone(true);
        let centeredGeometry = false;

        cloned.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;

                if (mesh.geometry) {
                    const geometry = mesh.geometry.clone();
                    geometry.computeBoundingBox();
                    if (!centeredGeometry) {
                        geometry.center();
                        centeredGeometry = true;
                    }
                    geometry.computeVertexNormals();
                    mesh.geometry = geometry;
                }

                mesh.castShadow = true;
                mesh.receiveShadow = true;
                mesh.material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(0x8a8a8a),
                    metalness: 0.95,
                    roughness: 0.15,
                    envMapIntensity: 1.5,
                });
            }
        });

        const box = new THREE.Box3().setFromObject(cloned);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z, 0.0001);
        const scale = TARGET_MAX_DIMENSION / maxDimension;

        return {
            normalizedModel: cloned,
            normalizedScale: scale,
            modelOffset: center.multiplyScalar(-1),
            bounds: {
                width: size.x * scale,
                height: size.y * scale,
                depth: size.z * scale,
            },
        };
    }, [rawModel]);

    useEffect(() => {
        onBoundsReady(bounds);
    }, [bounds, onBoundsReady]);

    useFrame(() => {
        if (!groupRef.current) return;
        // Compute damped target from mouse position
        targetRotation.current.y = mouseRef.current.x * MAX_TILT_Y;
        targetRotation.current.x = -mouseRef.current.y * MAX_TILT_X;
        // Lerp for heavy, expensive feel
        groupRef.current.rotation.x += (targetRotation.current.x - groupRef.current.rotation.x) * LERP_FACTOR;
        groupRef.current.rotation.y += (targetRotation.current.y - groupRef.current.rotation.y) * LERP_FACTOR;
    });

    return (
        <group ref={groupRef}>
            {useGlbReader ? (
                <GLBAsset src={WHEEL_MODEL_PATH} onLoad={setRawModel} />
            ) : (
                <FBXAsset src={WHEEL_MODEL_PATH} onLoad={setRawModel} />
            )}

            {normalizedModel && (
                <primitive
                    object={normalizedModel}
                    scale={[normalizedScale, normalizedScale, normalizedScale]}
                    rotation={[0, -Math.PI / 1.5, 0]}
                    position={[modelOffset.x, modelOffset.y, modelOffset.z]}
                />
            )}
            {hotspots.map((spot) => (
                <Html
                    key={spot.id}
                    position={spot.position}
                    transform
                    sprite
                    distanceFactor={12}
                    zIndexRange={[100, 0]}
                >
                    <button
                        className={`hotspot-dot ${spot.side === "left" ? "hotspot-dot--left" : ""}`}
                        onClick={() => onHotspotClick(spot)}
                    >
                        <span className="hotspot-dot__ring" />
                        <span className="hotspot-dot__core" />
                        <span className="hotspot-dot__label">{spot.label}</span>
                    </button>
                </Html>
            ))}
        </group>
    );
}

function AutoFitCamera({
    distance,
}: {
    distance: number;
}) {
    const { camera } = useThree();

    useEffect(() => {
        camera.position.set(0, 0, distance);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
    }, [camera, distance]);

    return null;
}

function LoaderFallback() {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "radial-gradient(ellipse at center, #111 0%, #050505 70%)",
            }}
        >
            <AeroLoader inline />
        </div>
    );
}

export default function WheelShowcase() {
    const [activeHotspot, setActiveHotspot] = useState<HotspotData>(hotspots[0]);
    const [isMobile, setIsMobile] = useState(false);
    const [modelBounds, setModelBounds] = useState<ModelBounds>({
        width: TARGET_MAX_DIMENSION,
        height: TARGET_MAX_DIMENSION,
        depth: TARGET_MAX_DIMENSION,
    });
    const sectionRef = useRef<HTMLDivElement>(null);
    const infoRef = useRef<HTMLDivElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    const fitDistance = useMemo(() => {
        const size = Math.max(modelBounds.width, modelBounds.height, modelBounds.depth);
        const fovRadians = (CAMERA_FOV * Math.PI) / 180;
        const distance = (size / TARGET_VIEWPORT_OCCUPANCY) / (2 * Math.tan(fovRadians / 2));
        return Math.max(distance, 3.5);
    }, [modelBounds]);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    /* в”Ђв”Ђ Mouse tracking on entire window в”Ђв”Ђ */
    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
        };
        window.addEventListener("mousemove", onMove);
        return () => {
            window.removeEventListener("mousemove", onMove);
        };
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(sectionRef.current, {
                opacity: 0,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                    end: "top 40%",
                    scrub: true,
                },
            });
        });
        return () => ctx.revert();
    }, []);

    const handleHotspotClick = useCallback((data: HotspotData) => {
        setActiveHotspot(data);
        if (infoRef.current) {
            gsap.fromTo(
                infoRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
            );
        }
    }, []);

    const handleBoundsReady = useCallback((bounds: ModelBounds) => {
        setModelBounds(bounds);
    }, []);

    return (
        <section ref={sectionRef} className="wheel-section" id="wheel">
            {/* Left: Info Panel */}
            <div className="wheel-info">
                <div className="wheel-info-label">Interactive Showcase</div>
                <h2 className="wheel-info-title">
                    Engineered
                    <br />
                    Without Compromise
                </h2>
                <p className="wheel-info-desc">
                    Every DRAXLER wheel begins as a single billet of aerospace-grade aluminum,
                    forged under immense pressure and precision-machined to tolerances
                    measured in microns.
                </p>

                <div ref={infoRef}>
                    <div
                        style={{
                            padding: "1.5rem",
                            background: "var(--card-bg)",
                            borderRadius: "12px",
                            border: "1px solid var(--card-border)",
                            marginBottom: "2rem",
                        }}
                    >
                        <div
                            style={{
                                fontFamily: "Helvetica, Arial, sans-serif",
                                fontSize: "0.7rem",
                                letterSpacing: "0.3em",
                                textTransform: "uppercase" as const,
                                color: "var(--accent)",
                                marginBottom: "0.5rem",
                            }}
                        >
                            {activeHotspot.label}
                        </div>
                        <div
                            style={{
                                fontFamily: "Helvetica, Arial, sans-serif",
                                fontSize: "1.8rem",
                                fontWeight: 800,
                                marginBottom: "0.5rem",
                            }}
                        >
                            {activeHotspot.info.value}
                        </div>
                        <div
                            style={{
                                fontSize: "0.85rem",
                                lineHeight: 1.7,
                                color: "var(--accent)",
                            }}
                        >
                            {activeHotspot.info.description}
                        </div>
                    </div>
                </div>

                <div className="wheel-specs">
                    <div className="wheel-spec-item">
                        <div className="wheel-spec-value">8.2</div>
                        <div className="wheel-spec-label">Weight (kg)</div>
                    </div>
                    <div className="wheel-spec-item">
                        <div className="wheel-spec-value">6061</div>
                        <div className="wheel-spec-label">Alloy Grade</div>
                    </div>
                    <div className="wheel-spec-item">
                        <div className="wheel-spec-value">PVD</div>
                        <div className="wheel-spec-label">Finish</div>
                    </div>
                </div>
            </div>

            {/* Right: 3D Canvas */}
            <div className="wheel-canvas-wrapper">
                <Suspense fallback={<LoaderFallback />}>
                    <Canvas
                        dpr={isMobile ? [1, 1.5] : [1, 2]}
                        camera={{ position: [0, 0, fitDistance], fov: CAMERA_FOV }}
                        style={{ width: "100%", height: "100%" }}
                        gl={{ antialias: !isMobile, alpha: true, powerPreference: "high-performance" }}
                        onCreated={({ gl }) => {
                            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                        }}
                    >
                        <AutoFitCamera distance={fitDistance} />

                        <ambientLight intensity={0.4} />
                        <spotLight
                            position={[5, 5, 5]}
                            angle={0.3}
                            penumbra={0.8}
                            intensity={2}
                            castShadow={!isMobile}
                            color="#fff"
                        />
                        <spotLight
                            position={[-5, -2, 3]}
                            angle={0.4}
                            penumbra={1}
                            intensity={1}
                            color="#b0b0b0"
                        />
                        <directionalLight
                            position={[0, 5, -5]}
                            intensity={0.6}
                            color="#e0d0b8"
                        />

                        <WheelModel
                            onHotspotClick={handleHotspotClick}
                            onBoundsReady={handleBoundsReady}
                            mouseRef={mouseRef}
                        />

                        {!isMobile && (
                            <ContactShadows
                                position={[0, -2.8, 0]}
                                opacity={0.35}
                                scale={6}
                                blur={2.5}
                            />
                        )}
                        <Environment preset="city" />
                    </Canvas>
                </Suspense>
            </div>
        </section>
    );
}

