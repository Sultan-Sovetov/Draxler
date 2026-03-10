"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { catalogCategories } from "@/lib/catalog-data";
import Footer from "@/components/Footer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ITEMS_PER_PAGE = 8; // 2 rows × 4 columns

export default function CatalogPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>(
    () => Object.fromEntries(catalogCategories.map((cat) => [cat.slug, ITEMS_PER_PAGE]))
  );

  const handleShowMore = useCallback((slug: string) => {
    setVisibleCounts((prev) => {
      const oldCount = prev[slug] ?? ITEMS_PER_PAGE;
      const newCount = oldCount + ITEMS_PER_PAGE;

      // Animate newly revealed cards after render
      requestAnimationFrame(() => {
        const section = pageRef.current?.querySelector(`#${slug}`);
        if (!section) return;
        const cards = section.querySelectorAll(".cat-product-card");
        const newCards = Array.from(cards).slice(oldCount);
        if (newCards.length > 0) {
          gsap.fromTo(
            newCards,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power3.out" }
          );
        }
      });

      return { ...prev, [slug]: newCount };
    });
  }, []);

  const categoryBackgroundBySlug: Record<string, string> = {
    vip: "/catalog/luxury phantom.jpg",
    offroad: "/catalog/offroad ford.jpg",
    sport: "/catalog/sport porsche.jpg",
  };

  const categoryHeadingBySlug: Record<string, string> = {
    vip: "Luxury Series Collection",
    offroad: "Off-Road Series Collection",
    sport: "Sport Series Collection",
  };

  useEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      /* Animate each section hero text on scroll */
      pageRef.current!.querySelectorAll(".cat-section-hero-content").forEach((heroContent) => {
        gsap.from(heroContent, {
          opacity: 0,
          y: 34,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: heroContent, start: "top 82%", once: true },
        });
      });

      /* Stagger product cards per section */
      pageRef.current!.querySelectorAll(".cat-product-grid").forEach((grid) => {
        const cards = grid.querySelectorAll(".cat-product-card");
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: { trigger: grid, start: "top 85%", once: true },
          }
        );
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="catalog-page">
      {catalogCategories.map((cat) => {
        const bgImage = categoryBackgroundBySlug[cat.slug] ?? "/catalog/luxury.jpg";

        return (
          <section key={cat.slug} id={cat.slug} className="cat-section">
            <div
              className="cat-section-hero"
              style={{
                backgroundImage: `url('${bgImage}')`,
              }}
            >
              <div className="cat-section-hero-overlay" />
              <div className="cat-hero-content cat-section-hero-content">
                <h2 className="cat-hero-title">{cat.displayTitle}</h2>
                <p className="cat-hero-description">{cat.description}</p>
              </div>
            </div>

            <div className="cat-block-heading-wrap">
              <h3 className="cat-block-heading">{categoryHeadingBySlug[cat.slug] ?? cat.name}</h3>
            </div>

            {/* Product grid */}
            <div className="cat-product-grid cat-product-grid--floating">
              {cat.products.slice(0, visibleCounts[cat.slug] ?? ITEMS_PER_PAGE).map((product) => (
                <Link
                  key={product.slug}
                  href={`/catalog/${cat.slug}/${product.slug}`}
                  className="cat-product-card"
                >
                  <div className="cat-product-image-wrap">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={1200}
                      height={1200}
                      sizes="(max-width: 960px) 100vw, (max-width: 1400px) 50vw, 25vw"
                      className="cat-product-img-default"
                      draggable={false}
                    />
                    <Image
                      src={product.hoverImage}
                      alt={`${product.name} angle view`}
                      width={1200}
                      height={1200}
                      sizes="(max-width: 960px) 100vw, (max-width: 1400px) 50vw, 25vw"
                      className="cat-product-img-hover"
                      draggable={false}
                    />
                  </div>
                  <div className="cat-product-info">
                    <span className="cat-product-name">{product.name}</span>
                    <span className="cat-product-price">{product.price}</span>
                  </div>
                </Link>
              ))}
            </div>

            {(visibleCounts[cat.slug] ?? ITEMS_PER_PAGE) < cat.products.length && (
              <div className="cat-see-more-wrap">
                <button
                  className="cat-see-more-btn"
                  onClick={() => handleShowMore(cat.slug)}
                >
                  See More
                </button>
              </div>
            )}
          </section>
        );
      })}

      <div className="pdp-page-footer">
        <Footer />
      </div>
    </div>
  );
}
