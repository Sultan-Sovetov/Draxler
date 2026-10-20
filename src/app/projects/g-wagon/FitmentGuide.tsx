"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./fitment.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;

/* The configurator below is pinned with ScrollTrigger; its start/end must be
   recalculated whenever the guide changes height. */
const refreshScrollTriggers = () => {
    requestAnimationFrame(() => ScrollTrigger.refresh());
};

const atAGlance: [string, string][] = [
    ["Platform", "W463A (2018–2024) / W465 (2024–)"],
    ["Bolt pattern (PCD)", "5×130"],
    ["Centre bore", "84.1 mm"],
    ["Wheel fasteners", "M14×1.5 wheel bolts, radius (ball) seat"],
    ["Factory AMG G 63 wheel", "20″ / 21″ / 22″ — 22×10J ET36"],
    ["Factory AMG G 63 tyre", "295/40 R22 (22″ package)"],
    ["Gross vehicle weight (AMG G 63)", "≈ 3,200 kg"],
    ["Minimum recommended wheel load rating", "≈ 1,040 kg per wheel"],
];

const factoryG63: [string, string, string, string][] = [
    ["20-inch package", "9.5J × 20 ET35", "275/50 R20", "Standard"],
    ["21-inch package", "10J × 21 ET33", "275/45 R21", "Optional"],
    ["22-inch package", "10J × 22 ET36", "295/40 R22", "Optional (AMG packages)"],
];

const factoryG500: [string, string, string, string][] = [
    ["18-inch package", "7.5J × 18 ET43", "265/60 R18", "Standard (market-dependent)"],
    ["19-inch package", "8.5J × 19 ET52", "275/55 R19", "Optional"],
    ["20-inch package", "8.5J × 20 ET32", "275/50 R20", "AMG Line option"],
];

const recommendations: { style: string; size: string; offset: string; tyre: string; outer: string; inner: string; note: string }[] = [
    { style: "Luxury / OEM+", size: "22 × 10J", offset: "ET35 – ET40", tyre: "295/40 R22", outer: "−4 to +1 mm", inner: "−1 to +4 mm", note: "Bolt-on. Factory stance, sharper design." },
    { style: "Sport / Flush", size: "23 × 10.5J", offset: "ET30 – ET35", tyre: "295/35 R23", outer: "+7 to +12 mm", inner: "0 to +5 mm", note: "Fills the arch. Most requested DRAXLER fitment." },
    { style: "Off-Road / Trail", size: "20 × 9.5J", offset: "ET35 – ET45", tyre: "275/55 R20 A/T", outer: "−15 to −5 mm", inner: "−7 to +3 mm", note: "Taller sidewall. Clears G 63 brakes at 20″." },
    { style: "Wide-body", size: "24 × 11J", offset: "ET20 – ET30", tyre: "305/30 R24", outer: "+19 to +29 mm", inner: "−3 to +7 mm", note: "Requires arch extensions. Engineered per car." },
];

const notes: { title: string; text: string }[] = [
    { title: "Brake clearance", text: "AMG G 63 front calipers set the floor at 20 inches. Spoke profile and barrel shape are checked against a caliper template before machining." },
    { title: "Hub-centric fit", text: "Every DRAXLER G-Class wheel is machined to 84.1 mm, so no hub rings are needed and the load is carried by the hub, not the bolts." },
    { title: "Fasteners", text: "Use radius-seat M14×1.5 bolts of the correct shank length for the new wheel face. Torque to the Mercedes-Benz specification and re-check after 50–100 km." },
    { title: "Rolling diameter", text: "Stay within ±3% of the factory 22-inch diameter (≈ 795 mm) to keep the speedometer, ABS and ESP calibration accurate." },
    { title: "TPMS", text: "Factory TPMS sensors transfer to every DRAXLER design. Valve position is set during the 3D fitment review." },
];

