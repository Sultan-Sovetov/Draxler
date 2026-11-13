import type { Metadata } from "next";
import ProjectsClient from "./ProjectsClient";
import JsonLd from "@/components/JsonLd";
import { PROJECTS } from "@/lib/projects-data";
import { absoluteUrl, assetUrl, breadcrumbLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
    title: "Our Projects — Forged Wheel Fitment Studies",
    description:
        "Vehicle-specific DRAXLER studies: G-Wagon, Urus, Cullinan, 911 and more. See stance, offset and forged wheel architecture resolved for each car.",
    path: "/projects",
    image: "/projects/g-wagon-graphite.jpg",
    imageAlt: "Mercedes-AMG G 63 on DRAXLER forged wheels",
});

const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "DRAXLER projects",
    url: absoluteUrl("/projects"),
    mainEntity: {
        "@type": "ItemList",
        numberOfItems: PROJECTS.length,
        itemListElement: PROJECTS.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${p.make} ${p.model} — ${p.wheel}`,
            image: assetUrl(p.image),
            ...(p.href ? { url: absoluteUrl(p.href) } : {}),
        })),
    },
};

export default function Page() {
    return (
        <>
            <JsonLd data={[ld, breadcrumbLd([["Home", "/"], ["Projects", "/projects"]])]} />
            <ProjectsClient />
        </>
    );
}
