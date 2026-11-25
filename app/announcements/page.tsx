import type { Metadata } from "next";
import { connection } from "next/server";
import * as AnnouncementController from "@/controllers/AnnouncementController";
import AnnouncementList from "@/components/AnnouncementList";
import AnnouncementForm from "@/components/AnnouncementForm";
import { can } from "@/lib/access";
import { guardPage, viewerOf } from "@/lib/guard";
import { createAnnouncementAction, deleteAnnouncementAction } from "./actions";

export const metadata: Metadata = {
  title: "Announcements | Homecoming",
};

// GET /announcements: the list, newest first (Read). The form below posts back to /announcements (Create).
export default async function AnnouncementsPage({ searchParams }: PageProps<"/announcements">) {
  // Announcements change at runtime, so render on every request.
  await connection();
  // Access (lib/access.ts): public; posting, editing and deleting only for an admin.
  const viewer = viewerOf(await guardPage("page /announcements", "/announcements"));
  const canPost = can("form createAnnouncement", viewer);
  const { data: announcements } = await AnnouncementController.index();
  const { created } = await searchParams;

  return (
    <div className="stack reading">
      <section aria-labelledby="announcements-title">
        <div className="page-header">
          <div>
            <h1 id="announcements-title">Announcements</h1>
            <p className="meta">
              {announcements.length === 1 ? "1 announcement." : `${announcements.length} announcements.`}
            </p>
          </div>
          {canPost && <a href="#new-announcement" className="button primary">Post an announcement</a>}
        </div>
        <AnnouncementList
          announcements={announcements}
          highlightId={Number(created)}
          deleteAction={deleteAnnouncementAction}
          viewer={viewer}
        />
      </section>

      {canPost && (
        <section id="new-announcement" className="card" aria-labelledby="new-announcement-title">
          <h2 id="new-announcement-title" className="section-title">Post an announcement</h2>
          <AnnouncementForm action={createAnnouncementAction} submitLabel="Post announcement" />
        </section>
      )}
    </div>
  );
}
