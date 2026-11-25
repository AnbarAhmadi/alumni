"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { currentHref, type NavLink } from "@/lib/navigation";

// The header's menu links (Week 10). Only shows the list it is given (from navFor in
// lib/navigation.ts) and marks the current page's link with aria-current="page".
export default function NavLinks({ links }: { links: NavLink[] }) {
  const current = currentHref(usePathname(), links);
  return links.map((link) => (
    <Link key={link.label} href={link.href} aria-current={link.href === current ? "page" : undefined}>
      {link.label}
    </Link>
  ));
}
