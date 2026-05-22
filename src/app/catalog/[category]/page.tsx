"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { getCategoryBySlug, CatalogProduct } from "@/lib/catalog-data";
import { supabase } from "@/lib/supabase";

export default function CatalogCategoryPage() {
    const params = useParams();
    const categorySlug = params.category as string;
    const category = getCategoryBySlug(categorySlug);
    const gridRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    const [dbProducts, setDbProducts] = useState<CatalogProduct[]>([]);

    useEffect(() => {
        const fetchDbProducts = async () => {
            let dbCat = categorySlug;
            if (categorySlug === "vip") dbCat = "luxury";
            else if (categorySlug === "offroad") dbCat = "off-road";
            else if (categorySlug === "sport") dbCat = "sport";

            const { data, error } = await supabase
                .from("products")
                .select(`*, product_images ( image_url )`)
                .eq("type", dbCat)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("SUPABASE QUERY ERROR:", error.message, error.details, error.hint);
            }

            if (!error && data) {
                const fetched = (data || []).map((p: { id: number; title: string; description: string; parameters?: string; product_images?: { image_url: string }[] }) => {
                    let tags: string[] = [];
                    try { if (p.parameters) tags = JSON.parse(p.parameters).tags || []; } catch { /* ignore */ }
                    const rawImages = p.product_images || [];
                    const imageUrls = rawImages.map((img: { image_url: string }) => img.image_url) || [];
                    return {
                        slug: `${p.title.toLowerCase().replace(/\s+/g, '-')}-${p.id}`,
                        name: p.title,
                        image: imageUrls[0] || "/placeholder.png",
                        hoverImage: (imageUrls && imageUrls.length > 1) ? imageUrls[1] : (imageUrls[0] || "/placeholder.png"),
                        description: p.description,
                        sizes: tags,
                    };
                });
                setDbProducts(fetched);
            }
        };
        fetchDbProducts();
    }, [categorySlug]);

    const displayProducts = useMemo(() => {
        return [...(category?.products || []), ...dbProducts];
    }, [category, dbProducts]);

    useEffect(() => {
        if (!gridRef.current || !headerRef.current) return;

        const ctx = gsap.context(() => {
            // Header entrance
            gsap.from(headerRef.current, {
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: "power3.out",
                delay: 0.1,
            });

            // Staggered card animation
            const cards = gridRef.current!.querySelectorAll(".catalog-card");
            gsap.fromTo(
                cards,
                { opacity: 0, y: 60 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "power3.out",
                    delay: 0.3,
                }
            );
        });

        return () => ctx.revert();
    }, [categorySlug, displayProducts]);

    if (!category) {
        return (
            <div className="catalog-not-found">
                <h1>Category Not Found</h1>
                <Link href="/">Return Home</Link>
            </div>
        );
    }

    return (
        <>
            <div className="catalog-breadcrumbs">
                <Link href="/">Home</Link>
                <span className="catalog-breadcrumb-sep">/</span>
                <Link href="/catalog">Catalog</Link>
                <span className="catalog-breadcrumb-sep">/</span>
                <span className="catalog-breadcrumb-active">
                    {category.name}
                </span>
            </div>

            <div ref={headerRef} className="catalog-header">
                <h1 className="catalog-category-title">{category.name}</h1>
                <p className="catalog-category-desc">
                    {category.description}
                </p>
            </div>

            <div ref={gridRef} className="catalog-grid">
                {displayProducts.map((product) => (
                    <Link
                        key={product.slug}
                        href={`/catalog/${categorySlug}/${product.slug}`}
                        className="catalog-card"
                    >
                        <div className="catalog-card-image-wrap">
                            <Image
                                src={product.image}
                                alt={product.name}
                                width={1200}
                                height={1200}
                                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                className="catalog-img-default"
                                draggable={false}
                            />
                            {product.image !== product.hoverImage && (
                                <Image
                                    src={product.hoverImage}
                                    alt={product.name}
                                    width={1200}
                                    height={1200}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                    className="catalog-img-hover"
                                    draggable={false}
                                />
                            )}
                        </div>
                        <div className="catalog-card-meta">
                            <div className="catalog-card-name">{product.name}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </>
    );
}
