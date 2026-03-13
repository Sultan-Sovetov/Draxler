"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";

type LimitlessDockRowProps = {
  images: string[];
};

const MAX_SCALE = 1.28;
const SIGMA_MULTIPLIER = 0.9;

export default function LimitlessDockRow({ images }: LimitlessDockRowProps) {
  const dockRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const itemCentersRef = useRef<number[]>([]);
  const itemWidthRef = useRef(140);
  const pointerXRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  const cacheGeometry = useCallback(() => {
    const centers: number[] = [];
    let measuredWidth = itemWidthRef.current;

    for (const item of itemRefs.current) {
      if (!item) continue;
      const rect = item.getBoundingClientRect();
      centers.push(rect.left + rect.width / 2);
      measuredWidth = rect.width;
    }

    itemCentersRef.current = centers;
    itemWidthRef.current = measuredWidth;
  }, []);

  const applyScaleAt = useCallback((pointerX: number) => {
    const sigma = Math.max(56, itemWidthRef.current * SIGMA_MULTIPLIER);
    const denominator = 2 * sigma * sigma;

    itemRefs.current.forEach((item, index) => {
      if (!item) return;
      const centerX = itemCentersRef.current[index];
      if (typeof centerX !== "number") return;

      const dx = Math.abs(pointerX - centerX);
      const factor = Math.exp(-(dx * dx) / denominator);
      const scale = 1 + (MAX_SCALE - 1) * factor;
      item.style.transform = `scale(${scale.toFixed(3)})`;
    });
  }, []);

  const flushFrame = useCallback(() => {
    frameRef.current = null;
    if (pointerXRef.current === null) return;
    applyScaleAt(pointerXRef.current);
  }, [applyScaleAt]);

  const requestScaleUpdate = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = window.requestAnimationFrame(flushFrame);
  }, [flushFrame]);

  const handleMouseEnter = useCallback(() => {
    cacheGeometry();
    dockRef.current?.classList.add("is-interacting");
  }, [cacheGeometry]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      pointerXRef.current = event.clientX;
      requestScaleUpdate();
    },
    [requestScaleUpdate]
  );

  const handleMouseLeave = useCallback(() => {
    pointerXRef.current = null;
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    dockRef.current?.classList.remove("is-interacting");

    itemRefs.current.forEach((item) => {
      if (!item) return;
      item.style.transform = "scale(1)";
    });
  }, []);

  useEffect(() => {
    const onResize = () => {
      cacheGeometry();
      if (pointerXRef.current !== null) {
        applyScaleAt(pointerXRef.current);
      }
    };

    onResize();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [applyScaleAt, cacheGeometry]);

  return (
    <div
      ref={dockRef}
      className="gallery-limitless-dock"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="gallery-limitless-dock-track">
        {images.map((src, index) => (
          <div
            key={src}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            className="gallery-limitless-dock-item"
          >
            <Image
              src={src}
              alt={`Forged rim option ${index + 1}`}
              width={560}
              height={560}
              sizes="(max-width: 900px) 168px, 14.5vw"
              loading="lazy"
              className="gallery-limitless-dock-image"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
