"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type FeatureId = 1 | 2 | 3 | 4 | 5 | 6;

type FeatureItem = {
  id: FeatureId;
  title: string;
  description: string;
  side: "left" | "right";
};

type ConnectorGeometry = {
  id: FeatureId;
  path: string;
  hotspotX: number;
  hotspotY: number;
};

const HOTSPOTS: Record<FeatureId, { x: number; y: number }> = {
  1: { x: 12, y: 24 },
  2: { x: 16, y: 50 },
  5: { x: 19, y: 76 },
  3: { x: 88, y: 24 },
  4: { x: 84, y: 50 },
  6: { x: 81, y: 76 },
};

const FEATURES: FeatureItem[] = [
  {
    id: 1,
    side: "left",
    title: "WEIGHT & STRENGTH",
    description:
      "Forged wheels are on average 20% lighter than cast alternatives. Due to the dense grain structure, they are also 30% stronger.",
  },
  {
    id: 2,
    side: "left",
    title: "EFFICIENCY & DYNAMICS",
    description:
      "Reduced unsprung weight improves fuel economy and significantly lowers stress on suspension components.",
  },
  {
    id: 3,
    side: "right",
    title: "BESPOKE DESIGN",
    description:
      "Thanks to individual engineering, virtually any complex design concept can be realized without limitations.",
  },
  {
    id: 4,
    side: "right",
    title: "IMPACT RESILIENCE",
    description:
      "Forged wheel blanks are compressed under extreme pressure, creating a denser internal structure that better resists cracking from pothole and curb impacts in real-world road conditions.",
  },
  {
    id: 5,
    side: "left",
    title: "PRECISION TOLERANCES",
    description:
      "Multi-axis CNC machining after forging achieves micron-level accuracy, ensuring perfect hub-centric fitment and flawless rotational balance.",
  },
  {
    id: 6,
    side: "right",
    title: "THERMAL PERFORMANCE",
    description:
      "The dense crystalline structure of forged aluminum dissipates brake heat far more effectively, reducing fade and extending component lifespan.",
  },
];

export default function ForgingFeatures() {
  const [activeId, setActiveId] = useState<FeatureId | null>(null);
  const [connectors, setConnectors] = useState<ConnectorGeometry[]>([]);
  const [svgSize, setSvgSize] = useState({ width: 1, height: 1 });

  const layoutRef = useRef<HTMLDivElement>(null);
  const rimRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Record<FeatureId, HTMLElement | null>>({
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
  });

  const leftFeatures = FEATURES.filter((feature) => feature.side === "left");
  const rightFeatures = FEATURES.filter((feature) => feature.side === "right");

  useEffect(() => {
    const measure = () => {
      const layoutEl = layoutRef.current;
      const rimEl = rimRef.current;
      if (!layoutEl || !rimEl) return;

      const layoutRect = layoutEl.getBoundingClientRect();
      const rimRect = rimEl.getBoundingClientRect();
      setSvgSize({ width: layoutRect.width || 1, height: layoutRect.height || 1 });

      const nextConnectors = FEATURES.map((feature) => {
        const blockEl = blockRefs.current[feature.id];
        if (!blockEl) return null;

        const blockRect = blockEl.getBoundingClientRect();
        const hotspot = HOTSPOTS[feature.id];

        const startX = rimRect.left + (rimRect.width * hotspot.x) / 100 - layoutRect.left;
        const startY = rimRect.top + (rimRect.height * hotspot.y) / 100 - layoutRect.top;

        const endX =
          feature.side === "left"
            ? blockRect.right + 12 - layoutRect.left
            : blockRect.left - 12 - layoutRect.left;
        const endY = blockRect.top + 16 - layoutRect.top;

        const cp1x = feature.side === "left" ? startX - 56 : startX + 56;
        const cp1y = startY;
        const cp2x = startX + (endX - startX) * 0.58;
        const cp2y = endY;

        return {
          id: feature.id,
          hotspotX: startX,
          hotspotY: startY,
          path: `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`,
        } as ConnectorGeometry;
      }).filter((item): item is ConnectorGeometry => item !== null);

      setConnectors(nextConnectors);
    };

    let rafId: number | null = null;
    const debouncedMeasure = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measure);
    };

    measure();

    const resizeObserver = new ResizeObserver(debouncedMeasure);
    if (layoutRef.current) resizeObserver.observe(layoutRef.current);
    if (rimRef.current) resizeObserver.observe(rimRef.current);
    FEATURES.forEach((feature) => {
      const el = blockRefs.current[feature.id];
      if (el) resizeObserver.observe(el);
    });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <section className="forging-features" aria-label="The advantages of forging">
      <h2 className="forging-features-title">THE ADVANTAGES OF FORGING</h2>

      <div className="forging-features-layout" ref={layoutRef}>
        <svg
          className="forging-connector-layer"
          viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {connectors.map((connector) => (
            <path
              key={`line-${connector.id}`}
              className={`forging-connector-path ${activeId === connector.id ? "is-active" : ""}`}
              d={connector.path}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {connectors.map((connector) => (
            <circle
              key={`dot-${connector.id}`}
              className={`forging-hotspot-dot ${activeId === connector.id ? "is-active" : ""}`}
              cx={connector.hotspotX}
              cy={connector.hotspotY}
              r="4"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        <div className="forging-features-column forging-features-column--left">
          {leftFeatures.map((feature) => (
            <article
              key={feature.id}
              className={`forging-feature-block ${activeId === feature.id ? "is-active" : ""}`}
              ref={(node) => {
                blockRefs.current[feature.id] = node;
              }}
              onMouseEnter={() => setActiveId(feature.id)}
              onMouseLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(feature.id)}
              onBlur={() => setActiveId(null)}
              tabIndex={0}
            >
              <h3 className="forging-feature-title">{feature.title}</h3>
              <p className="forging-feature-description">{feature.description}</p>
            </article>
          ))}
        </div>

        <div className="forging-features-center" aria-hidden="true">
          <div className="forging-features-rim-wrap" ref={rimRef}>
            <Image
              src="/media/rim%20info.png"
              alt="Forged wheel engineering overview"
              width={500}
              height={500}
              className="forging-features-rim"
              sizes="(max-width: 960px) 75vw, 500px"
            />
          </div>
        </div>

        <div className="forging-features-column forging-features-column--right">
          {rightFeatures.map((feature) => (
            <article
              key={feature.id}
              className={`forging-feature-block ${activeId === feature.id ? "is-active" : ""}`}
              ref={(node) => {
                blockRefs.current[feature.id] = node;
              }}
              onMouseEnter={() => setActiveId(feature.id)}
              onMouseLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(feature.id)}
              onBlur={() => setActiveId(null)}
              tabIndex={0}
            >
              <h3 className="forging-feature-title">{feature.title}</h3>
              <p className="forging-feature-description">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
