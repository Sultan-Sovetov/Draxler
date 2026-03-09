"use client";

import { useEffect, useState } from "react";
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

  // Lock body scroll during loading
  useEffect(() => {
    if (loading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [loading]);

  return (
    <main className="min-h-screen bg-aero-dark text-aero-light overflow-x-hidden">
      {loading && <AeroLoader onComplete={() => setLoading(false)} />}

      <Navbar />

      <div>
        <Hero />
        <Gallery />
        <CarConfigurator />
        {/* <WheelShowcase /> */}
        <HomeCatalogPreview />
        <Roadmap />
        <ParallaxDivider src="/media/background%202.png" compact>
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
