"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import styles from "./g-wagon.module.css";
import FitmentGuide from "./FitmentGuide";
import { G_WAGON_FAQ } from "./faq";
import MobileConfiguratorTeaser from "@/components/MobileConfiguratorTeaser";
import { useIsPhone } from "@/lib/device";

const CarConfigurator = dynamic(() => import("@/components/CarConfigurator"), { ssr: false });
const PolishedWheel = dynamic(() => import("@/components/PolishedWheel"), { ssr: false });

const images = {
    blue: "/projects/g-wagon%20blue.png",
    graphite: "/projects/g-wagon-graphite.jpg",
    green: "/projects/g-wagon-green.jpg",
};

const gallery = [
    { src: images.green, label: "Mercedes-Benz on DRX-213", position: "center" },
    { src: images.graphite, label: "Mercedes-Benz on DRX-101", position: "center" },
    { src: images.blue, label: "Mercedes-Benz on DRX-305", position: "center" },
];

const featuredWheels = [
    { model: "DRX-101", image: "/catalog/luxury/DRX_101_angle.png", description: "Forged mesh" },
    { model: "DRX-102", image: "/catalog/luxury/DRX_102_angle.png", description: "Directional multi-spoke" },
    { model: "DRX-103", image: "/catalog/luxury/DRX_103_angle.png", description: "Sculpted five-spoke" },
    { model: "DRX-104", image: "/catalog/luxury/DRX_104_angle.png", description: "Precision twelve-spoke" },
    { model: "DRX-106", image: "/catalog/luxury/DRX_106_angle.png", description: "Turbine disc" },
    { model: "DRX-112", image: "/catalog/luxury/DRX_112_angle.png", description: "Seven split-spoke" },
];



export default function GWagonProjectPage() {
    // Phones: no WebGL on this page — static teaser + photo of the wheel instead.
    const isPhone = useIsPhone();
    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <Image src={images.graphite} alt="Mercedes-AMG G 63 in the DRAXLER G-Wagon project" className={styles.heroImage} width={1920} height={1080} sizes="100vw" priority />
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
                    <div className={styles.rimCopy}><span>Forged for the G‑Class</span><strong>Choose your<br />architecture.</strong><p>Explore six DRAXLER designs. Open any wheel to see its finishes, sizes and details.</p></div>
                    <div className={styles.rimVisuals}>
                        {featuredWheels.map((wheel, index) => (
                            <Link className={styles.rimCard} href={`/catalog/vip/${wheel.model.toLowerCase()}`} key={wheel.model}>
                                <span className={styles.rimNumber}>0{index + 1}</span>
                                <Image src={wheel.image} alt={`${wheel.model} forged wheel`} width={600} height={600} sizes="(max-width: 800px) 50vw, 20vw" />
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
                            <Image src={item.src} alt={item.label} style={{ objectPosition: item.position }} width={1600} height={1000} sizes="(max-width: 800px) 100vw, 60vw" />
                            <figcaption><span>{item.label}</span><b>+</b></figcaption>
                        </figure>
                    ))}
                </div>
            </section>

            <FitmentGuide />

            <section className={styles.configuratorSection} aria-labelledby="configurator-heading">
                <div className={styles.sectionHeader}><span>04 / INTERACTIVE FITMENT</span><h2 id="configurator-heading">BUILD YOUR<br />G‑WAGON</h2><p>Only G‑Wagon. Every compatible DRAXLER wheel. Explore the stance before the first billet is cut.</p></div>
                <div className={styles.configuratorFrame}>
                    {isPhone ? (
                        <MobileConfiguratorTeaser tone="light" title="Configure on desktop" />
                    ) : isPhone === false ? (
                        <CarConfigurator gWagonOnly whiteBackground toneMappingExposure={1.26} />
                    ) : (
                        <div style={{ minHeight: "100vh" }} aria-hidden />
                    )}
                </div>
            </section>

            <section className={`${styles.editorial} desktop-only`}>
                <div className={styles.editorialImage}><Image src={images.graphite} alt="Mercedes G-Class with forged wheels" width={1600} height={1200} sizes="(max-width: 800px) 100vw, 58vw" /></div>
                <div className={styles.editorialCopy}><span>05 / ENGINEERED INDIVIDUALITY</span><h2>THE DETAIL<br />IS THE DESIGN.</h2><p>Wheel width, offset, centre bore and finish are not options added at the end. They are the starting point of a DRAXLER build.</p><p>For the G‑Class, the result is a composed silhouette that reads as factory-intentional — from the first glance to the final millimetre.</p></div>
            </section>

            <section className={styles.cta}>
                <div className={styles.ctaCopy}>
                    <span>06 / YOUR BUILD</span><h2>MAKE IT<br />YOURS.</h2><p>Start with the G‑Wagon configurator, then let us engineer the final specification around your vehicle.</p><a href="#configurator">Configure G‑Wagon <b>↗</b></a><a href="#contact" className={styles.contactLink}>Speak to DRAXLER</a>
                </div>
                <div className={styles.ctaVisual}>
                    {isPhone ? (
                        <Image src="/media/DRX_202_angle.png" alt="DRAXLER DRX-202 forged wheel" fill sizes="100vw" className={styles.ctaStatic} />
                    ) : isPhone === false ? (
                        <PolishedWheel className={styles.ctaCanvas} />
                    ) : null}
                    <span className={styles.ctaWheelLabel}>DRX-202 / Satin silver</span>
                </div>
            </section>

            <section className={styles.faq} aria-labelledby="faq-heading">
                <div><span>07 / QUESTIONS</span><h2 id="faq-heading">Q&amp;A</h2></div>
                <div className={styles.questions}>{G_WAGON_FAQ.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div>
            </section>

            <div className="pdp-page-footer"><Footer /></div>
        </main>
    );
}
