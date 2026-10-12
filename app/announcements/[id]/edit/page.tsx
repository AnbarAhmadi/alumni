import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import * as AnnouncementController from "@/controllers/AnnouncementController";
import AnnouncementForm from "@/components/AnnouncementForm";
import AnnouncementNav from "@/components/AnnouncementNav";
import { updateAnnouncementAction } from "../../actions";

export const metadata: Metadata = {
  title: "Edit announcement | Alumni Tracking System",
};

// GET /announcements/[id]/edit: the edit form (Update). It posts back to this page.
export default async function EditAnnouncementPage({ params }: PageProps<"/announcements/[id]/edit">) {
  await connection();
  const { id } = await params;
  const { ok, data: announcement } = AnnouncementController.show(id);
  if (!ok) notFound();

  return (
    <main className="container stack">
      <AnnouncementNav announcementId={announcement.id} />

      <section className="panel">
        <h2 className="section-title">Edit &ldquo;{announcement.title}&rdquo;</h2>
        <p className="muted">Only the fields you change are updated; empty fields keep their current value.</p>
        <AnnouncementForm
          action={updateAnnouncementAction.bind(null, announcement.id)}
          announcement={announcement}
          submitLabel="Save changes"
        />
      </section>
    </main>
  );
}
