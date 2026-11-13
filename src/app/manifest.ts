import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "DRAXLER — Bespoke Forged Wheels",
        short_name: "DRAXLER",
        description: "Bespoke forged wheels engineered around your vehicle.",
        start_url: "/",
        display: "standalone",
        background_color: "#0b0b0b",
        theme_color: "#0b0b0b",
        icons: [
            { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
            { src: "/apple-icon", sizes: "180x180", type: "image/png" },
        ],
    };
}
