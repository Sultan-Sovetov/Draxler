"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search, X } from "lucide-react";
import Footer from "@/components/Footer";
import { PROJECTS, PROJECT_CATEGORIES, ProjectCategory, VehicleProject } from "@/lib/projects-data";
import styles from "./projects.module.css";

type Filter = "all" | ProjectCategory;

const EASE = [0.22, 1, 0.36, 1] as const;

function ProjectTile({ project, index }: { project: VehicleProject; index: number }) {
    const isLive = Boolean(project.href);
    const content = (
        <>
            <Image
                src={project.image}
                alt={`${project.make} ${project.model}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 25vw"
                className={styles.tileImage}
                priority={index < 4}
            />
            <span className={styles.tileShade} aria-hidden="true" />
            {isLive && <span className={styles.liveBadge}>Live study</span>}
            <span className={styles.tileInfo}>
                <span className={styles.tileMake}>{project.make} / {project.category}</span>
                <strong className={styles.tileModel}>{project.model}</strong>
                <span className={styles.tileSummary}>{project.summary}</span>
                <span className={styles.tileSpec}>{project.wheel} · {project.spec}</span>
                {isLive ? (
                    <span className={styles.tileCta}>View project <b aria-hidden="true">↗</b></span>
                ) : (
                    <span className={`${styles.tileCta} ${styles.tileCtaMuted}`}>Study in progress</span>
                )}
            </span>
        </>
    );

    return (
        <motion.li
            layout
            className={styles.tileItem}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
            transition={{ duration: 0.65, ease: EASE, delay: Math.min(index, 8) * 0.05 }}
        >
            {isLive ? (
                <Link href={project.href!} className={`${styles.tile} ${styles.tileLive}`} aria-label={`Open the ${project.make} ${project.model} project`}>
                    {content}
                </Link>
            ) : (
                <div className={styles.tile} tabIndex={0} aria-label={`${project.make} ${project.model}: project page coming soon`}>
                    {content}
                </div>
            )}
        </motion.li>
    );
}

export default function ProjectsPage() {
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<Filter>("all");
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!menuOpen) return;
        const close = (event: MouseEvent | KeyboardEvent) => {
            if (event instanceof KeyboardEvent) {
                if (event.key === "Escape") setMenuOpen(false);
                return;
            }
            if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
        };
        document.addEventListener("mousedown", close);
        document.addEventListener("keydown", close);
        return () => {
            document.removeEventListener("mousedown", close);
            document.removeEventListener("keydown", close);
        };
    }, [menuOpen]);

    const counts = useMemo(() => {
        const result: Record<string, number> = { all: PROJECTS.length };
        PROJECT_CATEGORIES.forEach((category) => {
            result[category] = PROJECTS.filter((project) => project.category === category).length;
        });
        return result;
    }, []);

    const visible = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return PROJECTS.filter((project) => {
            if (filter !== "all" && project.category !== filter) return false;
            if (!needle) return true;
            return [project.make, project.model, project.category, project.wheel, project.spec]
                .join(" ")
                .toLowerCase()
                .includes(needle);
        });
    }, [filter, query]);

    const filterLabel = filter === "all" ? "All vehicles" : filter;

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <motion.span className={styles.eyebrow} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
                    DRAXLER / Vehicle studies
                </motion.span>
                <motion.h1 initial={{ opacity: 0, y: 34 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.08 }}>
                    OUR<br />PROJECTS
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.18 }}>
                    Vehicle-specific studies where stance, proportion and forged architecture are resolved as one. Explore the archive by marque, body style or wheel.
                </motion.p>
                <motion.div className={styles.headerCount} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
                    <strong>{String(PROJECTS.length).padStart(2, "0")}</strong>
                    <span>Vehicles<br />in the archive</span>
                </motion.div>
            </header>

            <motion.div className={styles.toolbar} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}>
                <label className={styles.search}>
                    <span className="sr-only">Search the gallery</span>
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search gallery..."
                        autoComplete="off"
                    />
                    {query ? (
                        <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={16} /></button>
                    ) : (
                        <Search size={16} aria-hidden="true" />
                    )}
                </label>

                <div className={styles.select} ref={menuRef}>
                    <button
                        type="button"
                        className={styles.selectButton}
                        aria-haspopup="listbox"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        <span>{filterLabel}</span>
                        <ChevronDown size={18} className={menuOpen ? styles.chevronOpen : undefined} aria-hidden="true" />
                    </button>
                    <AnimatePresence>
                        {menuOpen && (
                            <motion.ul
                                className={styles.selectMenu}
                                role="listbox"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.22, ease: EASE }}
                            >
                                {(["all", ...PROJECT_CATEGORIES] as Filter[]).map((option) => (
                                    <li key={option}>
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={filter === option}
                                            className={filter === option ? styles.optionActive : undefined}
                                            onClick={() => {
                                                setFilter(option);
                                                setMenuOpen(false);
                                            }}
                                        >
                                            <span>{option === "all" ? "All vehicles" : option}</span>
                                            <small>{String(counts[option]).padStart(2, "0")}</small>
                                        </button>
                                    </li>
                                ))}
                            </motion.ul>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            <section className={styles.gallery} aria-label="Vehicle projects">
                <motion.ul layout className={styles.grid}>
                    <AnimatePresence mode="popLayout">
                        {visible.map((project, index) => (
                            <ProjectTile key={project.slug} project={project} index={index} />
                        ))}
                    </AnimatePresence>
                </motion.ul>

                <AnimatePresence>
                    {visible.length === 0 && (
                        <motion.div
                            className={styles.empty}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <strong>No vehicles found</strong>
                            <p>Try another marque or reset the filters.</p>
                            <button type="button" onClick={() => { setQuery(""); setFilter("all"); }}>Reset filters</button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <details className={styles.credits}>
                    <summary>Photography credits</summary>
                    <p>
                        Gallery photography sourced from Wikimedia Commons:{" "}
                        {PROJECTS.filter((project) => project.credit).map((project, index, list) => (
                            <span key={project.slug}>
                                {project.make} {project.model} — {project.credit}{index < list.length - 1 ? "; " : "."}
                            </span>
                        ))}
                    </p>
                </details>
            </section>

            <div className="pdp-page-footer"><Footer /></div>
        </main>
    );
}
