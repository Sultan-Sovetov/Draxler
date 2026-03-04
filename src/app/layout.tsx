import type { Metadata } from "next";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import ThemeProvider from "@/components/ThemeProvider";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";

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
      <body className="bg-aero-dark text-aero-light antialiased">
        <ThemeProvider>
          <LenisProvider>{children}</LenisProvider>
          <WhatsAppFloatingButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
