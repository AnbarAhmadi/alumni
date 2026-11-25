// API controller for login, logout and the current user (Week 10, ddd.md "Login and sessions").
// Same JSON error shape as the other controllers: { "error": "...", "field"?: "..." }.
// The user comes from UserModel and the session from lib/session.ts; no hash is ever returned.
import { NextResponse } from "next/server";
import { UserModel, ValidationError, type UserAccount } from "@/models/User";
import { BodyParseError, parseBody } from "@/lib/parseBody";
import { createSession, destroySession } from "@/lib/session";

// The one answer for an unknown email and a wrong password, so it never tells which.
export const LOGIN_FAILED = "Email or password is wrong.";

function errorResponse(message: string, status: number, field?: string) {
  return NextResponse.json(field ? { error: message, field } : { error: message }, { status });
}

// POST /api/login → 200 (the user, and the session cookie) | 400 (a field is missing) | 401 | 415
export async function login(request: Request) {
  try {
    const user = await UserModel.authenticate(await parseBody(request));
    if (!user) return errorResponse(LOGIN_FAILED, 401);
    await createSession(user.id);
    return NextResponse.json(user);
  } catch (err) {
    if (err instanceof ValidationError) return errorResponse(err.message, 400, err.field);
    if (err instanceof BodyParseError) return errorResponse(err.message, err.status);
    throw err;
  }
}

// POST /api/logout → 204: the session row is deleted and the cookie cleared (also when not logged in).
export async function logout() {
  await destroySession();
  return new NextResponse(null, { status: 204 });
}

// GET /api/me → 200 (the logged-in user). The route's guard (withAuth) answers 401 without
// a valid session and clears a cookie that no longer works.
export async function me(user: UserAccount) {
  return NextResponse.json(user);
}
