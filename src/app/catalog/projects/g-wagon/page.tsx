"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Footer from "@/components/Footer";
import styles from "./g-wagon.module.css";

const CarConfigurator = dynamic(() => import("@/components/CarConfigurator"), { ssr: false });

const images = {
    blue: "/projects/g-wagon-blue.jpg",
    graphite: "/projects/g-wagon-graphite.jpg",
    green: "/projects/g-wagon-green.jpg",
};

const gallery = [
    { src: images.graphite, label: "Mercedes-Benz on DRX-101", position: "center" },
    { src: images.green, label: "Mercedes-Benz on DRX-213", position: "center" },
    { src: images.blue, label: "Mercedes-Benz on DRX-305", position: "center" },
];

const featuredWheels = [
    { model: "DRX-101", image: "/catalog/luxury/DRX_101_angle.png", description: "Forged mesh" },
    { model: "DRX-102", image: "/catalog/luxury/DRX_102_angle.png", description: "Directional multi-spoke" },
    { model: "DRX-103", image: "/catalog/luxury/DRX_103_angle.png", description: "Sculpted five-spoke" },
    { model: "DRX-104", image: "/catalog/luxury/DRX_104_angle.png", description: "Precision twelve-spoke" },
];

const questions = [
    ["Which G-Wagon model is represented?", "The interactive study is built around the 2025 Mercedes-Benz G-Class AMG G 63. The fitment approach applies across the current W463 generation, subject to final measurements."],
    ["Can I configure every DRAXLER design?", "Use the configurator to explore the compatible DRAXLER wheel library on the G-Wagon model. Final availability is confirmed against brake clearance, diameter, width and offset."],
    ["Are the finishes shown final?", "They are a visual reference. Every forged set is made to order, so colour, metal finish, hardware and graphic detail can be tailored to the final brief."],
    ["How do I start a bespoke order?", "Choose a wheel in the configurator, select Finalize, and share your contact details. The DRAXLER team will return with a tailored fitment proposal."],
];

export default function GWagonProjectPage() {
    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <img src={images.graphite} alt="Mercedes-AMG G 63 in the DRAXLER G-Wagon project" className={styles.heroImage} />
                <div className={styles.heroShade} />
                <div className={styles.heroType}>
                    <span>DRAXLER / OUR PROJECTS / 01</span>
                    <h1>MERCEDES-BENZ<br /><i>G‑WAGON</i></h1>
                </div>
                <div className={styles.heroFoot}><span>2020–2026 G‑Class</span><span>Scroll to explore ↓</span></div>
            </section>

            <section className={styles.intro}>
                <div className={styles.introIndex}>01 / THE STUDY</div>
                <h2>MONUMENTAL<br />BY DESIGN.</h2>
                <div className={styles.introCopy}>
                    <p>The G‑Wagon is an exercise in presence. We approached this platform with restraint: forged geometry that gives the upright architecture a lower, wider and more deliberate stance.</p>
                    <p>Every DRAXLER wheel is engineered around exact fitment. No visual compromise. No generic offsets.</p>
                </div>
                <div className={styles.rimFeature}>
                    <div className={styles.rimCopy}><span>Forged for the G‑Class</span><strong>Choose your<br />architecture.</strong><p>Explore four DRAXLER designs. Open any wheel to see its finishes, sizes and details.</p></div>
                    <div className={styles.rimVisuals}>
                        {featuredWheels.map((wheel, index) => (
                            <Link className={styles.rimCard} href={`/catalog/vip/${wheel.model.toLowerCase()}`} key={wheel.model}>
                                <span className={styles.rimNumber}>0{index + 1}</span>
                                <img src={wheel.image} alt={`${wheel.model} forged wheel`} />
                                <span className={styles.rimCardInfo}><strong>{wheel.model}</strong><small>{wheel.description}</small><i>View wheel <b aria-hidden="true">↗</b></i></span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className={styles.gallerySection} aria-labelledby="gallery-heading">
                <div className={styles.sectionHeader}><span>02 / ON THE ROAD</span><h2 id="gallery-heading">G‑WAGON / DRAXLER</h2></div>
                <div className={styles.gallery}>
                    {gallery.map((item, index) => (
                        <figure className={`${styles.galleryItem} ${styles[`item${index}`]}`} key={item.label}>
                            <img src={item.src} alt={item.label} style={{ objectPosition: item.position }} />
                            <figcaption><span>{item.label}</span><b>+</b></figcaption>
                        </figure>
                    ))}
                </div>
            </section>

            <section className={styles.configuratorSection} aria-labelledby="configurator-heading">
                <div className={styles.sectionHeader}><span>03 / INTERACTIVE FITMENT</span><h2 id="configurator-heading">BUILD YOUR<br />G‑WAGON</h2><p>Only G‑Wagon. Every compatible DRAXLER wheel. Explore the stance before the first billet is cut.</p></div>
                <div className={styles.configuratorFrame}><CarConfigurator gWagonOnly whiteBackground toneMappingExposure={1.26} /></div>
            </section>

            <section className={styles.editorial}>
                <div className={styles.editorialImage}><img src={images.graphite} alt="Mercedes G-Class with forged wheels" /></div>
                <div className={styles.editorialCopy}><span>04 / ENGINEERED INDIVIDUALITY</span><h2>THE DETAIL<br />IS THE DESIGN.</h2><p>Wheel width, offset, centre bore and finish are not options added at the end. They are the starting point of a DRAXLER build.</p><p>For the G‑Class, the result is a composed silhouette that reads as factory-intentional — from the first glance to the final millimetre.</p></div>
            </section>

            <section className={styles.cta}>
                <span>05 / YOUR BUILD</span><h2>MAKE IT<br />YOURS.</h2><p>Start with the G‑Wagon configurator, then let us engineer the final specification around your vehicle.</p><a href="#configurator">Configure G‑Wagon <b>↗</b></a><a href="#contact" className={styles.contactLink}>Speak to DRAXLER</a>
            </section>

            <section className={styles.faq} aria-labelledby="faq-heading">
                <div><span>06 / QUESTIONS</span><h2 id="faq-heading">Q&amp;A</h2></div>
                <div className={styles.questions}>{questions.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div>
            </section>

            <div className="pdp-page-footer"><Footer /></div>
        </main>
    );
}
