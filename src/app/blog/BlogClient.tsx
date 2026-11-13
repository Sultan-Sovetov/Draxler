"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Footer from "@/components/Footer";
import { BLOG_CATEGORIES, BLOG_POSTS, BlogCategory, BlogPost, formatPostDate } from "@/lib/blog-data";
import styles from "./blog.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;

function PostMeta({ post }: { post: BlogPost }) {
    return (
        <span className={styles.meta}>
            DRAXLER / {post.category} / {formatPostDate(post.date)}
        </span>
    );
}

function PostCard({ post, index }: { post: BlogPost; index: number }) {
    return (
        <motion.article
            layout
            className={styles.card}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.25 } }}
            transition={{ duration: 0.75, ease: EASE, delay: (index % 3) * 0.08 }}
        >
            <Link href={`/blog/${post.slug}`} className={styles.cardLink}>
                <span className={styles.cardImage}>
                    <Image
                        src={post.cover}
                        alt={post.title}
                        fill
                        sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
                        style={{ objectPosition: post.coverPosition ?? "center" }}
                    />
                    <span className={styles.cardRead}>Read article <b aria-hidden="true">↗</b></span>
                </span>
                <PostMeta post={post} />
                <h2 className={styles.cardTitle}><span>{post.title}</span></h2>
                <span className={styles.byline}>By {post.author} · {post.readTime}</span>
                <p className={styles.excerpt}>{post.excerpt} <em>more</em></p>
            </Link>
        </motion.article>
    );
}

export default function BlogPage() {
    const [category, setCategory] = useState<"all" | BlogCategory>("all");

    const [featured, ...rest] = BLOG_POSTS;
    const showFeatured = category === "all";

    const visible = useMemo(() => {
        if (category === "all") return rest;
        return BLOG_POSTS.filter((post) => post.category === category);
    }, [category, rest]);

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <motion.span className={styles.rule} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.1, ease: EASE }} />
                <motion.h1 initial={{ opacity: 0, letterSpacing: "0.6em" }} animate={{ opacity: 1, letterSpacing: "0.32em" }} transition={{ duration: 1.1, ease: EASE }}>
                    BLOG
                </motion.h1>
                <motion.span className={`${styles.rule} ${styles.ruleRight}`} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.1, ease: EASE }} />
                <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}>
                    Project stories, new arrivals from the world’s great marques and the engineering behind forged wheels.
                </motion.p>
            </header>

            <motion.nav
                className={styles.filters}
                aria-label="Blog categories"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
            >
                {(["all", ...BLOG_CATEGORIES] as const).map((option) => (
                    <button
                        key={option}
                        type="button"
                        className={category === option ? styles.filterActive : undefined}
                        aria-pressed={category === option}
                        onClick={() => setCategory(option)}
                    >
                        {option === "all" ? "All stories" : option}
                        {category === option && <motion.span layoutId="blog-filter" className={styles.filterLine} transition={{ duration: 0.45, ease: EASE }} />}
                    </button>
                ))}
            </motion.nav>

            <AnimatePresence initial={false}>
                {showFeatured && (
                    <motion.section
                        className={styles.featured}
                        aria-label="Featured story"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
                    >
                        <Link href={`/blog/${featured.slug}`} className={styles.featuredLink}>
                            <span className={styles.featuredImage}>
                                <Image src={featured.cover} alt={featured.title} fill priority sizes="(max-width: 900px) 100vw, 60vw" />
                            </span>
                            <span className={styles.featuredCopy}>
                                <span className={styles.featuredTag}>Featured</span>
                                <PostMeta post={featured} />
                                <strong className={styles.featuredTitle}>{featured.title}</strong>
                                <span className={styles.byline}>By {featured.author} · {featured.readTime}</span>
                                <span className={styles.excerpt}>{featured.excerpt}</span>
                                <span className={styles.featuredCta}>Read the story <b aria-hidden="true">↗</b></span>
                            </span>
                        </Link>
                    </motion.section>
                )}
            </AnimatePresence>

            <section className={styles.grid} aria-label="Articles">
                <AnimatePresence mode="popLayout">
                    {visible.map((post, index) => (
                        <PostCard key={post.slug} post={post} index={index} />
                    ))}
                </AnimatePresence>
            </section>

            <div className="pdp-page-footer"><Footer /></div>
        </main>
    );
}
