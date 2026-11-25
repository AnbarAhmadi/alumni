import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import * as MeController from "@/controllers/MeController";
import AdminNotices from "@/components/AdminNotices";
import { formatDay } from "@/components/AnnouncementDetails";
import DeleteUserButton from "@/components/DeleteUserButton";
import EmptyState from "@/components/EmptyState";
import { guardPage } from "@/lib/guard";
import { withdrawApplicationAction } from "../actions";

export const metadata: Metadata = {
  title: "My applications | Homecoming",
};

const STATUS_LABELS: Record<string, string> = { applied: "Applied", reviewed: "Reviewed", hired: "Hired", rejected: "Rejected" };

// GET /me/applications (Week 10): the logged-in user's own applications, newest first, with
// Withdraw. Logged in; always the SESSION user (no id in the URL).
export default async function MyApplicationsPage({ searchParams }: PageProps<"/me/applications">) {
  await connection();
  const viewer = (await guardPage("page /me/applications", "/me/applications"))!;
  const { done, blocked } = await searchParams;
  const applications = await MeController.applications(viewer.id);

  return (
    <div className="stack">
      <section aria-labelledby="my-applications-title">
        <p className="page-back">
          <Link href="/me" className="text-link">
            <span aria-hidden="true">← </span>My profile
          </Link>
        </p>
        <h1 id="my-applications-title">My applications</h1>
        <p className="meta">
          {applications.length === 1 ? "1 application." : `${applications.length} applications.`}
        </p>
        <AdminNotices
          done={done === "withdrawn" ? "Your application was withdrawn." : undefined}
          blocked={blocked === "missing" ? "That application isn't yours or doesn't exist any more. Nothing was changed." : undefined}
        />
        {applications.length === 0 ? (
          <EmptyState message="No applications yet." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Job posting</th>
                  <th scope="col">Company</th>
                  <th scope="col">Status</th>
                  <th scope="col">Applied on</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td>{application.jobPosting.title}</td>
                    <td>{application.jobPosting.company}</td>
                    <td><span className="badge">{STATUS_LABELS[application.status] ?? application.status}</span></td>
                    <td className="nowrap">
                      <time dateTime={application.createdAt}>{formatDay(application.createdAt)}</time>
                    </td>
                    <td className="actions">
                      <DeleteUserButton
                        action={withdrawApplicationAction.bind(null, application.id)}
                        name={`your application to “${application.jobPosting.title}”`}
                        label="Withdraw"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
