import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alumni Tracking System",
  description: "Istanbul University MIS alumni tracking platform",
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/#alumni", label: "Alumni Directory" },
  { href: "/#mentorship", label: "Mentorship" },
  { href: "/#events", label: "Events" },
  { href: "/#careers", label: "Careers" },
  { href: "/#contact", label: "Contact" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="inner">
            <Link href="/" className="logo">
              Alumni <span>Tracking</span> System
            </Link>
            <nav className="nav">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          © {new Date().getFullYear()} Management Information Systems, Istanbul University
        </footer>
      </body>
    </html>
  );
}
