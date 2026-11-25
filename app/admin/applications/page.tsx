import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import * as AdminController from "@/controllers/AdminController";
import AdminNotices from "@/components/AdminNotices";
import { formatDay } from "@/components/AnnouncementDetails";
import DeleteUserButton from "@/components/DeleteUserButton";
import EmptyState from "@/components/EmptyState";
import { guardPage } from "@/lib/guard";
import { adminChangeApplicationStatusAction, adminDeleteApplicationAction } from "./actions";

export const metadata: Metadata = {
  title: "Applications | Admin | Homecoming",
};

// The four statuses of ddd.md, with the words the page shows.
const STATUS_OPTIONS = [
  { value: "applied", label: "Applied" },
  { value: "reviewed", label: "Reviewed" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
];
const statusLabel = (value: string) => STATUS_OPTIONS.find((s) => s.value === value)?.label.toLowerCase() ?? value;

// GET /admin/applications (Week 10): every application, newest first: the applicant, the
// posting, the date and the status (a dropdown with Save), and Delete. Admin only.
export default async function AdminApplicationsPage({ searchParams }: PageProps<"/admin/applications">) {
  await connection();
  await guardPage("page /admin/applications", "/admin/applications");
  const { done, blocked, item } = await searchParams;
  const applications = await AdminController.applications();
  const changed = applications.find((a) => a.id === Number(item));

  const doneMessage =
    done === "status" && changed
      ? `${changed.user.fullName}'s application to “${changed.jobPosting.title}” is now ${statusLabel(changed.status)}.`
      : done === "deleted" ? "The application was deleted." : undefined;
  const blockedMessage =
    blocked === "status" ? "Choose one of: Applied, Reviewed, Hired or Rejected. Nothing was changed."
    : blocked === "missing" ? "That application doesn't exist any more."
    : undefined;

  return (
    <div className="stack">
      <section aria-labelledby="admin-applications-title">
        <p className="page-back">
          <Link href="/admin" className="text-link">
            <span aria-hidden="true">← </span>Admin
          </Link>
        </p>
        <div className="page-header">
          <div>
            <h1 id="admin-applications-title">Applications</h1>
            <p className="meta">
              {applications.length === 1 ? "1 application." : `${applications.length} applications.`} New
              applications are always Applied; only an admin or the posting&apos;s owner changes the status.
            </p>
          </div>
        </div>
        <AdminNotices done={doneMessage} blocked={blockedMessage} />
        {applications.length === 0 ? (
          <EmptyState message="No applications yet." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Applicant</th>
                  <th scope="col">Job posting</th>
                  <th scope="col">Applied on</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => {
                  const selectId = `status-${application.id}`;
                  const name = `${application.user.fullName}'s application to “${application.jobPosting.title}”`;
                  return (
                    <tr key={application.id} className={application.id === changed?.id ? "highlight" : undefined}>
                      <td>
                        <Link href={`/users/${application.user.id}`} className="table-name">{application.user.fullName}</Link>
                      </td>
                      <td>
                        {application.jobPosting.title}
                        <span className="muted"> · {application.jobPosting.company}</span>
                      </td>
                      <td className="nowrap">
                        <time dateTime={application.createdAt}>{formatDay(application.createdAt)}</time>
                      </td>
                      <td>
                        <form action={adminChangeApplicationStatusAction.bind(null, application.id)} className="inline-form">
                          <label htmlFor={selectId} className="visually-hidden">Status of {name}</label>
                          <select id={selectId} name="status" defaultValue={application.status} className="select">
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                          <button type="submit" className="button">
                            Save<span className="visually-hidden"> the status of {name}</span>
                          </button>
                        </form>
                      </td>
                      <td className="actions">
                        <DeleteUserButton action={adminDeleteApplicationAction.bind(null, application.id)} name={name} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
