import type { Metadata } from "next";
import CatalogClient from "./CatalogClient";
import JsonLd from "@/components/JsonLd";
import { catalogCategories } from "@/lib/catalog-data";
import { absoluteUrl, assetUrl, breadcrumbLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
    title: "Forged Wheel Catalog — Luxury, Off-Road & Sport Series",
    description:
        "Browse the DRAXLER forged wheel catalog: Luxury, Off-Road and Sport series. Every design made to order in any size 15–30\", any finish, with guaranteed fitment.",
    path: "/catalog",
    image: "/catalog/luxury/DRX_101_angle.png",
    imageAlt: "DRAXLER DRX-101 forged wheel",
});

const itemListLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "DRAXLER forged wheel catalog",
    url: absoluteUrl("/catalog"),
    mainEntity: {
        "@type": "ItemList",
        numberOfItems: catalogCategories.reduce((n, c) => n + c.products.length, 0),
        itemListElement: catalogCategories.flatMap((c) => c.products).map((p, i) => {
            const cat = catalogCategories.find((c) => c.products.includes(p))!;
            return { "@type": "ListItem", position: i + 1, name: `DRAXLER ${p.name}`, url: absoluteUrl(`/catalog/${cat.slug}/${p.slug}`), image: assetUrl(p.image) };
        }),
    },
};

export default function Page() {
    return (
        <>
            <JsonLd data={[itemListLd, breadcrumbLd([["Home", "/"], ["Catalog", "/catalog"]])]} />
            <h1 className="sr-only">DRAXLER forged wheel catalog — Luxury, Off-Road and Sport series</h1>
            <CatalogClient />
        </>
    );
}
