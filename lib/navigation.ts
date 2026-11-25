// Navigation (Week 10): THE one menu list of the site header, following the "Navigation"
// table in ddd.md. Who sees an item comes from the access rules (lib/access.ts): an item
// is shown only if the viewer may open its page. Only looks; the guards are the real check.
//
// No server-only imports, so the header's client part can import it too.

import { can, type AccessKey, type Role, type Viewer } from "@/lib/access";

type NavItem = {
  label: string;
  href: string;
  page: AccessKey; // the page's access key in lib/access.ts
  // true: only for visitors who are logged out (Log in, Register).
  loggedOutOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", page: "page /" },
  { label: "About", href: "/about", page: "page /about" },
  { label: "Announcements", href: "/announcements", page: "page /announcements" },
  { label: "Users", href: "/users", page: "page /users" },
  { label: "Jobs", href: "/jobs", page: "page /jobs" },
  { label: "My profile", href: "/me", page: "page /me" },
  { label: "My applications", href: "/me/applications", page: "page /me/applications" },
  { label: "Admin", href: "/admin", page: "page /admin" },
  { label: "Log in", href: "/login", page: "page /login", loggedOutOnly: true },
  { label: "Register", href: "/register", page: "page /register", loggedOutOnly: true },
];

export type NavLink = { label: string; href: string };

// The menu items this viewer sees, in order.
export function navFor(viewer: Viewer): NavLink[] {
  return NAV_ITEMS.filter((item) => {
    if (item.loggedOutOnly) return viewer === null;
    return can(item.page, viewer);
  }).map((item) => ({ label: item.label, href: item.href }));
}

// The href of the current page's item: the longest href that matches the path, so
// /me/applications marks "My applications" and not also "My profile".
export function currentHref(pathname: string, links: NavLink[]): string | null {
  const matches = links
    .map((link) => link.href)
    .filter((href) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)));
  return matches.sort((a, b) => b.length - a.length)[0] ?? null;
}

// The small role label next to the user's name.
export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  ALUMNI: "Alumni",
  STUDENT: "Student",
};
