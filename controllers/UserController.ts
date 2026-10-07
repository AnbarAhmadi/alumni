// Web controller: used by the /users pages and their server actions.
// Returns plain data or a result object; no JSON or HTTP response code.
// All data access goes through UserModel.
import { UserModel, ValidationError, type User } from "@/models/User";
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

// Runs a model call and turns a ValidationError into { ok: false, error, field }.
function attempt<T>(action: () => T | null, notFoundMessage = "Not found."): Result<T> {
  try {
    const data = action();
    if (data === null) return { ok: false, error: notFoundMessage };
    return { ok: true, data };
  } catch (err) {
    if (err instanceof ValidationError) return { ok: false, error: err.message, field: err.field };
    throw err;
  }
}

export function index(): Result<User[]> {
  return { ok: true, data: UserModel.getAll() };
}

export function show(id: string | number): Result<User> {
  const user = UserModel.getById(toId(id));
  if (!user) return { ok: false, error: `User "${id}" not found.` };
  return { ok: true, data: user };
}

export function create(formData: FormData): Result<User> {
  return attempt(() => UserModel.create(formDataToObject(formData)));
}

// The edit form sends the fields to change; empty fields are left as they were.
export function update(id: string | number, formData: FormData): Result<User> {
  return attempt(
    () => UserModel.update(toId(id), formDataToObject(formData)),
    `User "${id}" not found.`,
  );
}

export function remove(id: string | number): Result<null> {
  if (!UserModel.remove(toId(id))) return { ok: false, error: `User "${id}" not found.` };
  return { ok: true, data: null };
}
