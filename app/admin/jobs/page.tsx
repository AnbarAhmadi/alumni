import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import * as AdminController from "@/controllers/AdminController";
import AdminNotices from "@/components/AdminNotices";
import { formatDay } from "@/components/AnnouncementDetails";
import DeleteUserButton from "@/components/DeleteUserButton";
import EmptyState from "@/components/EmptyState";
import JobPostingForm from "@/components/JobPostingForm";
import { guardPage } from "@/lib/guard";
import { adminCreateJobAction, adminDeleteJobAction } from "./actions";

export const metadata: Metadata = {
  title: "Job postings | Admin | Homecoming",
};

// GET /admin/jobs (Week 10): every job posting with its owner, newest first, with Edit and
// Delete, and the form to create one for any user. Admin only (lib/access.ts).
export default async function AdminJobsPage({ searchParams }: PageProps<"/admin/jobs">) {
  await connection();
  await guardPage("page /admin/jobs", "/admin/jobs");
  const { done, blocked, item } = await searchParams;
  const [jobs, owners] = await Promise.all([AdminController.jobs(), AdminController.owners()]);
  const changed = jobs.find((j) => j.id === Number(item));

  const doneMessage =
    done === "created" && changed ? `Created “${changed.title}” for ${changed.owner.fullName}.`
    : done === "updated" && changed ? `Saved “${changed.title}”.`
    : done === "deleted" ? "The job posting was deleted, with its applications."
    : undefined;
  const blockedMessage = blocked === "missing" ? "That job posting doesn't exist any more." : undefined;

  return (
    <div className="stack">
      <section aria-labelledby="admin-jobs-title">
        <p className="page-back">
          <Link href="/admin" className="text-link">
            <span aria-hidden="true">← </span>Admin
          </Link>
        </p>
        <div className="page-header">
          <div>
            <h1 id="admin-jobs-title">Job postings</h1>
            <p className="meta">
              {jobs.length === 1 ? "1 job posting." : `${jobs.length} job postings.`} Deleting a posting also deletes its applications.
            </p>
          </div>
          <a href="#new-job" className="button primary">Create a job posting</a>
        </div>
        <AdminNotices done={doneMessage} blocked={blockedMessage} />
        {jobs.length === 0 ? (
          <EmptyState message="No postings yet. Post the first one." action={{ href: "#new-job", label: "Create a job posting" }} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Title</th>
                  <th scope="col">Company</th>
                  <th scope="col">City</th>
                  <th scope="col">Owner</th>
                  <th scope="col">Posted</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className={job.id === changed?.id ? "highlight" : undefined}>
                    <td className="table-name">{job.title}</td>
                    <td>{job.company}</td>
                    <td>{job.city ?? <span className="muted">—</span>}</td>
                    <td>
                      <Link href={`/users/${job.owner.id}`} className="text-link">{job.owner.fullName}</Link>
                    </td>
                    <td className="nowrap">
                      <time dateTime={job.createdAt}>{formatDay(job.createdAt)}</time>
                    </td>
                    <td className="actions">
                      <Link href={`/admin/jobs/${job.id}/edit`} className="button">
                        Edit<span className="visually-hidden"> {job.title}</span>
                      </Link>
                      <DeleteUserButton action={adminDeleteJobAction.bind(null, job.id)} name={`“${job.title}”`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section id="new-job" className="card" aria-labelledby="new-job-title">
        <h2 id="new-job-title" className="section-title">Create a job posting</h2>
        <JobPostingForm action={adminCreateJobAction} owners={owners} submitLabel="Create job posting" />
      </section>
    </div>
  );
}
