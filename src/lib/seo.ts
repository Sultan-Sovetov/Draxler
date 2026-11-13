import { catalogCategories, getProductBySlug, type CatalogCategory, type CatalogProduct } from "@/lib/catalog-data";
import { cache } from "react";

/** Canonical origin. Override with NEXT_PUBLIC_SITE_URL on Vercel / Cloudflare if the domain changes. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://draxlerwheels.com").replace(/\/$/, "");
export const SITE_NAME = "DRAXLER";
export const DEFAULT_OG_IMAGE = "/opengraph-image";

export const CONTACT = {
    email: "sales@draxlerwheels.com",
    phone: "+77027543948",
    instagram: "https://www.instagram.com/draxler.wheels",
    whatsapp: "https://wa.me/77027543948",
};

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Encodes spaces etc. in local asset paths so they are valid absolute URLs. */
export const assetUrl = (path: string) => (path.startsWith("http") ? path : absoluteUrl(encodeURI(decodeURI(path))));

export const CATEGORY_SEO: Record<string, { title: string; description: string; keywords: string[] }> = {
    vip: {
        title: "Luxury Forged Wheels for Executive Saloons & SUVs",
        description:
            "DRAXLER Luxury series: bespoke forged monoblock wheels for Rolls-Royce, Bentley, Maybach, G-Class and Range Rover. Any size 19–26\", any finish, perfect fitment.",
        keywords: ["luxury forged wheels", "rolls royce wheels", "maybach wheels", "g wagon wheels", "custom monoblock wheels"],
    },
    offroad: {
        title: "Off-Road Forged Wheels & Beadlock Wheels",
        description:
            "DRAXLER Off-Road series: forged and beadlock wheels for G-Class, Defender, Raptor and pickups. Engineered load ratings, any offset, lifetime structural warranty.",
        keywords: ["off-road forged wheels", "beadlock wheels", "raptor forged wheels", "defender wheels", "truck forged wheels"],
    },
    sport: {
        title: "Sport Forged Wheels for Supercars & Track",
        description:
            "DRAXLER Sport series: lightweight forged wheels for Porsche, Lamborghini, Ferrari and BMW M. Aerospace 6061-T6, centerlock options, staggered fitments.",
        keywords: ["sport forged wheels", "porsche forged wheels", "lamborghini wheels", "lightweight track wheels", "centerlock wheels"],
    },
};

export function productDescription(product: CatalogProduct, category: CatalogCategory) {
    const sizes = product.sizes.length ? ` Available ${product.sizes.join(", ")}.` : "";
    const text = `${product.name} — ${category.name.toLowerCase()} forged wheel by DRAXLER. ${product.description}${sizes}`;
    return text.length > 160 ? `${text.slice(0, 157).replace(/\s+\S*$/, "")}…` : text;
}

/** Ensures a description sits in the 110–160 character window Google shows. */
export function clampDescription(text: string, max = 160) {
    const clean = text.replace(/\s+/g, " ").trim();
    return clean.length > max ? `${clean.slice(0, max - 3).replace(/\s+\S*$/, "")}…` : clean;
}

export type ResolvedProduct = {
    product: CatalogProduct;
    category: CatalogCategory;
    source: "static" | "db";
};

const DB_CATEGORY: Record<string, string> = { vip: "luxury", offroad: "off-road", sport: "sport" };

type DbRow = { id: number; title: string; description?: string | null; type: string; product_images?: { image_url: string }[] };

/**
 * Server-side reads go straight to Supabase's REST API: no realtime/WebSocket client
 * (which throws on Node 20 servers) and responses are cached by Next for an hour.
 */
async function supabaseRest(query: string, timeoutMs = 6000): Promise<DbRow[] | undefined> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return undefined;
    try {
        const res = await fetch(`${url}/rest/v1/products?${query}`, {
            headers: { apikey: key, Authorization: `Bearer ${key}` },
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(timeoutMs),
        });
        if (!res.ok) return undefined;
        return (await res.json()) as DbRow[];
    } catch {
        return undefined;
    }
}

/**
 * Server-side twin of the client lookup in the product page.
 * Returns `null` only when we are sure the product does not exist (so the route can 404),
 * and `undefined` when the database could not be reached (render normally).
 */
