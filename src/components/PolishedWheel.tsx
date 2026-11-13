"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "/models/drx-202-web.glb";

type Pointer = { x: number; y: number; active: boolean };

/*
 * Soft product-photography studio: large diffused softboxes instead of hard strips,
 * so a matte (satin) metal reads as machined aluminium rather than chrome.
 */
function StudioEnvironment() {
    return (
        <Environment resolution={256} frames={1}>
            <color attach="background" args={["#232427"]} />
            {/* Big overhead softbox — the main key, gives the face its gentle gradient. */}
            <Lightformer form="rect" intensity={2.4} position={[0, 6, 1]} rotation-x={Math.PI / 2} scale={[14, 8, 1]} />
            {/* Front-left key, slightly warm, like a large octabox. */}
            <Lightformer form="rect" color="#fff6ec" intensity={1.6} position={[-5, 2, 5]} rotation-y={Math.PI / 4} scale={[6, 6, 1]} />
            {/* Cool rim from the right separates the barrel from the background. */}
            <Lightformer form="rect" color="#eef3ff" intensity={1.8} position={[6, 0.5, -1]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
            {/* Low front fill keeps the spokes' undersides from going black. */}
            <Lightformer form="rect" intensity={0.45} position={[0, -2, 7]} rotation-y={Math.PI} scale={[12, 4, 1]} />
            {/* Floor bounce. */}
            <Lightformer form="rect" color="#e9e6e1" intensity={0.45} position={[0, -6, 0]} rotation-x={-Math.PI / 2} scale={[14, 10, 1]} />
        </Environment>
    );
}

function Wheel({ pointer, reducedMotion, onReady }: { pointer: React.MutableRefObject<Pointer>; reducedMotion: boolean; onReady: () => void }) {
    const { scene } = useGLTF(MODEL_URL, false, true);
    const group = useRef<THREE.Group>(null);
    const glint = useRef<THREE.PointLight>(null);
    // Fit the wheel to the smaller side of the canvas so it is never clipped.
    const viewport = useThree((state) => state.viewport);

    const material = useMemo(
        () =>
            // Satin / matte machined aluminium: metallic, but with a broad, soft highlight.
            new THREE.MeshPhysicalMaterial({
                color: "#aeb1b5",
                metalness: 0.92,
                roughness: 0.4,
                clearcoat: 0.12,
                clearcoatRoughness: 0.6,
                envMapIntensity: 1.15,
                specularIntensity: 0.6,
            }),
        []
    );

    const model = useMemo(() => {
        const clone = scene.clone(true);
        clone.traverse((child) => {
            const mesh = child as THREE.Mesh;
            if (mesh.isMesh) {
                mesh.material = material;
                mesh.castShadow = false;
                mesh.receiveShadow = false;
            }
        });
        // Normalise: centre the wheel and scale it to a unit diameter.
        const box = new THREE.Box3().setFromObject(clone);
        const size = box.getSize(new THREE.Vector3());
        const centre = box.getCenter(new THREE.Vector3());
        clone.position.sub(centre);
        const wrapper = new THREE.Group();
        wrapper.add(clone);
        wrapper.userData.diameter = Math.max(size.x, size.y, size.z);
        return wrapper;
    }, [scene, material]);

    useEffect(() => () => material.dispose(), [material]);
    useEffect(() => {
        onReady();
    }, [onReady]);

    useFrame((state, delta) => {
        const g = group.current;
        if (!g) return;
        const t = state.clock.elapsedTime;
        const p = pointer.current;
        // Follow the cursor; drift slowly when it is outside the section.
        const idleX = reducedMotion ? 0 : Math.sin(t * 0.45) * 0.45;
        const idleY = reducedMotion ? 0 : Math.cos(t * 0.35) * 0.3;
        const tx = p.active ? p.x : idleX;
        const ty = p.active ? p.y : idleY;
        const ease = 1 - Math.exp(-delta * 3.2);
        g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, -0.38 + tx * 0.24, ease);
        g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, 0.05 - ty * 0.14, ease);
        g.position.y = reducedMotion ? 0 : Math.sin(t * 0.8) * 0.03;
        if (glint.current) {
            glint.current.position.x = THREE.MathUtils.lerp(glint.current.position.x, 1.5 + tx * 2.2, ease);
            glint.current.position.y = THREE.MathUtils.lerp(glint.current.position.y, 1.6 + ty * 1.6, ease);
        }
    });

    const fit = (Math.min(viewport.width, viewport.height) * 0.8) / (model.userData.diameter as number);

    return (
        <>
            {/* Soft travelling highlight that follows the cursor (no hard chrome hotspot). */}
            <pointLight ref={glint} position={[1.5, 1.6, 2.6]} intensity={7} distance={10} decay={1.6} color="#fffaf3" />
            <group ref={group} scale={fit}>
                <primitive object={model} />
            </group>
        </>
    );
}

