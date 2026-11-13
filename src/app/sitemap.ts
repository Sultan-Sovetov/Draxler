import type { MetadataRoute } from "next";
import { catalogCategories } from "@/lib/catalog-data";
import { BLOG_POSTS } from "@/lib/blog-data";
import { PROJECTS } from "@/lib/projects-data";
import { absoluteUrl, assetUrl, listDbProductPaths } from "@/lib/seo";

// Rebuilt at most once a day so products added in the admin appear automatically.
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const latestPost = BLOG_POSTS.map((p) => p.date).sort().at(-1) ?? "2026-01-01";
    const now = new Date();

    const pages: MetadataRoute.Sitemap = [
        { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1, images: [assetUrl("/hero/backhero1.jpg")] },
        { url: absoluteUrl("/catalog"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
        { url: absoluteUrl("/projects"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
        ...PROJECTS.filter((p) => p.href).map((p) => ({
            url: absoluteUrl(p.href as string),
            lastModified: now,
            changeFrequency: "monthly" as const,
            priority: 0.8,
            images: [assetUrl(p.image)],
        })),
        { url: absoluteUrl("/blog"), lastModified: new Date(latestPost), changeFrequency: "weekly", priority: 0.7 },
    ];

    const categories: MetadataRoute.Sitemap = catalogCategories.map((c) => ({
        url: absoluteUrl(`/catalog/${c.slug}`),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    const products: MetadataRoute.Sitemap = catalogCategories.flatMap((c) =>
        c.products.map((p) => ({
            url: absoluteUrl(`/catalog/${c.slug}/${p.slug}`),
            lastModified: now,
            changeFrequency: "monthly" as const,
            priority: 0.7,
            images: [assetUrl(p.image)],
        })),
    );

    const dbProducts: MetadataRoute.Sitemap = (await listDbProductPaths()).map((path) => ({
        url: absoluteUrl(path),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
    }));

    const posts: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
        url: absoluteUrl(`/blog/${p.slug}`),
        lastModified: new Date(`${p.date}T00:00:00Z`),
        changeFrequency: "monthly",
        priority: 0.6,
        images: [assetUrl(p.cover)],
    }));

    return [...pages, ...categories, ...products, ...dbProducts, ...posts];
}