export const resolveProduct = cache(async (categorySlug: string, productSlug: string): Promise<ResolvedProduct | null | undefined> => {
    const category = catalogCategories.find((c) => c.slug === categorySlug);
    if (!category) return null;
    const local = getProductBySlug(categorySlug, productSlug);
    if (local) return { ...local, source: "static" };

    // Every catalog link to a database product ends in "-<id>" (see CategoryClient/CatalogClient),
    // so anything else that is not a static design cannot exist.
    const idMatch = productSlug.match(/-(\d+)$/);
    if (!idMatch) return null;
    const rows = await supabaseRest(`select=id,title,description,type,product_images(image_url)&id=eq.${Number(idMatch[1])}`);
    if (!rows) return undefined; // database unreachable: render normally, never 404 a real product
    const row = rows[0];
    if (!row) return null;
    const images = (row.product_images ?? []).map((i) => i.image_url);
    return {
        source: "db",
        category: catalogCategories.find((c) => DB_CATEGORY[c.slug] === row.type) ?? category,
        product: {
            slug: productSlug,
            name: row.title,
            image: images[0] ?? "/placeholder.png",
            hoverImage: images[1] ?? images[0] ?? "/placeholder.png",
            description: row.description ?? "",
            sizes: [],
        },
    };
});

/** DB products for the sitemap (best effort). */
export async function listDbProductPaths(): Promise<string[]> {
    const rows = await supabaseRest("select=id,title,type", 20000);
    if (!rows) return [];
    const bySlug: Record<string, string> = { luxury: "vip", vip: "vip", "off-road": "offroad", offroad: "offroad", sport: "sport" };
    return rows
        .map((p) => (bySlug[p.type] ? `/catalog/${bySlug[p.type]}/${p.title.toLowerCase().replace(/\s+/g, "-")}-${p.id}` : null))
        .filter((p): p is string => !!p);
}

type JsonLd = Record<string, unknown>;

export const organizationLd: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: "DRAXLER Wheels",
    url: SITE_URL,
    logo: absoluteUrl("/icon.svg"),
    email: CONTACT.email,
    telephone: CONTACT.phone,
    sameAs: [CONTACT.instagram],
    description:
        "DRAXLER engineers and manufactures bespoke forged wheels — monoblock, 2- and 3-piece, beadlock — in any size from 15\" to 30\" with guaranteed fitment and worldwide delivery.",
    contactPoint: [
        {
            "@type": "ContactPoint",
            telephone: CONTACT.phone,
            email: CONTACT.email,
            contactType: "sales",
            availableLanguage: ["English", "Russian"],
            areaServed: "Worldwide",
        },
    ],
};

export const websiteLd: JsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en",
};

export function breadcrumbLd(items: [string, string][]): JsonLd {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map(([name, path], i) => ({
            "@type": "ListItem",
            position: i + 1,
            name,
            item: absoluteUrl(path),
        })),
    };
}

export function productLd(p: ResolvedProduct, path: string): JsonLd {
    const images = Array.from(new Set([p.product.image, p.product.hoverImage])).map(assetUrl);
    return {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${absoluteUrl(path)}#product`,
        name: `DRAXLER ${p.product.name}`,
        sku: p.product.name,
        mpn: p.product.name,
        image: images,
        description: p.product.description || productDescription(p.product, p.category),
        category: `Forged wheels / ${p.category.name}`,
        brand: { "@type": "Brand", name: SITE_NAME },
        manufacturer: { "@id": `${SITE_URL}/#organization` },
        material: "Forged 6061-T6 aluminium",
        url: absoluteUrl(path),
        ...(p.product.sizes.length
            ? { additionalProperty: [{ "@type": "PropertyValue", name: "Available diameters", value: p.product.sizes.join(", ") }] }
            : {}),
    };
}

/** Inline JSON-LD; `<` is escaped so content can never close the script tag. */
export function jsonLdString(data: JsonLd | JsonLd[]) {
    return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Per-page metadata. Next.js replaces (does not merge) `openGraph`/`twitter` objects from parents,
 * so every page gets a complete set here.
 */
export function pageMetadata({
    title,
    description,
    path,
    image,
    imageAlt,
    type = "website",
    absoluteTitle = false,
    keywords,
    publishedTime,
    authors,
    tags,
}: {
    title: string;
    description: string;
    path: string;
    image?: string;
    imageAlt?: string;
    type?: "website" | "article";
    absoluteTitle?: boolean;
    keywords?: string[];
    publishedTime?: string;
    authors?: string[];
    tags?: string[];
}): import("next").Metadata {
    const desc = clampDescription(description);
    const ogTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
    const images = image ? [{ url: assetUrl(image), alt: imageAlt ?? title }] : undefined;
    return {
        title: absoluteTitle ? { absolute: title } : title,
        description: desc,
        ...(keywords ? { keywords } : {}),
        alternates: { canonical: path },
        openGraph: {
            type,
            siteName: SITE_NAME,
            locale: "en_US",
            url: path,
            title: ogTitle,
            description: desc,
            ...(images ? { images } : {}),
            ...(type === "article" ? { publishedTime, authors, tags } : {}),
        },
        twitter: {
            card: "summary_large_image",
            title: ogTitle,
            description: desc,
            ...(images ? { images: images.map((i) => i.url) } : {}),
        },
    };
}
