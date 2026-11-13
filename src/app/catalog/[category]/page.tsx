import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryClient from "./CategoryClient";
import JsonLd from "@/components/JsonLd";
import { catalogCategories, getCategoryBySlug } from "@/lib/catalog-data";
import { CATEGORY_SEO, absoluteUrl, assetUrl, breadcrumbLd, pageMetadata } from "@/lib/seo";

type Params = { params: Promise<{ category: string }> };

export function generateStaticParams() {
    return catalogCategories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { category: slug } = await params;
    const category = getCategoryBySlug(slug);
    if (!category) return { title: "Not found", robots: { index: false } };
    const seo = CATEGORY_SEO[slug];
    return pageMetadata({
        title: seo?.title ?? category.name,
        description: seo?.description ?? category.description,
        keywords: seo?.keywords,
        path: `/catalog/${slug}`,
        image: category.products[0]?.image,
        imageAlt: `${category.name} — DRAXLER forged wheels`,
    });
}

export default async function Page({ params }: Params) {
    const { category: slug } = await params;
    const category = getCategoryBySlug(slug);
    if (!category) notFound();

    const listLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `DRAXLER ${category.name}`,
        description: category.description,
        url: absoluteUrl(`/catalog/${slug}`),
        mainEntity: {
            "@type": "ItemList",
            numberOfItems: category.products.length,
            itemListElement: category.products.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: `DRAXLER ${p.name}`,
                url: absoluteUrl(`/catalog/${slug}/${p.slug}`),
                image: assetUrl(p.image),
            })),
        },
    };

    return (
        <>
            <JsonLd data={[listLd, breadcrumbLd([["Home", "/"], ["Catalog", "/catalog"], [category.name, `/catalog/${slug}`]])]} />
            <CategoryClient />
        </>
    );
}
