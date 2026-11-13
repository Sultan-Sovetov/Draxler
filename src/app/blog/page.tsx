import type { Metadata } from "next";
import BlogClient from "./BlogClient";
import JsonLd from "@/components/JsonLd";
import { BLOG_POSTS } from "@/lib/blog-data";
import { SITE_NAME, absoluteUrl, assetUrl, breadcrumbLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
    title: "Blog — Projects, New Cars & Wheel Engineering",
    description:
        "The DRAXLER blog: project stories, new arrivals from Ferrari, Lamborghini, Porsche and Mercedes, and practical guides to forged wheels and fitment.",
    path: "/blog",
    image: BLOG_POSTS[0]?.cover,
});

const ld = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} Blog`,
    url: absoluteUrl("/blog"),
    publisher: { "@id": `${absoluteUrl("/")}#organization` },
    blogPost: BLOG_POSTS.map((p) => ({
        "@type": "BlogPosting",
        headline: p.title,
        url: absoluteUrl(`/blog/${p.slug}`),
        datePublished: p.date,
        image: assetUrl(p.cover),
    })),
};

export default function Page() {
    return (
        <>
            <JsonLd data={[ld, breadcrumbLd([["Home", "/"], ["Blog", "/blog"]])]} />
            <BlogClient />
        </>
    );
}
