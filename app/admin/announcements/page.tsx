import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import * as AdminController from "@/controllers/AdminController";
import AdminNotices from "@/components/AdminNotices";
import AnnouncementForm from "@/components/AnnouncementForm";
import { formatDay } from "@/components/AnnouncementDetails";
import DeleteAnnouncementButton from "@/components/DeleteAnnouncementButton";
import EmptyState from "@/components/EmptyState";
import { guardPage } from "@/lib/guard";
import { adminCreateAnnouncementAction, adminDeleteAnnouncementAction } from "./actions";

export const metadata: Metadata = {
  title: "Announcements | Admin | Homecoming",
};

// GET /admin/announcements (Week 10): every announcement, newest first, with Edit and
// Delete, and the form to post a new one. Admin only (lib/access.ts).
export default async function AdminAnnouncementsPage({ searchParams }: PageProps<"/admin/announcements">) {
  await connection();
  await guardPage("page /admin/announcements", "/admin/announcements");
  const { done, blocked, item } = await searchParams;
  const announcements = await AdminController.announcements();
  const created = announcements.find((a) => a.id === Number(item));

  const doneMessage =
    done === "created" && created ? `Posted “${created.title}”.` : done === "deleted" ? "The announcement was deleted." : undefined;
  const blockedMessage = blocked === "missing" ? "That announcement doesn't exist any more." : undefined;

  return (
    <div className="stack">
      <section aria-labelledby="admin-announcements-title">
        <p className="page-back">
          <Link href="/admin" className="text-link">
            <span aria-hidden="true">← </span>Admin
          </Link>
        </p>
        <div className="page-header">
          <div>
            <h1 id="admin-announcements-title">Announcements</h1>
            <p className="meta">
              {announcements.length === 1 ? "1 announcement." : `${announcements.length} announcements.`}
            </p>
          </div>
          <a href="#new-announcement" className="button primary">Post an announcement</a>
        </div>
        <AdminNotices done={doneMessage} blocked={blockedMessage} />
        {announcements.length === 0 ? (
          <EmptyState
            message="No announcements yet. Post the first one."
            action={{ href: "#new-announcement", label: "Post an announcement" }}
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Title</th>
                  <th scope="col">Message</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((a) => (
                  <tr key={a.id} className={a.id === created?.id ? "highlight" : undefined}>
                    <td className="nowrap">
                      <time dateTime={a.createdAt}>{formatDay(a.createdAt)}</time>
                    </td>
                    <td>
                      <Link href={`/announcements/${a.id}`} className="table-name">{a.title}</Link>
                    </td>
                    <td className="muted table-preview">{a.content}</td>
                    <td className="actions">
                      <Link href={`/announcements/${a.id}/edit`} className="button">
                        Edit<span className="visually-hidden"> {a.title}</span>
                      </Link>
                      <DeleteAnnouncementButton action={adminDeleteAnnouncementAction.bind(null, a.id)} title={a.title} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section id="new-announcement" className="card" aria-labelledby="new-announcement-title">
        <h2 id="new-announcement-title" className="section-title">Post an announcement</h2>
        <AnnouncementForm action={adminCreateAnnouncementAction} submitLabel="Post announcement" />
      </section>
    </div>
  );
}
