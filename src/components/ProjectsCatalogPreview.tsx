"use client";

import Link from "next/link";
import styles from "./ProjectsCatalogPreview.module.css";

const PROJECT_IMAGE = "https://r2.mbdesign.shop/cdn/width/2560/media/d1/c0/e0/1589391975/mercedes-g-klasse-24zoll-2d9vxldnzT06il.jpg?ts=1713635645";

export default function ProjectsCatalogPreview() {
    return (
        <section className={styles.projects} aria-labelledby="projects-heading">
            <div className={styles.imageFrame}>
                <img src={PROJECT_IMAGE} alt="Mercedes-AMG G 63 fitted with performance wheels" className={styles.image} />
                <div className={styles.imageShade} />
            </div>
            <div className={styles.copy}>
                <span className={styles.eyebrow}>Selected builds / 01</span>
                <h2 id="projects-heading">OUR PROJECTS</h2>
                <p>Vehicle-specific studies where stance, proportion and forged architecture are resolved as one.</p>
                <Link href="/catalog/projects" className={styles.link}>
                    Explore the G‑Wagon project <span aria-hidden="true">↗</span>
                </Link>
            </div>
        </section>
    );
}
