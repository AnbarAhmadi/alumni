import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import * as AnnouncementController from "@/controllers/AnnouncementController";
import AnnouncementForm from "@/components/AnnouncementForm";
import { updateAnnouncementAction } from "../../actions";

// The tab title: "Edit announcement | Homecoming", or the 404 title if there is no such record.
export async function generateMetadata({ params }: PageProps<"/announcements/[id]/edit">): Promise<Metadata> {
  const { ok, data } = await AnnouncementController.show((await params).id);
  return { title: ok && data ? "Edit announcement | Homecoming" : "Page not found | Homecoming" };
}

// GET /announcements/[id]/edit: the edit form (Update). It posts back to this page.
export default async function EditAnnouncementPage({ params }: PageProps<"/announcements/[id]/edit">) {
  await connection();
  const { id } = await params;
  const { ok, data: announcement } = await AnnouncementController.show(id);
  if (!ok) notFound();

  return (
    <section className="reading" aria-labelledby="edit-announcement-title">
      <p className="page-back">
        <Link href={`/announcements/${announcement.id}`} className="text-link">
          <span aria-hidden="true">← </span>Back to the announcement
        </Link>
      </p>
      <h1 id="edit-announcement-title">Edit announcement</h1>
      <p className="meta">Only the fields you change are updated; empty fields keep their current value.</p>
      <AnnouncementForm
        action={updateAnnouncementAction.bind(null, announcement.id)}
        announcement={announcement}
        submitLabel="Save changes"
      />
    </section>
  );
}
