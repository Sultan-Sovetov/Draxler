"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "/models/drx-202-web.glb";

type Pointer = { x: number; y: number; active: boolean };

/* Studio built from light panels: sharp reflections on chrome without loading an HDR file. */
function StudioEnvironment() {
    return (
        <Environment resolution={512} frames={1}>
            {/* Dark studio + bright softboxes: the contrast is what reads as mirror polish. */}
            <color attach="background" args={["#47484b"]} />
            {/* Large soft fill behind the camera lifts the face to bright silver. */}
            <Lightformer form="rect" intensity={1.1} position={[0, 0, 8]} rotation-y={Math.PI} scale={[14, 9, 1]} />
            <Lightformer form="rect" intensity={6} position={[0, 5, -1]} rotation-x={Math.PI / 2} scale={[12, 1.4, 1]} />
            <Lightformer form="rect" intensity={3.2} position={[-5, 1.5, 0]} rotation-y={Math.PI / 2} scale={[10, 0.5, 1]} />
            <Lightformer form="rect" intensity={3.2} position={[5, -0.5, 0]} rotation-y={-Math.PI / 2} scale={[10, 0.5, 1]} />
            <Lightformer form="rect" intensity={2.2} position={[-3, -1, 4]} rotation-y={Math.PI / 5} scale={[1.2, 8, 1]} />
            <Lightformer form="rect" intensity={2.2} position={[3, 1, 4]} rotation-y={-Math.PI / 5} scale={[1.2, 8, 1]} />
            <Lightformer form="ring" intensity={4} position={[2.5, 2.5, 5]} scale={1.4} />
            <Lightformer form="rect" color="#f3f3f1" intensity={0.8} position={[0, -5, 1]} rotation-x={-Math.PI / 2} scale={[12, 4, 1]} />
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
            new THREE.MeshPhysicalMaterial({
                color: "#f5f6f8",
                metalness: 1,
                roughness: 0.06,
                clearcoat: 1,
                clearcoatRoughness: 0.03,
                envMapIntensity: 1.25,
                reflectivity: 1,
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
            <pointLight ref={glint} position={[1.5, 1.6, 2.6]} intensity={22} distance={9} color="#ffffff" />
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
                    <ambientLight intensity={0.25} />
                    <directionalLight position={[3, 4, 5]} intensity={1.4} />
                    <Suspense fallback={null}>
                        <StudioEnvironment />
                        <Wheel pointer={pointer} reducedMotion={reducedMotion} onReady={handleReady} />
                    </Suspense>
                </Canvas>
            ) : null}
        </div>
    );
}
