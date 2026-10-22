// Web controller: used by the /users pages and their server actions.
// Returns plain data or a result object; no JSON or HTTP response code.
// All data access goes through UserModel.
import { ConflictError, UserModel, ValidationError, type User, type UserWithJobs } from "@/models/User";
import { formDataToObject } from "@/lib/parseBody";

export type Result<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  field?: string; // which form field the error is about, if any
};

function toId(id: string | number) {
  return typeof id === "number" ? id : /^\d+$/.test(id) ? Number(id) : NaN;
}

// Runs a model call and turns a ValidationError or ConflictError (duplicate email) into { ok: false, error, field }.
async function attempt<T>(action: () => Promise<T | null>, notFoundMessage = "Not found."): Promise<Result<T>> {
  try {
    const data = await action();
    if (data === null) return { ok: false, error: notFoundMessage };
    return { ok: true, data };
  } catch (err) {
    if (err instanceof ValidationError || err instanceof ConflictError) return { ok: false, error: err.message, field: err.field };
    throw err;
  }
}

export async function index(): Promise<Result<User[]>> {
  return { ok: true, data: await UserModel.getAll() };
}

export async function show(id: string | number): Promise<Result<User>> {
  const user = await UserModel.getById(toId(id));
  if (!user) return { ok: false, error: `User "${id}" not found.` };
  return { ok: true, data: user };
}

// The user with their job postings (same model function as GET /api/users/:id), for the /users/[id] page.
export async function showWithJobs(id: string | number): Promise<Result<UserWithJobs>> {
  const user = await UserModel.getByIdWithJobs(toId(id));
  if (!user) return { ok: false, error: `User "${id}" not found.` };
  return { ok: true, data: user };
}

export async function create(formData: FormData): Promise<Result<User>> {
  return attempt(() => UserModel.create(formDataToObject(formData)));
}

// The edit form sends the fields to change; empty fields are left as they were.
export async function update(id: string | number, formData: FormData): Promise<Result<User>> {
  return attempt(
    () => UserModel.update(toId(id), formDataToObject(formData)),
    `User "${id}" not found.`,
  );
}

export async function remove(id: string | number): Promise<Result<null>> {
  if (!(await UserModel.remove(toId(id)))) return { ok: false, error: `User "${id}" not found.` };
  return { ok: true, data: null };
}
