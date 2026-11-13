import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";
import JsonLd from "@/components/JsonLd";
import { catalogCategories } from "@/lib/catalog-data";
import { breadcrumbLd, pageMetadata, productDescription, productLd, resolveProduct } from "@/lib/seo";

type Params = { params: Promise<{ category: string; product: string }> };

// Static designs are pre-rendered; products added in the admin (Supabase) render on demand.
export const dynamicParams = true;
export const revalidate = 3600;

export function generateStaticParams() {
    return catalogCategories.flatMap((c) => c.products.map((p) => ({ category: c.slug, product: p.slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { category, product } = await params;
    const resolved = await resolveProduct(category, product);
    if (resolved === null) return { title: "Not found", robots: { index: false } };
    if (!resolved) return pageMetadata({ title: "Forged Wheel", description: "Bespoke DRAXLER forged wheel.", path: `/catalog/${category}/${product}` });
    const { product: p, category: c } = resolved;
    return pageMetadata({
        title: `${p.name} Forged Wheel — ${c.name}`,
        description: productDescription(p, c),
        path: `/catalog/${category}/${product}`,
        image: p.image,
        imageAlt: `DRAXLER ${p.name} forged wheel`,
        keywords: [`${p.name}`, `draxler ${p.name.toLowerCase()}`, "forged wheels", c.name.toLowerCase()],
    });
}

export default async function Page({ params }: Params) {
    const { category, product } = await params;
    const resolved = await resolveProduct(category, product);
    if (resolved === null) notFound();
    const path = `/catalog/${category}/${product}`;

    return (
        <>
            {resolved && (
                <JsonLd
                    data={[
                        productLd(resolved, path),
                        breadcrumbLd([["Home", "/"], ["Catalog", "/catalog"], [resolved.category.name, `/catalog/${category}`], [resolved.product.name, path]]),
                    ]}
                />
            )}
            <ProductClient />
        </>
    );
}
