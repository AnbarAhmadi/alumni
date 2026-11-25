// Web controller for the admin panel (Week 10): the /admin dashboard and /admin/users.
// Access (admin only) is checked by the pages and actions with lib/guard.ts; this file
// only calls the models and returns plain data or a result object. Never passwordHash.
import { AnnouncementModel, type Announcement } from "@/models/Announcement";
import { ApplicationModel, type Application, type ApplicationWithDetails } from "@/models/Application";
import { JobPostingModel, type JobPosting, type JobPostingWithOwner } from "@/models/JobPosting";
import { SAFETY, SafetyError, UserModel, ValidationError, type Actor, type Role, type UserAccount } from "@/models/User";
import { formDataToObject } from "@/lib/parseBody";
import * as AnnouncementController from "./AnnouncementController";
import * as UserController from "./UserController";
import type { Result } from "./UserController";

export type DashboardCounts = {
  roles: Record<Role, number>;
  users: number;
  announcements: number;
  jobPostings: number;
  applications: number;
};

export async function dashboard(): Promise<DashboardCounts> {
  const [roles, announcements, jobPostings, applications] = await Promise.all([
    UserModel.countByRole(),
    AnnouncementModel.count(),
    JobPostingModel.count(),
    ApplicationModel.count(),
  ]);
  return { roles, users: roles.ADMIN + roles.ALUMNI + roles.STUDENT, announcements, jobPostings, applications };
}

export async function users(): Promise<UserAccount[]> {
  return UserModel.getAllAccounts();
}

// The messages the /admin/users page can show after a redirect, by a short code in the URL
// (?blocked=self-delete), so a safety rule's message survives the redirect without JavaScript.
export const BLOCKED = {
  "self-delete": SAFETY.selfDelete,
  "last-admin-delete": SAFETY.lastAdminDelete,
  "last-admin-demote": SAFETY.lastAdminDemote,
} as const;
export type BlockedCode = keyof typeof BLOCKED;

export function blockedCode(message: string | undefined): BlockedCode | undefined {
  return (Object.keys(BLOCKED) as BlockedCode[]).find((code) => BLOCKED[code] === message);
}

// The role form of one row: { role }. A safety rule or a bad role gives { ok: false, error }.
export async function changeRole(id: number, formData: FormData): Promise<Result<UserAccount>> {
  try {
    const user = await UserModel.changeRole(id, formDataToObject(formData));
    return user ? { ok: true, data: user } : { ok: false, error: `User "${id}" not found.` };
  } catch (err) {
    if (err instanceof SafetyError || err instanceof ValidationError) return { ok: false, error: err.message };
    throw err;
  }
}

// Delete from the panel: the same model function (and safety rules) as everywhere else.
export async function remove(id: number, actor: Actor): Promise<Result<null>> {
  return UserController.remove(id, actor);
}

// ---------- Announcements (/admin/announcements, Week 10 part 2) ----------

// Newest first, like the public list.
export async function announcements(): Promise<Announcement[]> {
  const all = await AnnouncementModel.getAll();
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
}

// The same model functions as the /announcements forms and the API.
export const createAnnouncement = AnnouncementController.create;
export const removeAnnouncement = AnnouncementController.remove;

// ---------- Job postings (/admin/jobs) ----------

export async function jobs(): Promise<JobPostingWithOwner[]> {
  return JobPostingModel.getAllWithOwner();
}

export async function job(id: string): Promise<JobPosting | null> {
  return /^\d+$/.test(id) ? JobPostingModel.getById(Number(id)) : null;
}

// Everyone who can own a posting (the owner dropdown): id and name only.
export async function owners(): Promise<{ id: number; fullName: string }[]> {
  return (await UserModel.getAll()).map(({ id, fullName }) => ({ id, fullName }));
}

// Runs a model call and turns a ValidationError into { ok: false, error, field }.
async function attempt<T>(action: () => Promise<T | null>, notFound: string): Promise<Result<T>> {
  try {
    const data = await action();
    return data === null ? { ok: false, error: notFound } : { ok: true, data };
  } catch (err) {
    if (err instanceof ValidationError) return { ok: false, error: err.message, field: err.field };
    throw err;
  }
}

// The admin chooses the owner (userId) in the form; it must be an existing user.
export async function createJob(formData: FormData): Promise<Result<JobPosting>> {
  return attempt(() => JobPostingModel.create(formDataToObject(formData)), "Not found.");
}

// Only the filled-in fields change, like the other edit forms.
export async function updateJob(id: number, formData: FormData): Promise<Result<JobPosting>> {
  return attempt(() => JobPostingModel.update(id, formDataToObject(formData)), `Job posting "${id}" not found.`);
}

export async function removeJob(id: number): Promise<boolean> {
  return JobPostingModel.remove(id);
}

// ---------- Applications (/admin/applications) ----------

export async function applications(): Promise<ApplicationWithDetails[]> {
  return ApplicationModel.getAllWithDetails();
}

// The status dropdown of one row: applied, reviewed, hired or rejected (checked in the model).
export async function changeApplicationStatus(id: number, formData: FormData): Promise<Result<Application>> {
  const status = formData.get("status");
  return attempt(
    () => ApplicationModel.update(id, { status: typeof status === "string" ? status : "" }),
    `Application "${id}" not found.`,
  );
}

export async function removeApplication(id: number): Promise<boolean> {
  return ApplicationModel.remove(id);
}
