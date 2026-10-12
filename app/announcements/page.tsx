import type { Metadata } from "next";
import { connection } from "next/server";
import * as AnnouncementController from "@/controllers/AnnouncementController";
import AnnouncementTable from "@/components/AnnouncementTable";
import AnnouncementForm from "@/components/AnnouncementForm";
import { createAnnouncementAction, deleteAnnouncementAction } from "./actions";

export const metadata: Metadata = {
  title: "Announcements | Alumni Tracking System",
};

// GET /announcements: list (Read). The form below posts back to /announcements (Create).
export default async function AnnouncementsPage({ searchParams }: PageProps<"/announcements">) {
  // Announcements live in memory and change at runtime, so render on every request.
  await connection();
  const { data: announcements } = AnnouncementController.index();
  const { created } = await searchParams;

  return (
    <main className="container stack">
      <section>
        <div className="page-header">
          <h2 className="section-title">Announcements ({announcements.length})</h2>
          <a href="#new-announcement" className="button primary">+ New announcement</a>
        </div>
        <AnnouncementTable
          announcements={announcements}
          highlightId={Number(created)}
          deleteAction={deleteAnnouncementAction}
        />
      </section>

      <section id="new-announcement" className="panel">
        <h2 className="section-title">Add an announcement</h2>
        <AnnouncementForm action={createAnnouncementAction} submitLabel="Create announcement" />
      </section>
    </main>
  );
}
