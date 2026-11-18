import Link from "next/link";

// Only pages that exist. Planned parts are named in one "Coming soon" line on the homepage.
const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/users", label: "Users" },
  { href: "/announcements", label: "Announcements" },
];

// The site header: the wordmark "Homecoming" (BRAND.md Mark) and the navigation.
// Used by app/layout.tsx and by app/global-error.tsx, so both look the same.
export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="column site-header-inner">
        <Link href="/" className="wordmark">Homecoming</Link>
        <nav className="site-nav" aria-label="Main">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
