// Web controller: used by the /announcements pages and their server actions.
// Returns plain data or a result object; no JSON or HTTP response code.
// All data access goes through AnnouncementModel.
import { AnnouncementModel, ValidationError, type Announcement } from "@/models/Announcement";
import { formDataToObject } from "@/lib/parseBody";
import type { Result } from "./UserController";

export type { Result };

function toId(id: string | number) {
  return typeof id === "number" ? id : /^\d+$/.test(id) ? Number(id) : NaN;
}

// Runs a model call and turns a ValidationError into { ok: false, error, field }.
async function attempt<T>(action: () => Promise<T | null>, notFoundMessage = "Not found."): Promise<Result<T>> {
  try {
    const data = await action();
    if (data === null) return { ok: false, error: notFoundMessage };
    return { ok: true, data };
  } catch (err) {
    if (err instanceof ValidationError) return { ok: false, error: err.message, field: err.field };
    throw err;
  }
}

export async function index(): Promise<Result<Announcement[]>> {
  return { ok: true, data: await AnnouncementModel.getAll() };
}

export async function show(id: string | number): Promise<Result<Announcement>> {
  const announcement = await AnnouncementModel.getById(toId(id));
  if (!announcement) return { ok: false, error: `Announcement "${id}" not found.` };
  return { ok: true, data: announcement };
}

export async function create(formData: FormData): Promise<Result<Announcement>> {
  return attempt(() => AnnouncementModel.create(formDataToObject(formData)));
}

// The edit form sends the fields to change; empty fields are left as they were.
export async function update(id: string | number, formData: FormData): Promise<Result<Announcement>> {
  return attempt(
    () => AnnouncementModel.update(toId(id), formDataToObject(formData)),
    `Announcement "${id}" not found.`,
  );
}

export async function remove(id: string | number): Promise<Result<null>> {
  if (!(await AnnouncementModel.remove(toId(id)))) return { ok: false, error: `Announcement "${id}" not found.` };
  return { ok: true, data: null };
}
