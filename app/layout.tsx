import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

// The two brand fonts (BRAND.md), self-hosted by next/font. Each one sets a CSS
// variable on <html>; globals.css uses them in --font-heading and --font-body.
// latin-ext is needed for Turkish letters such as ş, ğ and ı.
const sourceSerif = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  variable: "--font-source-serif-4",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Homecoming",
  description: "Where our graduates are now. The alumni platform of the Management Information Systems Department, Istanbul University.",
};

// The one layout of the website (DESIGN.md rule 1): header with the wordmark and
// the navigation, one centred content column, footer. Pages fill the column; a
// section with the class "full-bleed" may span the full width (the homepage hero).
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${inter.variable}`}>
      <body>
        <a href="#content" className="skip-link">Skip to content</a>
        <SiteHeader />
        <main id="content" className="page">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
