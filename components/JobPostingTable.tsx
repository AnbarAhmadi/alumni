import type { JobPosting } from "@/models/JobPosting";
import EmptyState from "./EmptyState";

// A user's job postings as a table (title, company, city; DESIGN.md ref-2),
// or the empty state (ref-3) if there are none.
export default function JobPostingTable({ jobs }: { jobs: JobPosting[] }) {
  if (jobs.length === 0) {
    return <EmptyState message="No postings yet." />;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Company</th>
            <th scope="col">City</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.title}</td>
              <td>{job.company}</td>
              <td>{job.city ?? <span className="muted">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
