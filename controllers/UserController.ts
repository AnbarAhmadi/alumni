// Web controller: used by the /users/[id]/edit page and the /users server actions
// (create, update, delete). Reading the list and the profile goes through
// UserDirectoryController. Returns plain data or a result object; no JSON or HTTP
// response code. All data access goes through UserModel.
import {
  ConflictError,
  RegistrationError,
  SafetyError,
  UserModel,
  type Actor,
  ValidationError,
  type FieldError,
  type UserAccount,
  type User,
} from "@/models/User";
import { formDataToObject } from "@/lib/parseBody";

export type Result<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  field?: string; // which form field the error is about, if any
  errors?: FieldError[]; // every invalid field, for forms that show them all (register)
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

export async function show(id: string | number): Promise<Result<User>> {
  const user = await UserModel.getById(toId(id));
  if (!user) return { ok: false, error: `User "${id}" not found.` };
  return { ok: true, data: user };
}

export async function create(formData: FormData): Promise<Result<User>> {
  return attempt(() => UserModel.create(formDataToObject(formData)));
}

// The /register form (Week 10): same model function as POST /api/register.
// On an error, errors lists every invalid field (a taken email is one error on "email").
export async function register(formData: FormData): Promise<Result<UserAccount>> {
  try {
    return { ok: true, data: await UserModel.register(formDataToObject(formData)) };
  } catch (err) {
    if (err instanceof RegistrationError) return { ok: false, error: err.message, field: err.field, errors: err.errors };
    if (err instanceof ValidationError || err instanceof ConflictError) {
      const errors = err.field ? [{ field: err.field, message: err.message }] : [];
      return { ok: false, error: err.message, field: err.field, errors };
    }
    throw err;
  }
}

// The edit form sends the fields to change; empty fields are left as they were.
export async function update(id: string | number, formData: FormData): Promise<Result<User>> {
  return attempt(
    () => UserModel.update(toId(id), formDataToObject(formData)),
    `User "${id}" not found.`,
  );
}

// `actor` is the logged-in user: the safety rules (ddd.md) may refuse the delete, and the
// result then carries their message.
export async function remove(id: string | number, actor: Actor = null): Promise<Result<null>> {
  try {
    if (!(await UserModel.remove(toId(id), actor))) return { ok: false, error: `User "${id}" not found.` };
  } catch (err) {
    if (err instanceof SafetyError) return { ok: false, error: err.message };
    throw err;
  }
  return { ok: true, data: null };
}
