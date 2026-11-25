import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import * as JobsController from "@/controllers/JobsController";
import AdminNotices from "@/components/AdminNotices";
import EmptyState from "@/components/EmptyState";
import { guardPage } from "@/lib/guard";
import { applyToJobAction } from "./actions";

export const metadata: Metadata = {
  title: "Jobs | Homecoming",
};

// GET /jobs (Week 10): every job posting, newest first (title, company, city, who posted it),
// with Apply, or "Applied" if this user already applied. Logged in; applying is always as
// the session user.
export default async function JobsPage({ searchParams }: PageProps<"/jobs">) {
  await connection();
  const user = (await guardPage("page /jobs", "/jobs"))!;
  const { done, blocked, item } = await searchParams;
  const jobs = await JobsController.list(user.id);
  const named = jobs.find((job) => job.id === Number(item));

  const doneMessage = done === "applied" && named ? `You applied to “${named.title}”. It is on My applications.` : undefined;
  const blockedMessage =
    blocked === "already" ? `You have already applied to ${named ? `“${named.title}”` : "this posting"}. Nothing was changed.`
    : blocked === "missing" ? "That posting doesn't exist any more."
    : undefined;

  return (
    <div className="stack">
      <section aria-labelledby="jobs-title">
        <h1 id="jobs-title">Jobs</h1>
        <p className="meta">
          {jobs.length === 1 ? "1 posting" : `${jobs.length} postings`} from our graduates, newest first.{" "}
          <Link href="/me/applications" className="text-link">My applications</Link>
        </p>
        <AdminNotices done={doneMessage} blocked={blockedMessage} />
        {jobs.length === 0 ? (
          <EmptyState message="No postings yet." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Title</th>
                  <th scope="col">Company</th>
                  <th scope="col">City</th>
                  <th scope="col">Posted by</th>
                  <th scope="col"><span className="visually-hidden">Apply</span></th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className={job.id === named?.id && done ? "highlight" : undefined}>
                    <td>{job.title}</td>
                    <td>{job.company}</td>
                    <td>{job.city ?? "—"}</td>
                    <td>
                      <Link href={`/users/${job.owner.id}`} className="table-name">{job.owner.fullName}</Link>
                    </td>
                    <td className="actions">
                      {job.applied ? (
                        <button type="button" className="button" disabled>Applied</button>
                      ) : (
                        <form action={applyToJobAction.bind(null, job.id)}>
                          <button type="submit" className="button primary">
                            Apply<span className="visually-hidden"> to {job.title} at {job.company}</span>
                          </button>
                        </form>
                      )}
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
