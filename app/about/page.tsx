import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | Homecoming",
};

// GET /about: what Homecoming is, what works today and who builds it.
export default function About() {
  return (
    <article className="reading prose" aria-labelledby="about-title">
      <h1 id="about-title">About Homecoming</h1>
      <p className="lead">
        Homecoming keeps the Management Information Systems Department at Istanbul University in touch with
        its graduates: where they are now, what they do, and how to reach them.
      </p>

      <h2>Why it exists</h2>
      <p>
        After graduation, students often drop out of sight. Their details sit in different places, and they
        go out of date. Homecoming puts them in one place, so the department can stay in touch and current
        students can find graduates to learn from.
      </p>

      <h2>What you can do today</h2>
      <ul>
        <li>
          <Link href="/users">Users</Link>: see everyone in the system, add a user or update a profile.
        </li>
        <li>
          <Link href="/announcements">Announcements</Link>: read and post news from the department.
        </li>
        <li>Job postings: each profile lists the jobs that person has shared.</li>
      </ul>

      <h2>What comes next</h2>
      <p>
        An alumni directory with search, profiles that graduates keep up to date themselves, mentorship,
        events, careers and contact.
      </p>

      <h2>Who builds it</h2>
      <p>
        Homecoming is a semester project for the Web Programming course. It builds on the analysis and design
        from the System Analysis and Design course, and it grows a little every week.
      </p>
    </article>
  );
}
