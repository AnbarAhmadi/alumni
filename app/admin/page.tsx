import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import * as AdminController from "@/controllers/AdminController";
import { guardPage } from "@/lib/guard";

export const metadata: Metadata = {
  title: "Admin | Homecoming",
};

// The sections of the admin panel (Week 10, parts 1 and 2).
const SECTIONS = [
  { href: "/admin/users", title: "Users", text: "Change roles, edit and delete users." },
  { href: "/admin/announcements", title: "Announcements", text: "Post, edit and delete announcements." },
  { href: "/admin/jobs", title: "Job postings", text: "Create postings for any user, edit and delete them." },
  { href: "/admin/applications", title: "Applications", text: "Review, hire or reject applicants, and delete applications." },
];

// GET /admin (Week 10): the admin dashboard. Admin only (lib/access.ts).
export default async function AdminPage() {
  await connection();
  await guardPage("page /admin", "/admin");
  const counts = await AdminController.dashboard();

  return (
    <div className="stack">
      <section aria-labelledby="admin-title">
        <h1 id="admin-title">Admin</h1>
        <p className="meta">Where things stand, and where to change them.</p>
      </section>

      <section aria-labelledby="admin-roles-title">
        <h2 id="admin-roles-title" className="section-title">
          {counts.users === 1 ? "1 user" : `${counts.users} users`}, by role
        </h2>
        <dl className="stats">
          <div className="stat">
            <dt>Admins</dt>
            <dd>{counts.roles.ADMIN}</dd>
          </div>
          <div className="stat">
            <dt>Alumni</dt>
            <dd>{counts.roles.ALUMNI}</dd>
          </div>
          <div className="stat">
            <dt>Students</dt>
            <dd>{counts.roles.STUDENT}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="admin-content-title">
        <h2 id="admin-content-title" className="section-title">Content</h2>
        <dl className="stats">
          <div className="stat">
            <dt>Announcements</dt>
            <dd>{counts.announcements}</dd>
          </div>
          <div className="stat">
            <dt>Job postings</dt>
            <dd>{counts.jobPostings}</dd>
          </div>
          <div className="stat">
            <dt>Applications</dt>
            <dd>{counts.applications}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="admin-sections-title">
        <h2 id="admin-sections-title" className="section-title">Sections</h2>
        <ul className="grid">
          {SECTIONS.map((section) => (
            <li key={section.href}>
              <article className="card">
                <h3 className="card-title">
                  <Link href={section.href}>{section.title}</Link>
                </h3>
                <p className="card-text">{section.text}</p>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
