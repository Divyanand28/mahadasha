import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "श्री गणेश विंशोत्तरी दशा गणक | Vimshottari Dasha Calculator",
  description:
    "Precision Vimshottari Mahadasha, Bhukt & Bhogya calculator with full calculation transparency.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="hi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Cormorant+Garamond:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;500;700&family=Noto+Serif+Devanagari:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="text-[#4a2c0c] antialiased">{children}</body>
    </html>
  );
}
