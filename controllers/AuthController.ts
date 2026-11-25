// Web controller for the /login form, the Log out button and the header (Week 10).
// Same model function and session helper as the API (ApiAuthController); returns
// a result object instead of an HTTP response.
import { UserModel, ValidationError, type UserAccount } from "@/models/User";
import { formDataToObject } from "@/lib/parseBody";
import { currentUser as cachedCurrentUser } from "@/lib/guard";
import { createSession, destroySession } from "@/lib/session";
import { LOGIN_FAILED } from "./ApiAuthController";
import type { Result } from "./UserController";

// Logs in with the form's email and password and starts a session.
// A missing field names the field; anything else gives the one generic error.
export async function login(formData: FormData): Promise<Result<UserAccount>> {
  try {
    const user = await UserModel.authenticate(formDataToObject(formData));
    if (!user) return { ok: false, error: LOGIN_FAILED };
    await createSession(user.id);
    return { ok: true, data: user };
  } catch (err) {
    if (err instanceof ValidationError) return { ok: false, error: err.message, field: err.field };
    throw err;
  }
}

// Logs in a user who has just registered (no password check needed: they just set it).
export async function startSession(userId: number): Promise<void> {
  await createSession(userId);
}

export async function logout(): Promise<void> {
  await destroySession();
}

// The logged-in user for the header, or null. The same lookup as the access guard,
// done once per request (lib/guard.ts currentUser).
export async function currentUser(): Promise<UserAccount | null> {
  return cachedCurrentUser();
}
