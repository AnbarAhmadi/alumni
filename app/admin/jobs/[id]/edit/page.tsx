import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import * as AdminController from "@/controllers/AdminController";
import JobPostingForm from "@/components/JobPostingForm";
import { guardPage } from "@/lib/guard";
import { adminUpdateJobAction } from "../../actions";

export const metadata: Metadata = {
  title: "Edit job posting | Admin | Homecoming",
};

// GET /admin/jobs/[id]/edit (Week 10): the edit form of one posting, owner included.
// Admin only (lib/access.ts); checked before the lookup.
export default async function EditJobPage({ params }: PageProps<"/admin/jobs/[id]/edit">) {
  await connection();
  const { id } = await params;
  await guardPage("page /admin/jobs/[id]/edit", `/admin/jobs/${id}/edit`);
  const [posting, owners] = await Promise.all([AdminController.job(id), AdminController.owners()]);
  if (!posting) notFound();

  return (
    <section className="reading" aria-labelledby="edit-job-title">
      <p className="page-back">
        <Link href="/admin/jobs" className="text-link">
          <span aria-hidden="true">← </span>All job postings
        </Link>
      </p>
      <h1 id="edit-job-title">Edit job posting</h1>
      <p className="meta">Only the fields you change are updated; empty fields keep their current value.</p>
      <JobPostingForm
        action={adminUpdateJobAction.bind(null, posting.id)}
        owners={owners}
        posting={posting}
        submitLabel="Save changes"
      />
    </section>
  );
}
