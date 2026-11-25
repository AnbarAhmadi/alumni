import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import * as AuthController from "@/controllers/AuthController";
import { redactSecrets } from "@/lib/redact";
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

// The logged-in user for the header (Week 10). If the database can't be reached, the
// header shows the logged-out links instead of failing every page.
async function headerUser() {
  try {
    const user = await AuthController.currentUser();
    return user && { id: user.id, fullName: user.fullName, role: user.role };
  } catch (err) {
    console.error(`could not read the session: ${redactSecrets(err instanceof Error ? err.message : String(err))}`);
    return null;
  }
}

// The one layout of the website (DESIGN.md rule 1): header with the wordmark and
// the navigation, one centred content column, footer. Pages fill the column; a
// section with the class "full-bleed" may span the full width (the homepage hero).
// Reading the session cookie makes every page render per request.
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await headerUser();
  return (
    <html lang="en" className={`${sourceSerif.variable} ${inter.variable}`}>
      <body>
        <a href="#content" className="skip-link">Skip to content</a>
        <SiteHeader user={user} />
        <main id="content" className="page">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
