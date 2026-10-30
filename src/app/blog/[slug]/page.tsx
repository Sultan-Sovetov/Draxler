import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import { BLOG_POSTS, BlogBlock, formatPostDate, getPostBySlug } from "@/lib/blog-data";
import styles from "./article.module.css";

export function generateStaticParams() {
    return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const post = getPostBySlug((await params).slug);
    if (!post) return {};
    return {
        title: `${post.title} — DRAXLER Blog`,
        description: post.excerpt,
        openGraph: { title: post.title, description: post.excerpt },
    };
}

function Block({ block }: { block: BlogBlock }) {
    switch (block.type) {
        case "h":
            return <h2>{block.text}</h2>;
        case "quote":
            return (
                <blockquote>
                    <p>{block.text}</p>
                    {block.cite && <cite>— {block.cite}</cite>}
                </blockquote>
            );
        case "specs":
            return (
                <figure className={styles.specs}>
                    <figcaption>{block.title}</figcaption>
                    <dl>
                        {block.rows.map(([label, value]) => (
                            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                        ))}
                    </dl>
                </figure>
            );
        case "list":
            return <ul>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
        default:
            return <p>{block.text}</p>;
    }
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const post = getPostBySlug((await params).slug);
    if (!post) notFound();

    const index = BLOG_POSTS.findIndex((item) => item.slug === post.slug);
    const related = [
        ...BLOG_POSTS.filter((item) => item.slug !== post.slug && item.category === post.category),
        ...BLOG_POSTS.filter((item) => item.slug !== post.slug && item.category !== post.category),
    ].slice(0, 3);
    const next = BLOG_POSTS[(index + 1) % BLOG_POSTS.length];

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <Image src={post.cover} alt={post.title} fill priority sizes="100vw" className={styles.heroImage} style={{ objectPosition: post.coverPosition ?? "center" }} />
                <div className={styles.heroShade} />
                <div className={styles.heroCopy}>
                    <nav className={styles.crumbs} aria-label="Breadcrumb">
                        <Link href="/">Home</Link><span>/</span><Link href="/blog">Blog</Link><span>/</span><span>{post.category}</span>
                    </nav>
                    <h1>{post.title}</h1>
                    <div className={styles.heroMeta}>
                        <span>By {post.author}</span>
                        <span>{formatPostDate(post.date)}</span>
                        <span>{post.readTime}</span>
                    </div>
                </div>
            </section>

            <article className={styles.article}>
                <aside className={styles.aside}>
                    <Link href="/blog" className={styles.back}>← All stories</Link>
                    <span className={styles.asideLabel}>Category</span>
                    <strong>{post.category}</strong>
                    <span className={styles.asideLabel}>Tags</span>
                    <ul className={styles.tags}>{post.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
                </aside>

                <div className={styles.body}>
                    <p className={styles.lead}>{post.excerpt}</p>
                    {post.body.map((block, blockIndex) => <Block key={blockIndex} block={block} />)}
                    {post.credit && <p className={styles.credit}>{post.credit}</p>}

                    <div className={styles.cta}>
                        <span>Build your own</span>
                        <strong>Forged wheels engineered for your car.</strong>
                        <div>
                            <Link href="/catalog">Explore the catalog <b aria-hidden="true">↗</b></Link>
                            <Link href="/projects">Our projects <b aria-hidden="true">↗</b></Link>
                        </div>
                    </div>
                </div>
            </article>

            <Link href={`/blog/${next.slug}`} className={styles.next}>
                <span className={styles.nextImage}>
                    <Image src={next.cover} alt="" fill sizes="100vw" />
                </span>
                <span className={styles.nextCopy}>
                    <small>Next story</small>
                    <strong>{next.title}</strong>
                    <i aria-hidden="true">↗</i>
                </span>
            </Link>

            <section className={styles.related} aria-labelledby="related-heading">
                <h2 id="related-heading">More from the blog</h2>
                <div className={styles.relatedGrid}>
                    {related.map((item) => (
                        <Link key={item.slug} href={`/blog/${item.slug}`} className={styles.relatedCard}>
                            <span className={styles.relatedImage}>
                                <Image src={item.cover} alt={item.title} fill sizes="(max-width: 800px) 100vw, 33vw" />
                            </span>
                            <small>{item.category} / {formatPostDate(item.date)}</small>
                            <strong>{item.title}</strong>
                        </Link>
                    ))}
                </div>
            </section>

            <div className="pdp-page-footer"><Footer /></div>
        </main>
    );
}
