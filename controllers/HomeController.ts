// Web controller for the homepage: read-only numbers and the newest records.
// It only reads; it never creates, changes or deletes anything.
// All data access goes through the models.
import { AnnouncementModel, type Announcement } from "@/models/Announcement";
import { JobPostingModel, type JobPosting } from "@/models/JobPosting";
import { UserModel } from "@/models/User";
import type { Result } from "./UserController";

export type HomeOverview = {
  counts: { users: number; announcements: number; jobPostings: number };
  latestAnnouncements: Announcement[];
  latestJobPostings: JobPosting[];
};

const LATEST = 3;

// If the database can't be reached, the homepage still renders without the numbers
// and lists: the error is printed in the terminal and returned as { ok: false }.
export async function overview(): Promise<Result<HomeOverview>> {
  try {
    const [users, announcements, jobPostings, latestAnnouncements, latestJobPostings] = await Promise.all([
      UserModel.count(),
      AnnouncementModel.count(),
      JobPostingModel.count(),
      AnnouncementModel.getLatest(LATEST),
      JobPostingModel.getLatest(LATEST),
    ]);
    return {
      ok: true,
      data: { counts: { users, announcements, jobPostings }, latestAnnouncements, latestJobPostings },
    };
  } catch (err) {
    console.error("Homepage: could not load the overview:", err);
    return { ok: false, error: "We can't show the latest numbers right now." };
  }
}
