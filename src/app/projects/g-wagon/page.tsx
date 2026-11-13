import type { Metadata } from "next";
import GWagonClient from "./GWagonClient";
import { G_WAGON_FAQ } from "./faq";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
    title: "G-Wagon Forged Wheels — Fitment Guide & 3D Configurator",
    description:
        "Forged wheels for the Mercedes-Benz G-Class (W463, 2020–2026): 5×130 fitment guide, recommended sizes and offsets, and a 3D configurator with every DRAXLER design.",
    path: "/projects/g-wagon",
    image: "/projects/g-wagon-graphite.jpg",
    imageAlt: "Mercedes-AMG G 63 on DRAXLER forged wheels",
    keywords: ["g wagon wheels", "g63 forged wheels", "g-class 23 inch wheels", "w463 wheels 5x130", "диски на гелендваген"],
});

const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: G_WAGON_FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
};

export default function Page() {
    return (
        <>
            <JsonLd data={[faqLd, breadcrumbLd([["Home", "/"], ["Projects", "/projects"], ["Mercedes-Benz G-Wagon", "/projects/g-wagon"]])]} />
            <GWagonClient />
        </>
    );
}
