import Link from "next/link";
import { logoutAction } from "@/app/login/actions";
import { can, type Role } from "@/lib/access";

// Only pages that exist. Planned parts are named in one "Coming soon" line on the homepage.
const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/users", label: "Users" },
  { href: "/announcements", label: "Announcements" },
];

type Props = {
  // The logged-in user (Week 10), or nothing when logged out. Passed by app/layout.tsx;
  // app/global-error.tsx passes nothing, so it always shows the logged-out links.
  user?: { id: number; fullName: string; role: Role } | null;
};

// The site header: the wordmark "Homecoming" (BRAND.md Mark), the navigation, and
// "Log in" and "Register", or the user's name and a "Log out" button (a POST form).
export default function SiteHeader({ user }: Props) {
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
          {/* Only for an admin (Week 10). Only looks: /admin checks the role itself. */}
          {user && can("page /admin", { id: user.id, role: user.role }) && <Link href="/admin">Admin</Link>}
          {user ? (
            <span className="site-nav-account">
              <Link href={`/users/${user.id}`} aria-label={`Your profile: ${user.fullName}`}>
                {user.fullName}
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="site-nav-button">Log out</button>
              </form>
            </span>
          ) : (
            <span className="site-nav-account">
              <Link href="/login">Log in</Link>
              <Link href="/register">Register</Link>
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