export default function PolishedWheel({ className }: { className?: string }) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const pointer = useRef<Pointer>({ x: 0, y: 0, active: false });
    const [near, setNear] = useState(false);
    const [inView, setInView] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const handleReady = useCallback(() => setLoaded(true), []);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }, []);

    // Start downloading the (full-resolution) model well before the section is reached,
    // and only run the render loop while it is actually on screen.
    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const nearObserver = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setNear(true);
        }, { rootMargin: "1200px 0px" });
        const viewObserver = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "80px 0px" });
        nearObserver.observe(el);
        viewObserver.observe(el);
        return () => {
            nearObserver.disconnect();
            viewObserver.disconnect();
        };
    }, []);

    // Track the cursor across the parent section, not just the canvas.
    useEffect(() => {
        const el = wrapRef.current;
        const area = (el?.closest("section") as HTMLElement | null) ?? el;
        if (!el || !area) return;
        const update = (clientX: number, clientY: number) => {
            const rect = el.getBoundingClientRect();
            const nx = ((clientX - (rect.left + rect.width / 2)) / (rect.width / 2));
            const ny = ((clientY - (rect.top + rect.height / 2)) / (rect.height / 2));
            pointer.current = { x: THREE.MathUtils.clamp(nx, -1, 1), y: THREE.MathUtils.clamp(ny, -1, 1), active: true };
        };
        const onMove = (event: PointerEvent) => update(event.clientX, event.clientY);
        const onLeave = () => { pointer.current.active = false; };
        area.addEventListener("pointermove", onMove, { passive: true });
        area.addEventListener("pointerleave", onLeave);
        area.addEventListener("pointercancel", onLeave);
        return () => {
            area.removeEventListener("pointermove", onMove);
            area.removeEventListener("pointerleave", onLeave);
            area.removeEventListener("pointercancel", onLeave);
        };
    }, []);

    return (
        <div ref={wrapRef} className={className} aria-hidden="true">
            {near ? (
                <Canvas
                    frameloop={inView ? "always" : "never"}
                    dpr={[1, 1.75]}
                    camera={{ position: [0, 0, 4.4], fov: 32 }}
                    gl={{ alpha: true, antialias: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1 }}
                    onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
                    style={{ background: "transparent", touchAction: "pan-y", opacity: loaded ? 1 : 0, transition: "opacity 1.1s cubic-bezier(.22,1,.36,1)" }}
                >
                    <hemisphereLight args={["#f4f2ee", "#1c1d20", 0.3]} />
                    <directionalLight position={[-3, 4, 5]} intensity={1.1} color="#fff4e8" />
                    <directionalLight position={[4, -1, -3]} intensity={0.6} color="#dfe8ff" />
                    <Suspense fallback={null}>
                        <StudioEnvironment />
                        <Wheel pointer={pointer} reducedMotion={reducedMotion} onReady={handleReady} />
                    </Suspense>
                </Canvas>
            ) : null}
        </div>
    );
}
