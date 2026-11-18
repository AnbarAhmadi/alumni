import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import * as HomeController from "@/controllers/HomeController";
import { formatDay } from "@/components/AnnouncementDetails";
import CountUp from "@/components/CountUp";
import EmptyState from "@/components/EmptyState";

export const metadata: Metadata = {
  title: "Home | Homecoming",
};

// The first line of a message (the card cuts it with "…" if it is longer than one line).
function firstLine(text: string) {
  return text.split("\n").find((line) => line.trim() !== "")?.trim() ?? "";
}

// GET /: hero, real numbers from the database, the newest announcements and job postings.
// Read-only: the page never changes anything.
export default async function Home() {
  // The numbers and lists change at runtime, so render on every request.
  await connection();
  const { ok, data } = await HomeController.overview();

  return (
    <>
      <section className="hero full-bleed" aria-labelledby="home-title">
        <div className="column">
          <p className="eyebrow">Management Information Systems · Istanbul University</p>
          <h1 id="home-title">Where our graduates are now</h1>
          <p className="lead">Users, department news and job postings, in one place.</p>
          <div className="button-row">
            <Link href="/users" className="button paper">See all users</Link>
            <Link href="/announcements" className="button paper-outline">Read announcements</Link>
          </div>
        </div>
      </section>

      {ok && data ? (
        <>
          <section aria-label="In numbers">
            <dl className="stats">
              <div className="stat">
                <dt>Users</dt>
                <dd><CountUp value={data.counts.users} /></dd>
              </div>
              <div className="stat">
                <dt>Announcements</dt>
                <dd><CountUp value={data.counts.announcements} /></dd>
              </div>
              <div className="stat">
                <dt>Job postings</dt>
                <dd><CountUp value={data.counts.jobPostings} /></dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="latest-announcements-title">
            <div className="page-header">
              <h2 id="latest-announcements-title" className="section-title">Latest announcements</h2>
              <Link href="/announcements" className="text-link">
                All announcements<span aria-hidden="true"> →</span>
              </Link>
            </div>
            {data.latestAnnouncements.length === 0 ? (
              <EmptyState
                message="No announcements yet. Post the first one."
                action={{ href: "/announcements#new-announcement", label: "Post an announcement" }}
              />
            ) : (
              <ul className="grid">
                {data.latestAnnouncements.map((announcement) => (
                  <li key={announcement.id}>
                    <article className="card">
                      <p className="badge">
                        <time dateTime={announcement.createdAt}>{formatDay(announcement.createdAt)}</time>
                      </p>
                      <h3 className="card-title">
                        <Link href={`/announcements/${announcement.id}`}>{announcement.title}</Link>
                      </h3>
                      <p className="card-text first-line">{firstLine(announcement.content)}</p>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="latest-jobs-title">
            <div className="page-header">
              <h2 id="latest-jobs-title" className="section-title">Latest job postings</h2>
            </div>
            {data.latestJobPostings.length === 0 ? (
              <EmptyState message="No postings yet." />
            ) : (
              <ul className="grid">
                {data.latestJobPostings.map((job) => (
                  <li key={job.id}>
                    <article className="card">
                      <h3 className="card-title">{job.title}</h3>
                      <p className="card-text">{job.city ? `${job.company} · ${job.city}` : job.company}</p>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : (
        <p className="notice" role="status">We can&apos;t show the latest numbers right now. Please try again later.</p>
      )}

      <p className="coming-soon">
        <span className="badge">Coming soon</span>
        Alumni directory, profiles, mentorship, events, careers and contact.
      </p>
    </>
  );
}
