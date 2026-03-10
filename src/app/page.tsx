"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import AeroLoader from "@/components/AeroLoader";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Gallery from "@/components/Gallery";
import HomeCatalogPreview from "@/components/HomeCatalogPreview";
import ForgingFeatures from "@/components/ForgingFeatures";
// import GlobalBespoke from "@/components/GlobalBespoke";
// Dynamically import WheelShowcase with SSR disabled to avoid Three.js/WebGL server build issues
// const WheelShowcase = dynamic(() => import("@/components/WheelShowcase"), { ssr: false });
const CarConfigurator = dynamic(() => import("@/components/CarConfigurator"), { ssr: false });
import ParallaxDivider from "@/components/ParallaxDivider";
import Roadmap from "@/components/Roadmap";
import Footer from "@/components/Footer";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [configNear, setConfigNear] = useState(false);
  const configSentinelRef = useRef<HTMLDivElement>(null);

  // Lock body scroll during loading
  useEffect(() => {
    if (loading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [loading]);

  // Defer CarConfigurator mount until near viewport — R3F costs ~14.9s of script eval
  useEffect(() => {
    const sentinel = configSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setConfigNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-aero-dark text-aero-light overflow-x-hidden">
      {loading && <AeroLoader onComplete={() => setLoading(false)} />}

      <Navbar />

      <div>
        <Hero />
        <Gallery />
        <div ref={configSentinelRef}>
          {configNear ? <CarConfigurator /> : (
            <section
              className="car-configurator-section"
              style={{ minHeight: "100vh" }}
              aria-hidden
            />
          )}
        </div>
        {/* <WheelShowcase /> */}
        <HomeCatalogPreview />
        <Roadmap />
        <ParallaxDivider src="/media/background_2.jpg" compact>
          <ForgingFeatures />
        </ParallaxDivider>
        {/* <ParallaxDivider reduced>
          <GlobalBespoke />
        </ParallaxDivider> */}
        {/* <SocialGrid /> */}
        {/* <FlashlightReveal /> */}
        <Footer />
      </div>
    </main>
  );
}
