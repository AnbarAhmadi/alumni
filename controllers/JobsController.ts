// For /jobs (Week 10): every job posting with its poster's name, and Apply. The applicant
// is always the SESSION user (the caller passes the guard's user), never an id from the form.
import { ApplicationModel, ConflictError, ValidationError } from "@/models/Application";
import { JobPostingModel, type JobPostingWithOwner } from "@/models/JobPosting";

export type JobListItem = JobPostingWithOwner & { applied: boolean };

// Newest first, each marked if this user already applied to it.
export async function list(userId: number): Promise<JobListItem[]> {
  const [postings, mine] = await Promise.all([JobPostingModel.getAllWithOwner(), ApplicationModel.getAllByUser(userId)]);
  const applied = new Set(mine.map((a) => a.jobPostingId));
  return postings.map((posting) => ({ ...posting, applied: applied.has(posting.id) }));
}

// Same model call and duplicate rule as POST /api/jobs/[id]/applications: status is
// always "applied" (the database default); a second application gives "already".
export async function apply(userId: number, jobPostingId: number): Promise<"applied" | "already" | "missing"> {
  if (!(await JobPostingModel.getById(jobPostingId))) return "missing";
  try {
    await ApplicationModel.create({ userId, jobPostingId });
    return "applied";
  } catch (err) {
    if (err instanceof ConflictError) return "already";
    if (err instanceof ValidationError) return "missing";
    throw err;
  }
}
