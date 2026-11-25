// Login sessions (Week 10, ddd.md "Login and sessions"): the session cookie and its token.
// The token is 32 random bytes (base64url) and lives only in the browser's cookie; the
// database keeps only its SHA-256 hash (models/Session.ts). Used by the /login page, the
// Log out button and the API (/api/login, /api/logout, /api/me).
//
// cookies() can be read anywhere on the server, but set only in a server action or a
// route handler, so createSession and destroySession are called only from those.
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { SessionModel } from "@/models/Session";
import { UserModel, type UserAccount } from "@/models/User";
import { SESSION_COOKIE } from "./sessionCookie";

export { SESSION_COOKIE };
const SESSION_DAYS = 7;
const SESSION_SECONDS = SESSION_DAYS * 24 * 60 * 60;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

const cookieOptions = {
  httpOnly: true, // JavaScript in the page can't read it
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  path: "/",
};

// Starts a session for the user: a new row and the cookie, both valid for 7 days.
export async function createSession(userId: number): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000);
  await SessionModel.create({ tokenHash: hashToken(token), userId, expiresAt });
  (await cookies()).set(SESSION_COOKIE, token, { ...cookieOptions, maxAge: SESSION_SECONDS });
}

// Whether the request sent a session cookie at all (valid or not).
export async function hasSessionCookie(): Promise<boolean> {
  return (await cookies()).has(SESSION_COOKIE);
}

// The logged-in user, or null when there is no cookie, no such session, or it has expired.
// An expired session's row is deleted here.
export async function getCurrentUser(): Promise<UserAccount | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await SessionModel.findByTokenHash(hashToken(token));
  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await SessionModel.removeById(session.id);
    return null;
  }
  return UserModel.getAccount(session.userId);
}

// Logs out: deletes the session's row (if any) and clears the cookie.
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await SessionModel.removeByTokenHash(hashToken(token));
  cookieStore.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}
