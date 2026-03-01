"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { catalogCategories } from "@/lib/catalog-data";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CatalogPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      /* Animate each section header on scroll */
      pageRef.current!.querySelectorAll(".cat-section-header").forEach((header) => {
        const bar = header.querySelector(".cat-header-bar");
        const title = header.querySelector(".cat-header-title");
        const desc = header.querySelector(".cat-header-desc");
        const img = header.querySelector(".cat-header-image-wrap");

        if (bar) {
          gsap.from(bar, {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: header, start: "top 80%", once: true },
          });
        }
        if (title) {
          gsap.from(title, {
            opacity: 0,
            y: 30,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: header, start: "top 80%", once: true },
            delay: 0.2,
          });
        }
        if (desc) {
          gsap.from(desc, {
            opacity: 0,
            y: 25,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: header, start: "top 80%", once: true },
            delay: 0.35,
          });
        }
        if (img) {
          gsap.from(img, {
            opacity: 0,
            scale: 0.92,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: header, start: "top 80%", once: true },
          });
        }
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
    <div ref={pageRef}>
      {/* Slim Cinematic Hero */}
      <section className="cat-hero">
        <div className="cat-hero-bg" />
        <div className="cat-hero-gradient" />
      </section>

      {/* Global page title */}
      <div className="cat-page-title-wrap">
        <h1 className="cat-page-title">T H E &nbsp;&nbsp; C O L L E C T I O N</h1>
      </div>

      {catalogCategories.map((cat, idx) => {
        const isReversed = idx % 2 === 1;

        return (
          <section key={cat.slug} id={cat.slug} className="cat-section">
            {/* Split-screen header with angled bar */}
            <div className={`cat-section-header ${isReversed ? "cat-section-header--reversed" : ""}`}>
              <div className="cat-header-text">
                <div className="cat-header-bar">
                  <h2 className="cat-header-title">{cat.displayTitle}</h2>
                </div>
                <p className="cat-header-desc">{cat.description}</p>
              </div>
              <div className="cat-header-image-wrap">
                <Image
                  src={cat.headerImage}
                  alt={cat.name}
                  width={740}
                  height={740}
                  className="cat-header-image"
                  sizes="(max-width: 960px) 90vw, 50vw"
                  priority={idx === 0}
                />
              </div>
            </div>

            {/* Product grid */}
            <div className="cat-product-grid">
              {cat.products.map((product) => (
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
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="cat-product-img-default"
                      draggable={false}
                    />
                    <Image
                      src={product.hoverImage}
                      alt={`${product.name} angle view`}
                      width={1200}
                      height={1200}
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
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
          </section>
        );
      })}
    </div>
  );
}
