import type { Metadata } from "next";
import HomePage from "@/components/HomePage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
    title: "DRAXLER — Bespoke Forged Wheels | Custom Monoblock & Multi-Piece",
    absoluteTitle: true,
    description:
        "DRAXLER engineers bespoke forged wheels for supercars, luxury SUVs and off-road builds. Any size 15–30\", any finish, 3D configurator and worldwide delivery.",
    path: "/",
});

export default function Page() {
    return <HomePage />;
}
