import type { JobPosting } from "@/models/JobPosting";

// A user's job postings as a table (title, company, city), or a short message if there are none.
export default function JobPostingTable({ jobs }: { jobs: JobPosting[] }) {
  if (jobs.length === 0) {
    return <p className="empty">No job postings yet.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Company</th>
            <th>City</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.title}</td>
              <td>{job.company}</td>
              <td>{job.city ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