function SpecTable({ head, rows }: { head: string[]; rows: string[][] }) {
    return (
        <div className={styles.tableWrap}>
            <table className={styles.table}>
                <thead>
                    <tr>{head.map((cell) => <th key={cell} scope="col">{cell}</th>)}</tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row[0]}>
                            {row.map((cell, index) => index === 0 ? <th key={index} scope="row">{cell}</th> : <td key={index}>{cell}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function FitmentGuide() {
    const [open, setOpen] = useState(false);

    return (
        <section className={styles.guide} id="fitment" aria-labelledby="fitment-heading">
            <div className={styles.header}>
                <span>03 / FITMENT GUIDE</span>
                <h2 id="fitment-heading">G‑WAGON<br />WHEEL FITMENT</h2>
                <p>
                    The reference data our engineers start from when building forged wheels for the Mercedes-Benz G-Class.
                    Use it as a baseline — final specification is always confirmed against your own vehicle.
                </p>
            </div>

            <div className={styles.glance}>
                <h3>Fitment at a glance</h3>
                <dl className={styles.glanceGrid}>
                    {atAGlance.map(([label, value], index) => (
                        <motion.div
                            key={label}
                            className={styles.glanceItem}
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.6, ease: EASE, delay: (index % 4) * 0.06 }}
                        >
                            <dt>{label}</dt>
                            <dd>{value}</dd>
                        </motion.div>
                    ))}
                </dl>
            </div>

            <div className={styles.toggleRow}>
                <button
                    type="button"
                    className={styles.toggle}
                    aria-expanded={open}
                    aria-controls="fitment-details"
                    onClick={() => setOpen((value) => !value)}
                >
                    <span>{open ? "Hide full fitment guide" : "Read the full fitment guide"}</span>
                    <b aria-hidden="true" className={open ? styles.toggleIconOpen : undefined}>+</b>
                </button>
                <small>Factory specifications · DRAXLER recommendations · Engineering notes</small>
            </div>

            <AnimatePresence initial={false} onExitComplete={refreshScrollTriggers}>
                {open && (
                    <motion.div
                        id="fitment-details"
                        className={styles.details}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ height: { duration: 0.7, ease: EASE }, opacity: { duration: 0.45 } }}
                        onAnimationComplete={refreshScrollTriggers}
                    >
                        <div className={styles.detailsInner}>
                            <div className={styles.block}>
                                <div className={styles.blockCopy}>
                                    <span>A / Factory</span>
                                    <h3>Factory wheel &amp; tyre specifications</h3>
                                    <p>Mercedes-Benz fits square setups — the same wheel and tyre front and rear — across the current G-Class range. The offset varies with diameter, which is why a generic “G-Wagon offset” does not exist.</p>
                                </div>
                                <div className={styles.blockTables}>
                                    <h4>Mercedes-AMG G 63</h4>
                                    <SpecTable head={["Configuration", "Wheel (front & rear)", "Tyre", "Fitted to"]} rows={factoryG63} />
                                    <h4>G 350 d / G 400 d / G 500 / G 550</h4>
                                    <SpecTable head={["Configuration", "Wheel (front & rear)", "Tyre", "Fitted to"]} rows={factoryG500} />
                                </div>
                            </div>

                            <div className={styles.block}>
                                <div className={styles.blockCopy}>
                                    <span>B / Load</span>
                                    <h3>Recommended wheel load rating</h3>
                                    <p>We size every set with a 30% safety margin over the vehicle’s gross weight, split across four wheels.</p>
                                </div>
                                <div className={styles.formula}>
                                    <div><small>Gross vehicle weight</small><strong>3,200 kg</strong></div>
                                    <i>× 1.3 ÷ 4</i>
                                    <div><small>Minimum load per wheel</small><strong>≈ 1,040 kg</strong></div>
                                </div>
                            </div>

                            <div className={styles.block}>
                                <div className={styles.blockCopy}>
                                    <span>C / DRAXLER</span>
                                    <h3>DRAXLER custom fitment recommendation</h3>
                                    <p>Four proven directions for the G-Class. Change is measured against the factory 22×10J ET36 wheel: a positive outer value moves the lip towards the fender, a positive inner value moves the barrel towards the suspension.</p>
                                </div>
                                <div className={styles.blockTables}>
                                    <div className={styles.tableWrap}>
                                        <table className={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th scope="col">Direction</th>
                                                    <th scope="col">Wheel</th>
                                                    <th scope="col">Offset</th>
                                                    <th scope="col">Tyre</th>
                                                    <th scope="col">Outer lip</th>
                                                    <th scope="col">Inner lip</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recommendations.map((row) => (
                                                    <tr key={row.style}>
                                                        <th scope="row">{row.style}<small>{row.note}</small></th>
                                                        <td>{row.size}</td>
                                                        <td>{row.offset}</td>
                                                        <td>{row.tyre}</td>
                                                        <td>{row.outer}</td>
                                                        <td>{row.inner}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.block}>
                                <div className={styles.blockCopy}>
                                    <span>D / Engineering</span>
                                    <h3>What we check before machining</h3>
                                </div>
                                <ul className={styles.notes}>
                                    {notes.map((note, index) => (
                                        <li key={note.title}>
                                            <span>0{index + 1}</span>
                                            <strong>{note.title}</strong>
                                            <p>{note.text}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <p className={styles.notice}>
                                Fitment notice: figures are reference values compiled from Mercedes-Benz factory fitments and DRAXLER project data.
                                Suspension height, tyre brand and model year affect clearance. Measurements from your own vehicle are always more valuable —
                                every DRAXLER order includes a 3D fitment review before production.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
