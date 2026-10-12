import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import * as AnnouncementController from "@/controllers/AnnouncementController";
import AnnouncementDetails from "@/components/AnnouncementDetails";
import AnnouncementNav from "@/components/AnnouncementNav";
import DeleteAnnouncementButton from "@/components/DeleteAnnouncementButton";
import { deleteAnnouncementAction } from "../actions";

export const metadata: Metadata = {
  title: "Announcement | Alumni Tracking System",
};

// GET /announcements/[id]: one announcement (Read). Delete posts back to this page.
export default async function AnnouncementPage({ params, searchParams }: PageProps<"/announcements/[id]">) {
  await connection();
  const { id } = await params;
  const { updated } = await searchParams;
  const { ok, data: announcement } = AnnouncementController.show(id);
  if (!ok) notFound();

  return (
    <main className="container stack">
      <AnnouncementNav announcementId={announcement.id} />

      <section className="panel">
        {updated && (
          <p className="notice" role="status">
            Changes saved.
          </p>
        )}
        <h2 className="section-title">{announcement.title}</h2>
        <AnnouncementDetails announcement={announcement} />
        <div className="button-row">
          <Link href={`/announcements/${announcement.id}/edit`} className="button primary">Edit</Link>
          <DeleteAnnouncementButton
            action={deleteAnnouncementAction.bind(null, announcement.id)}
            title={announcement.title}
          />
        </div>
      </section>
    </main>
  );
}
