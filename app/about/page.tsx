import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Alumni Tracking System",
};

export default function About() {
  return (
    <main className="container">
      <article className="prose">
        <h1>About the Alumni System</h1>
        <p>
          Universities often lose contact with their students after
          graduation. The Alumni Tracking System gives the Management
          Information Systems Department at Istanbul University one secure,
          central place to stay connected with its graduates.
        </p>

        <h2>What it does</h2>
        <ul>
          <li>Replaces scattered, department-by-department records with one database.</li>
          <li>Keeps alumni information current through profiles that graduates update themselves.</li>
          <li>Helps current students and graduates connect for mentorship and networking.</li>
        </ul>

        <h2>The project</h2>
        <p>
          This platform is being built as a semester-long project for the Web
          Programming course, based on an earlier System Analysis and Design
          assignment. Features will be added step by step as the course
          progresses.
        </p>
      </article>
    </main>
  );
}
