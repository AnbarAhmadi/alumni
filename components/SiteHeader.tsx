import Link from "next/link";
import { logoutAction } from "@/app/login/actions";
import type { Role } from "@/lib/access";
import { navFor, ROLE_LABELS } from "@/lib/navigation";
import NavLinks from "@/components/NavLinks";

type Props = {
  // The logged-in user (Week 10), or nothing when logged out. Passed by app/layout.tsx;
  // app/global-error.tsx passes nothing, so it always shows the logged-out links.
  user?: { id: number; fullName: string; role: Role } | null;
};

// The site header: the wordmark "Homecoming" (BRAND.md Mark), the menu for this user
// (lib/navigation.ts, from the access rules; only looks, the guards are the real check),
// and when logged in the user's name, a role label and a "Log out" button (a POST form).
export default function SiteHeader({ user }: Props) {
  const viewer = user ? { id: user.id, role: user.role } : null;
  return (
    <header className="site-header">
      <div className="column site-header-inner">
        <Link href="/" className="wordmark">Homecoming</Link>
        <nav className="site-nav" aria-label="Main">
          <NavLinks links={navFor(viewer)} />
          {user && (
            <span className="site-nav-account">
              <span className="site-nav-user">
                {user.fullName} <span className="badge">{ROLE_LABELS[user.role]}</span>
              </span>
              <form action={logoutAction}>
                <button type="submit" className="site-nav-button">Log out</button>
              </form>
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
