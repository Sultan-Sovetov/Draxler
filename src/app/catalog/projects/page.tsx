import Link from "next/link";
import styles from "./projects.module.css";

const PROJECT_IMAGE = "https://forzaaa.com/cdn/shop/files/g63-offroad-2.jpg?v=1748949165&width=2560";

export default function ProjectsPage() {
    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <img src={PROJECT_IMAGE} alt="2025 Mercedes-AMG G 63 on forged wheels" className={styles.heroImage} />
                <div className={styles.heroShade} />
                <div className={styles.heroCopy}>
                    <span>DRAXLER / VEHICLE STUDIES</span>
                    <h1>OUR<br />PROJECTS</h1>
                    <p>One platform. One uncompromising point of view.</p>
                </div>
            </section>

            <section className={styles.listing} aria-label="Vehicle projects">
                <Link href="/catalog/projects/g-wagon" className={styles.projectCard}>
                    <div className={styles.cardImageWrap}>
                        <img src={PROJECT_IMAGE} alt="Mercedes-Benz G-Wagon project" className={styles.cardImage} />
                        <div className={styles.cardOverlay}><span>Open project</span><b>↗</b></div>
                    </div>
                    <div className={styles.cardMeta}>
                        <span>01 / Mercedes-Benz</span>
                        <h2>G‑WAGON</h2>
                        <p>2020–2026 G‑Class / forged fitment study</p>
                    </div>
                </Link>
            </section>
        </main>
    );
}
