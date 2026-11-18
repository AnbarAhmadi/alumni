"use client"; // Error boundaries must be Client Components

import { Inter, Source_Serif_4 } from "next/font/google";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StatusPage from "@/components/StatusPage";
import "./globals.css";

// Only used when the root layout itself fails (app/error.tsx can't catch that).
// It replaces the whole document, so it brings its own <html>, <body>, styles and
// fonts, and the same header and footer as app/layout.tsx. Like app/error.tsx, it
// never shows the error message, digest or stack trace.
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

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${inter.variable}`}>
      <body>
        <title>Something went wrong | Homecoming</title>
        <SiteHeader />
        <main id="content" className="page">
          <StatusPage code="500" line="Something went wrong on our side.">
            <button type="button" className="button primary" onClick={() => retry()}>
              Try again
            </button>
            <Link href="/" className="button">Back to the home page</Link>
          </StatusPage>
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
