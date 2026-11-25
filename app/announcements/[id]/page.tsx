import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import * as AnnouncementController from "@/controllers/AnnouncementController";
import AnnouncementDetails from "@/components/AnnouncementDetails";
import DeleteAnnouncementButton from "@/components/DeleteAnnouncementButton";
import { can } from "@/lib/access";
import { guardPage, viewerOf } from "@/lib/guard";
import { deleteAnnouncementAction } from "../actions";

// The tab title: "<title> | Homecoming", or the 404 title if there is no such record.
export async function generateMetadata({ params }: PageProps<"/announcements/[id]">): Promise<Metadata> {
  const { ok, data } = await AnnouncementController.show((await params).id);
  return { title: ok && data ? `${data.title} | Homecoming` : "Page not found | Homecoming" };
}

// GET /announcements/[id]: one announcement (Read). Delete posts back to this page.
export default async function AnnouncementPage({ params, searchParams }: PageProps<"/announcements/[id]">) {
  await connection();
  const { id } = await params;
  const { updated } = await searchParams;
  // Access (lib/access.ts): public; Edit and Delete only for an admin.
  const viewer = viewerOf(await guardPage("page /announcements/[id]", `/announcements/${id}`));
  const { ok, data: announcement } = await AnnouncementController.show(id);
  if (!ok) notFound();

  return (
    <article className="reading" aria-labelledby="announcement-title">
      <p className="page-back">
        <Link href="/announcements" className="text-link">
          <span aria-hidden="true">← </span>All announcements
        </Link>
      </p>
      {updated && (
        <p className="notice" role="status">
          Changes saved.
        </p>
      )}
      <h1 id="announcement-title">{announcement.title}</h1>
      <AnnouncementDetails announcement={announcement} />
      {can("form updateAnnouncement", viewer) && (
        <div className="button-row">
          <Link href={`/announcements/${announcement.id}/edit`} className="button primary">Edit</Link>
          <DeleteAnnouncementButton
            action={deleteAnnouncementAction.bind(null, announcement.id)}
            title={announcement.title}
          />
        </div>
      )}
    </article>
  );
}
