import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import ThemeProvider from "@/components/ThemeProvider";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "DRAXLER — Engineered Excellence | Premium Performance Wheels",
  description:
    "DRAXLER crafts premium forged wheels for high-performance supercars. Experience engineering excellence through precision forging and meticulous craftsmanship.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`bg-aero-dark text-aero-light antialiased ${inter.variable}`}>
        <ThemeProvider>
          <LenisProvider>{children}</LenisProvider>
          <WhatsAppFloatingButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
