import Image from "next/image";
import Link from "next/link";

/**
 * Phone replacement for the WebGL configurator: same typography and palette,
 * zero 3D cost. Keeps the `#configurator` anchor working for the nav.
 */
export default function MobileConfiguratorTeaser({
    tone = "dark",
    image = "/projects/g-wagon-graphite.jpg",
    title = "Build it in 3D",
    withId = true,
}: {
    tone?: "dark" | "light";
    image?: string;
    title?: string;
    withId?: boolean;
}) {
    return (
        <section id={withId ? "configurator" : undefined} className={`m-config m-config--${tone}`} aria-labelledby="m-config-title">
            <span className="m-config-label">Interactive experience</span>
            <div className="m-config-media">
                <Image src={image} alt="Mercedes-AMG G 63 on DRAXLER forged wheels" fill sizes="100vw" />
                <span className="m-config-badge">3D · Desktop</span>
            </div>
            <h2 id="m-config-title" className="m-config-title">{title}</h2>
            <p className="m-config-copy">
                The full 3D configurator is built for larger screens. Open it on a computer — or send us your car and we will render your wheels on it.
            </p>
            <div className="m-config-actions">
                <Link href="/catalog" className="m-config-link">Browse wheels <b aria-hidden="true">↗</b></Link>
                <a href="https://wa.me/77027543948?text=Hi%20DRAXLER%2C%20I%27d%20like%20a%203D%20render%20of%20wheels%20on%20my%20car" target="_blank" rel="noopener noreferrer" className="m-config-link m-config-link--muted">
                    Request a 3D render
                </a>
            </div>
        </section>
    );
}
