import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import ThemeProvider from "@/components/ThemeProvider";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import JsonLd from "@/components/JsonLd";
import { SITE_NAME, SITE_URL, organizationLd, websiteLd } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const DEFAULT_TITLE = "DRAXLER — Bespoke Forged Wheels | Custom Monoblock & Multi-Piece";
const DEFAULT_DESCRIPTION =
    "DRAXLER engineers bespoke forged wheels for supercars, luxury SUVs and off-road builds. Any size 15–30\", any finish, 3D fitment preview and worldwide delivery.";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
    description: DEFAULT_DESCRIPTION,
    applicationName: SITE_NAME,
    keywords: [
        "forged wheels",
        "custom forged wheels",
        "bespoke wheels",
        "monoblock wheels",
        "multi-piece wheels",
        "beadlock wheels",
        "G-Wagon wheels",
        "кованые диски",
        "кованые диски на заказ",
        "DRAXLER",
    ],
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "automotive",
    formatDetection: { telephone: false, email: false, address: false },
    openGraph: {
        type: "website",
        siteName: SITE_NAME,
        locale: "en_US",
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        url: "/",
    },
    twitter: {
        card: "summary_large_image",
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
};

export const viewport: Viewport = {
    themeColor: "#0b0b0b",
    colorScheme: "dark light",
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" data-theme="dark">
            <body className={`bg-aero-dark text-aero-light antialiased ${inter.variable}`}>
                <JsonLd data={[organizationLd, websiteLd]} />
                <ThemeProvider>
                    <LenisProvider>{children}</LenisProvider>
                    <WhatsAppFloatingButton />
                </ThemeProvider>
            </body>
        </html>
    );
}
